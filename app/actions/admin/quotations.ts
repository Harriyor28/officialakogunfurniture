"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { quotationSchema } from "@/lib/validation";
import { nextQuotationReference } from "@/lib/reference";
import { audit } from "@/lib/audit";
import { sendEmail } from "@/lib/email";
import { getBusinessSettings } from "@/lib/settings";
import { QUOTATION_STATUSES } from "@/lib/constants";
import type { AdminFormState } from "@/app/actions/admin/projects";
export type { AdminFormState };

function values(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

export async function saveQuotationAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await requirePermission("quotations.manage");
  const quotationId = String(formData.get("id") ?? "");

  const itemDescriptions = formData.getAll("itemDescription").map(String);
  const itemQuantities = formData.getAll("itemQuantity").map(Number);
  const itemPrices = formData.getAll("itemUnitPrice").map(Number);
  const items = itemDescriptions
    .map((description, index) => ({
      description: description.trim(),
      quantity: itemQuantities[index] ?? 1,
      unitPrice: itemPrices[index] ?? 0,
      order: index,
    }))
    .filter((item) => item.description.length > 0);

  const raw = values(formData);
  const parsed = quotationSchema.safeParse({
    ...raw,
    items,
    discount: raw.discount || "0",
    delivery: raw.delivery || "0",
  });
  if (!parsed.success) {
    return { error: "Check the quotation fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  if (quotationId) {
    const existing = await prisma.quotation.findUnique({ where: { id: quotationId } });
    if (!existing) return { error: "Quotation not found." };
  } else {
    const enquiry = await prisma.enquiry.findUnique({ where: { id: data.enquiryId } });
    if (!enquiry) return { fieldErrors: { enquiryId: ["Select a valid enquiry."] }, error: "Enquiry not found." };
  }

  const payload = {
    status: QUOTATION_STATUSES.some((s) => s.value === data.status) ? data.status : "DRAFT",
    validUntil: data.validUntil ? new Date(data.validUntil) : null,
    subtotal,
    discount: data.discount,
    delivery: data.delivery,
    notes: data.notes || null,
    terms: data.terms || null,
  };

  let quotation;
  try {
    if (quotationId) {
      quotation = await prisma.quotation.update({
        where: { id: quotationId },
        data: { ...payload, items: { deleteMany: {}, create: items } },
      });
      await audit({ userId: user.id, action: "quotation.updated", entity: "Quotation", entityId: quotationId });
    } else {
      const reference = await nextQuotationReference();
      quotation = await prisma.quotation.create({
        data: { reference, enquiryId: data.enquiryId, ...payload, items: { create: items } },
      });
      await prisma.enquiry.update({
        where: { id: data.enquiryId },
        data: { status: payload.status === "DRAFT" ? "QUOTATION_PREPARED" : "QUOTATION_SENT" },
      });
      await audit({ userId: user.id, action: "quotation.created", entity: "Quotation", entityId: quotation.id, meta: { reference } });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "Reference collision — please retry." };
    }
    throw error;
  }

  revalidatePath("/admin/quotations");
  revalidatePath(`/admin/quotations/${quotation.id}`);
  revalidatePath("/admin/enquiries");
  return { success: `Quotation ${quotation.reference} saved.` };
}

/** Mark as sent ONLY after the email provider confirms delivery. */
export async function markQuotationSentAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await requirePermission("quotations.manage");
  const quotationId = String(formData.get("quotationId") ?? "");
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { enquiry: true, items: true },
  });
  if (!quotation) return { error: "Quotation not found." };

  const settings = await getBusinessSettings();
  const total = quotation.subtotal - quotation.discount + quotation.delivery;
  const lines = quotation.items
    .map((item) => `- ${item.description} × ${item.quantity} @ ${item.unitPrice} = ${item.quantity * item.unitPrice}`)
    .join("\n");

  const status = await sendEmail({
    to: quotation.enquiry.email,
    subject: `Quotation ${quotation.reference} — ${settings.businessName}`,
    text: `Hello ${quotation.enquiry.name},\n\nPlease find your quotation below.\n\nReference: ${quotation.reference}\n${lines}\n\nSubtotal: ${quotation.subtotal}\nDelivery: ${quotation.delivery}\nTotal: ${total}\n\n${quotation.notes ?? ""}\n\nKind regards,\n${settings.businessName}`,
    relatedType: "Quotation",
    relatedId: quotation.id,
  });

  if (status !== "SENT") {
    await audit({ userId: user.id, action: "quotation.sendFailed", entity: "Quotation", entityId: quotationId, meta: { status } });
    return {
      error:
        "Email could not be delivered (provider not configured or failed). The quotation was NOT marked as sent — use Download PDF and send it manually.",
    };
  }

  await prisma.$transaction([
    prisma.quotation.update({ where: { id: quotation.id }, data: { status: "SENT" } }),
    prisma.enquiry.update({ where: { id: quotation.enquiryId }, data: { status: "QUOTATION_SENT" } }),
  ]);
  await audit({ userId: user.id, action: "quotation.sent", entity: "Quotation", entityId: quotationId });
  revalidatePath(`/admin/quotations/${quotationId}`);
  return { success: "Quotation emailed to the customer and marked as sent." };
}

export async function recordQuotationDecisionAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await requirePermission("quotations.manage");
  const quotationId = String(formData.get("quotationId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!["APPROVED", "DECLINED"].includes(decision)) return { error: "Unknown decision." };

  const quotation = await prisma.quotation.findUnique({ where: { id: quotationId } });
  if (!quotation) return { error: "Quotation not found." };

  await prisma.$transaction([
    prisma.quotation.update({ where: { id: quotationId }, data: { status: decision } }),
    prisma.enquiry.update({ where: { id: quotation.enquiryId }, data: { status: decision } }),
  ]);
  await audit({
    userId: user.id,
    action: `quotation.${decision.toLowerCase()}Recorded`,
    entity: "Quotation",
    entityId: quotationId,
  });
  revalidatePath(`/admin/quotations/${quotationId}`);
  return { success: `Quotation marked as ${decision.toLowerCase()}.` };
}
