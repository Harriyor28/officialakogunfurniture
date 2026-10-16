"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { enquiryStatusSchema } from "@/lib/validation";
import { ENQUIRY_STATUSES } from "@/lib/constants";
import { audit } from "@/lib/audit";
import { sendEmail } from "@/lib/email";
import { getBusinessSettings } from "@/lib/settings";
import type { AdminFormState } from "@/app/actions/admin/projects";
export type { AdminFormState };

function values(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

export async function updateEnquiryAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await requirePermission("enquiries.manage");
  const parsed = enquiryStatusSchema.safeParse(values(formData));
  if (!parsed.success) {
    return { error: "Invalid input.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { enquiryId, status, internalNotes, assignedToId } = parsed.data;

  if (!ENQUIRY_STATUSES.some((s) => s.value === status)) {
    return { error: "Unknown status." };
  }

  const enquiry = await prisma.enquiry.findUnique({ where: { id: enquiryId } });
  if (!enquiry) return { error: "Enquiry not found." };

  await prisma.enquiry.update({
    where: { id: enquiryId },
    data: {
      status,
      internalNotes: internalNotes ?? enquiry.internalNotes,
      assignedToId: assignedToId || null,
    },
  });

  await audit({
    userId: user.id,
    action: "enquiry.statusChanged",
    entity: "Enquiry",
    entityId: enquiryId,
    meta: { from: enquiry.status, to: status, reference: enquiry.reference },
  });

  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${enquiryId}`);
  return { success: `Enquiry ${enquiry.reference} updated.` };
}

/** Email the customer from the dashboard. Only claims success when the provider confirms. */
export async function sendEnquiryEmailAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await requirePermission("enquiries.manage");
  const enquiryId = String(formData.get("enquiryId") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (!enquiryId || message.length < 5) return { error: "Write a message before sending." };

  const enquiry = await prisma.enquiry.findUnique({ where: { id: enquiryId } });
  if (!enquiry) return { error: "Enquiry not found." };

  const settings = await getBusinessSettings();
  const status = await sendEmail({
    to: enquiry.email,
    subject: `Update on your enquiry ${enquiry.reference}`,
    text: `Hello ${enquiry.name},\n\n${message}\n\nKind regards,\n${settings.businessName}`,
    relatedType: "Enquiry",
    relatedId: enquiry.id,
  });

  await audit({ userId: user.id, action: "enquiry.emailSent", entity: "Enquiry", entityId: enquiryId, meta: { status } });

  if (status === "SENT") return { success: "Email sent." };
  if (status === "SKIPPED") {
    return {
      success:
        "Email provider is not configured, so the message was recorded in the notification log but NOT sent.",
    };
  }
  return { error: "The email provider rejected the message. It was logged as FAILED." };
}
