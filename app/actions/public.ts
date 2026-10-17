"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { contactSchema, enquirySchema } from "@/lib/validation";
import { nextEnquiryReference } from "@/lib/reference";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { savePrivateAttachment } from "@/lib/upload";
import { notifyAdmins, sendEmail } from "@/lib/email";
import { getBusinessSettings } from "@/lib/settings";
import { audit } from "@/lib/audit";
import { getSiteUrl } from "@/lib/site-url";

export type EnquiryState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  reference?: string;
};

const MAX_FILES = 5;

function stringValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}

export async function submitEnquiryAction(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const ip = clientIp(await headers());
  if (!rateLimit(`enquiry:${ip}`, 6, 10 * 60_000)) {
    return { error: "Too many enquiries from this connection. Please try again shortly." };
  }

  const parsed = enquirySchema.safeParse(stringValues(formData));
  if (!parsed.success) {
    return { error: "Please check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const files = formData
    .getAll("attachments")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)
    .slice(0, MAX_FILES);

  const attachments: Array<{ url: string; filename: string; size: number }> = [];
  for (const file of files) {
    const saved = await savePrivateAttachment(file);
    if (saved) attachments.push(saved);
  }

  const reference = await nextEnquiryReference();
  const preferredDate = data.preferredDate ? new Date(data.preferredDate) : null;

  const enquiry = await prisma.enquiry.create({
    data: {
      reference,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      preferredContact: data.preferredContact,
      serviceCategory: data.serviceCategory,
      furnitureType: data.furnitureType || null,
      title: data.title || null,
      requirements: data.requirements,
      dimensions: data.dimensions || null,
      materials: data.materials || null,
      quantity: Number.isFinite(data.quantity) ? (data.quantity as number) : null,
      budgetRange: data.budgetRange || null,
      location: data.location || null,
      preferredDate: preferredDate && !Number.isNaN(preferredDate.getTime()) ? preferredDate : null,
      comments: data.comments || null,
      privacyAccepted: true,
      status: "NEW",
      attachments: attachments.length
        ? { create: attachments }
        : undefined,
    },
  });

  const settings = await getBusinessSettings();
  const siteUrl = getSiteUrl();

  await sendEmail({
    to: enquiry.email,
    subject: `We received your enquiry — ${enquiry.reference}`,
    text: `Hello ${enquiry.name},\n\nThank you for contacting ${settings.businessName}. Your enquiry reference is ${enquiry.reference}.\n\nOur team will review your requirements and respond using your preferred contact method (${enquiry.preferredContact.toLowerCase()}).\n\nYou can follow progress after creating an account at ${siteUrl}/portal.\n\nKind regards,\n${settings.businessName}`,
    relatedType: "Enquiry",
    relatedId: enquiry.id,
  });

  await notifyAdmins(
    `New enquiry ${enquiry.reference} — ${enquiry.serviceCategory}`,
    `Customer: ${enquiry.name}\nEmail: ${enquiry.email}\nPhone: ${enquiry.phone}\nPreferred contact: ${enquiry.preferredContact}\n\nRequirements:\n${enquiry.requirements}`,
    "Enquiry",
    enquiry.id,
  );

  await audit({ action: "enquiry.created", entity: "Enquiry", entityId: enquiry.id, meta: { reference } });

  redirect(`/quote/success/${reference}`);
}

export async function submitContactAction(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const ip = clientIp(await headers());
  if (!rateLimit(`contact:${ip}`, 6, 10 * 60_000)) {
    return { error: "Too many messages from this connection. Please try again shortly." };
  }

  const parsed = contactSchema.safeParse(stringValues(formData));
  if (!parsed.success) {
    return { error: "Please check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const reference = await nextEnquiryReference();
  const enquiry = await prisma.enquiry.create({
    data: {
      reference,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone || "Not provided",
      preferredContact: data.phone ? "PHONE" : "EMAIL",
      serviceCategory: "General enquiry",
      requirements: data.message,
      comments: "Submitted via the contact page.",
      privacyAccepted: true,
      status: "NEW",
      source: "CONTACT",
    },
  });

  const settings = await getBusinessSettings();
  await sendEmail({
    to: enquiry.email,
    subject: `Message received — ${reference}`,
    text: `Hello ${enquiry.name},\n\nThank you for contacting ${settings.businessName}. Your message has been received (reference ${reference}) and our team will respond shortly.`,
    relatedType: "Enquiry",
    relatedId: enquiry.id,
  });
  await notifyAdmins(
    `Contact message ${reference}`,
    `From: ${enquiry.name} <${enquiry.email}>\nPhone: ${enquiry.phone}\n\n${data.message}`,
    "Enquiry",
    enquiry.id,
  );
  await audit({ action: "contact.created", entity: "Enquiry", entityId: enquiry.id, meta: { reference } });

  redirect(`/quote/success/${reference}`);
}
