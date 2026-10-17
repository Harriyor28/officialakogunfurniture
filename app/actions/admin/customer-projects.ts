"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { customerProjectSchema, milestoneSchema, projectUpdateSchema } from "@/lib/validation";
import { nextProjectReference } from "@/lib/reference";
import { CUSTOMER_PROJECT_STAGES, stagePercent } from "@/lib/constants";
import { audit } from "@/lib/audit";
import { sendEmail } from "@/lib/email";
import { getBusinessSettings } from "@/lib/settings";
import { getSiteUrl } from "@/lib/site-url";
import type { AdminFormState } from "@/app/actions/admin/projects";
export type { AdminFormState };

function values(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

/** Convert an approved quotation into a tracked customer project. */
export async function convertQuotationAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await requirePermission("customerProjects.manage");
  const quotationId = String(formData.get("quotationId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!quotationId || title.length < 2) return { error: "Enter a project title." };

  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { enquiry: true, project: true },
  });
  if (!quotation) return { error: "Quotation not found." };
  if (quotation.project) return { error: "This quotation has already been converted." };

  const customer = await prisma.user.findUnique({ where: { email: quotation.enquiry.email.toLowerCase() } });
  if (!customer) {
    return {
      error:
        "No customer account exists for this email. Ask the customer to register first, then convert again.",
    };
  }

  const reference = await nextProjectReference();
  const project = await prisma.customerProject.create({
    data: {
      reference,
      title,
      customerUserId: customer.id,
      enquiryId: quotation.enquiryId,
      quotationId: quotation.id,
      status: "AWAITING_DEPOSIT",
      summary: `Created from quotation ${quotation.reference}.`,
      startDate: new Date(),
      progressPercent: stagePercent("AWAITING_DEPOSIT"),
      nextMilestone: "Awaiting deposit confirmation",
    },
  });

  await prisma.$transaction([
    prisma.quotation.update({ where: { id: quotation.id }, data: { status: "CONVERTED" } }),
    prisma.enquiry.update({ where: { id: quotation.enquiryId }, data: { status: "CONVERTED" } }),
  ]);

  await audit({
    userId: user.id,
    action: "project.convertedFromQuotation",
    entity: "CustomerProject",
    entityId: project.id,
    meta: { reference, quotation: quotation.reference },
  });

  const settings = await getBusinessSettings();
  await sendEmail({
    to: customer.email,
    subject: `Your project ${reference} has started`,
    text: `Hello ${customer.name},\n\nGreat news — project "${title}" (${reference}) has been created from quotation ${quotation.reference}.\n\nSign in at ${getSiteUrl()}/portal to follow progress.\n\nKind regards,\n${settings.businessName}`,
    relatedType: "CustomerProject",
    relatedId: project.id,
  });

  revalidatePath("/admin/customer-projects");
  revalidatePath("/admin/quotations");
  redirect(`/admin/customer-projects/${project.id}`);
}

export async function saveCustomerProjectAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await requirePermission("customerProjects.manage");
  const projectId = String(formData.get("id") ?? "");
  const parsed = customerProjectSchema.safeParse({
    ...values(formData),
    progressPercent: formData.get("progressPercent") || "0",
  });
  if (!parsed.success) {
    return { error: "Check the form fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const customer = await prisma.user.findUnique({ where: { email: data.customerEmail.toLowerCase() } });
  if (!customer || customer.role !== "CUSTOMER") {
    return { fieldErrors: { customerEmail: ["No customer account with this email."] }, error: "Customer not found." };
  }

  const payload = {
    title: data.title,
    customerUserId: customer.id,
    categoryId: data.categoryId || null,
    status: CUSTOMER_PROJECT_STAGES.some((s) => s.value === data.status) ? data.status : "CONSULTATION",
    summary: data.summary || null,
    specifications: data.specifications || null,
    startDate: data.startDate ? new Date(data.startDate) : null,
    expectedEndDate: data.expectedEndDate ? new Date(data.expectedEndDate) : null,
    progressPercent: data.progressPercent || stagePercent(data.status),
    nextMilestone: data.nextMilestone || null,
    internalNotes: data.internalNotes || null,
  };

  if (projectId) {
    await prisma.customerProject.update({ where: { id: projectId }, data: payload });
    await audit({ userId: user.id, action: "customerProject.updated", entity: "CustomerProject", entityId: projectId });
  } else {
    const reference = await nextProjectReference();
    await prisma.customerProject.create({
      data: {
        reference,
        ...payload,
        enquiryId: data.enquiryId || null,
        quotationId: data.quotationId || null,
      },
    });
    await audit({ userId: user.id, action: "customerProject.created", entity: "CustomerProject", entityId: reference });
  }

  revalidatePath("/admin/customer-projects");
  revalidatePath("/portal");
  return { success: projectId ? "Project updated." : "Project created." };
}

export async function addProjectUpdateAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await requirePermission("customerProjects.manage");
  const parsed = projectUpdateSchema.safeParse({
    ...values(formData),
    visibleToCustomer: formData.get("visibleToCustomer") !== "off",
  });
  if (!parsed.success) {
    return { error: "Check the update fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const project = await prisma.customerProject.findUnique({
    where: { id: data.projectId },
    include: { customer: true },
  });
  if (!project) return { error: "Project not found." };

  await prisma.projectUpdate.create({
    data: {
      projectId: project.id,
      title: data.title,
      description: data.description,
      stage: data.stage || null,
      imageUrl: data.imageUrl || null,
      visibleToCustomer: data.visibleToCustomer,
    },
  });

  if (data.stage && CUSTOMER_PROJECT_STAGES.some((s) => s.value === data.stage)) {
    await prisma.customerProject.update({
      where: { id: project.id },
      data: { status: data.stage, progressPercent: stagePercent(data.stage) },
    });
  }

  if (data.visibleToCustomer) {
    const settings = await getBusinessSettings();
    await sendEmail({
      to: project.customer.email,
      subject: `Project update — ${project.reference}`,
      text: `Hello ${project.customer.name},\n\nThere is a new update on project ${project.reference}:\n\n${data.title}\n${data.description}\n\nSign in to view full details: ${getSiteUrl()}/portal/projects/${project.reference}\n\nKind regards,\n${settings.businessName}`,
      relatedType: "CustomerProject",
      relatedId: project.id,
    });
  }

  await audit({ userId: user.id, action: "projectUpdate.created", entity: "CustomerProject", entityId: project.id, meta: { title: data.title } });
  revalidatePath(`/admin/customer-projects/${project.id}`);
  revalidatePath(`/portal/projects/${project.reference}`);
  return { success: "Progress update added." };
}

export async function addMilestoneAction(_prev: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const user = await requirePermission("customerProjects.manage");
  const parsed = milestoneSchema.safeParse({
    ...values(formData),
    visible: formData.get("visible") !== "off",
  });
  if (!parsed.success) {
    return { error: "Check the milestone fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  const count = await prisma.customerMilestone.count({ where: { projectId: data.projectId } });
  await prisma.customerMilestone.create({
    data: {
      projectId: data.projectId,
      name: data.name,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: data.status,
      visible: data.visible,
      order: count,
    },
  });
  await audit({ userId: user.id, action: "milestone.created", entity: "CustomerProject", entityId: data.projectId });
  revalidatePath(`/admin/customer-projects/${data.projectId}`);
  return { success: "Milestone added." };
}

export async function updateMilestoneAction(formData: FormData): Promise<void> {
  const user = await requirePermission("customerProjects.manage");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  if (!id || !["PENDING", "IN_PROGRESS", "DONE"].includes(status)) return;
  await prisma.customerMilestone.update({ where: { id }, data: { status } });
  await audit({ userId: user.id, action: "milestone.statusChanged", entity: "Milestone", entityId: id, meta: { status } });
  revalidatePath(`/admin/customer-projects/${projectId}`);
}

export async function setUpdateVisibilityAction(formData: FormData): Promise<void> {
  const user = await requirePermission("customerProjects.manage");
  const id = String(formData.get("id") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  const visible = formData.get("visible") === "true";
  if (!id) return;
  await prisma.projectUpdate.update({ where: { id }, data: { visibleToCustomer: visible } });
  await audit({ userId: user.id, action: "projectUpdate.visibility", entity: "ProjectUpdate", entityId: id, meta: { visible } });
  revalidatePath(`/admin/customer-projects/${projectId}`);
  revalidatePath("/portal");
}
