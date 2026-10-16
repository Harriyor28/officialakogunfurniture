"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { audit } from "@/lib/audit";
import { notifyAdmins } from "@/lib/email";

export type PortalActionState = { error?: string; success?: string };

/**
 * A customer accepts their own quotation. Staff still convert it into a
 * tracked project from the admin dashboard.
 */
export async function approveQuotationAction(
  _prev: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/portal");

  const quotationId = String(formData.get("quotationId") ?? "");
  if (!quotationId) return { error: "Missing quotation." };

  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { enquiry: true },
  });

  // Strict ownership check: the quotation must belong to this customer's email.
  if (!quotation || quotation.enquiry.email.toLowerCase() !== user.email.toLowerCase()) {
    return { error: "You do not have access to this quotation." };
  }
  if (quotation.status === "APPROVED" || quotation.status === "CONVERTED") {
    return { error: "This quotation has already been accepted." };
  }
  if (quotation.status === "DECLINED" || quotation.status === "EXPIRED") {
    return { error: "This quotation can no longer be accepted. Please request a new one." };
  }

  await prisma.$transaction([
    prisma.quotation.update({ where: { id: quotation.id }, data: { status: "APPROVED" } }),
    prisma.enquiry.update({ where: { id: quotation.enquiryId }, data: { status: "APPROVED" } }),
  ]);

  await audit({
    userId: user.id,
    action: "quotation.approvedByCustomer",
    entity: "Quotation",
    entityId: quotation.id,
    meta: { reference: quotation.reference },
  });

  await notifyAdmins(
    `Quotation ${quotation.reference} approved by customer`,
    `${user.name} (${user.email}) accepted quotation ${quotation.reference} for enquiry ${quotation.enquiry.reference}.\nTotal: ${quotation.subtotal - quotation.discount + quotation.delivery}.\nConvert it to a project in the dashboard.`,
    "Quotation",
    quotation.id,
  );

  return { success: `Quotation ${quotation.reference} accepted. Our team will contact you to confirm next steps.` };
}
