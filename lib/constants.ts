export const ROLES = ["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "STAFF", "CUSTOMER"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "projects.manage",
  "catalogue.manage",
  "enquiries.manage",
  "quotations.manage",
  "customerProjects.manage",
  "content.manage",
  "settings.manage",
  "users.manage",
  "audit.view",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [...PERMISSIONS],
  ADMIN: PERMISSIONS.filter((p) => p !== "users.manage"),
  PROJECT_MANAGER: [
    "projects.manage",
    "enquiries.manage",
    "quotations.manage",
    "customerProjects.manage",
    "content.manage",
    "audit.view",
  ],
  STAFF: ["enquiries.manage", "customerProjects.manage"],
  CUSTOMER: [],
};

export const PROJECT_STATUSES = [
  { value: "COMPLETED", label: "Completed" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "AVAILABLE_CUSTOM", label: "Available for Custom Order" },
  { value: "ARCHIVED", label: "Archived" },
] as const;

export const ENQUIRY_STATUSES = [
  { value: "NEW", label: "New" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "AWAITING_INFO", label: "Awaiting More Information" },
  { value: "QUOTATION_PREPARED", label: "Quotation Prepared" },
  { value: "QUOTATION_SENT", label: "Quotation Sent" },
  { value: "APPROVED", label: "Approved" },
  { value: "DECLINED", label: "Declined" },
  { value: "CONVERTED", label: "Converted to Project" },
  { value: "CLOSED", label: "Closed" },
] as const;

export const QUOTATION_STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "APPROVED", label: "Approved" },
  { value: "DECLINED", label: "Declined" },
  { value: "EXPIRED", label: "Expired" },
  { value: "CONVERTED", label: "Converted" },
] as const;

export const CUSTOMER_PROJECT_STAGES = [
  { value: "ENQUIRY_RECEIVED", label: "Enquiry Received", percent: 5 },
  { value: "CONSULTATION", label: "Consultation", percent: 10 },
  { value: "MEASUREMENT_DESIGN", label: "Measurement & Design", percent: 20 },
  { value: "QUOTATION_PENDING", label: "Quotation Pending", percent: 30 },
  { value: "AWAITING_APPROVAL", label: "Awaiting Customer Approval", percent: 35 },
  { value: "AWAITING_DEPOSIT", label: "Awaiting Deposit", percent: 40 },
  { value: "MATERIALS", label: "Materials Preparation", percent: 50 },
  { value: "PRODUCTION", label: "Production", percent: 65 },
  { value: "FINISHING", label: "Finishing & Quality Inspection", percent: 80 },
  { value: "READY_DELIVERY", label: "Ready for Delivery", percent: 90 },
  { value: "INSTALLATION", label: "Installation", percent: 95 },
  { value: "COMPLETED", label: "Completed", percent: 100 },
  { value: "AFTER_SALES", label: "After-Sales Support", percent: 100 },
] as const;

export type CustomerProjectStage = (typeof CUSTOMER_PROJECT_STAGES)[number]["value"];

export const PRODUCT_AVAILABILITY = [
  { value: "IN_STOCK", label: "In Stock" },
  { value: "MADE_TO_ORDER", label: "Made to Order" },
  { value: "UNAVAILABLE", label: "Currently Unavailable" },
  { value: "ASK", label: "Ask Us" },
] as const;

export const CONTACT_METHODS = [
  { value: "PHONE", label: "Phone call" },
  { value: "EMAIL", label: "Email" },
  { value: "WHATSAPP", label: "WhatsApp" },
] as const;

export const BUDGET_RANGES = [
  "Under ₦250,000",
  "₦250,000 – ₦500,000",
  "₦500,000 – ₦1,000,000",
  "₦1,000,000 – ₦2,500,000",
  "Above ₦2,500,000",
  "Prefer not to say",
] as const;

export function stageIndex(stage: string): number {
  return CUSTOMER_PROJECT_STAGES.findIndex((s) => s.value === stage);
}

export function stageLabel(stage: string): string {
  return CUSTOMER_PROJECT_STAGES.find((s) => s.value === stage)?.label ?? stage;
}

export function stagePercent(stage: string): number {
  return CUSTOMER_PROJECT_STAGES.find((s) => s.value === stage)?.percent ?? 0;
}
