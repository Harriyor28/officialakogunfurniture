import { z } from "zod";
import {
  BUDGET_RANGES,
  CONTACT_METHODS,
  PRODUCT_AVAILABILITY,
  PROJECT_STATUSES,
} from "@/lib/constants";

const phone = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number.")
  .max(25)
  .regex(/^[0-9+\-\s()]+$/, "Phone number contains invalid characters.");

const email = z.email("Enter a valid email address.").max(200);

const slug = z
  .string()
  .trim()
  .min(2)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only.");

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(150),
  email,
  phone,
  preferredContact: z.enum(CONTACT_METHODS.map((m) => m.value)),
  serviceCategory: z.string().trim().min(2, "Select a service category.").max(120),
  furnitureType: z.string().trim().max(150).optional().or(z.literal("")),
  title: z.string().trim().max(200).optional().or(z.literal("")),
  requirements: z.string().trim().min(20, "Please describe your requirements in a little more detail.").max(5000),
  dimensions: z.string().trim().max(400).optional().or(z.literal("")),
  materials: z.string().trim().max(400).optional().or(z.literal("")),
  quantity: z.coerce.number().int().min(1).max(1000).optional().or(z.nan()),
  budgetRange: z.enum(BUDGET_RANGES).optional().or(z.literal("")),
  location: z.string().trim().max(250).optional().or(z.literal("")),
  preferredDate: z.string().optional().or(z.literal("")),
  comments: z.string().trim().max(2000).optional().or(z.literal("")),
  privacyAccepted: z.coerce.boolean().refine((v) => v === true, {
    message: "You must acknowledge the privacy notice to continue.",
  }),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export const enquiryStatusSchema = z.object({
  enquiryId: z.string().min(1),
  status: z.string().min(1).max(40),
  internalNotes: z.string().trim().max(5000).optional().or(z.literal("")),
  assignedToId: z.string().optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(200),
  next: z.string().max(300).optional().or(z.literal("")),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name.").max(150),
    email,
    phone: phone.optional().or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters.").max(200),
    confirmPassword: z.string().max(200),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const passwordResetRequestSchema = z.object({ email });

export const passwordResetSchema = z
  .object({
    token: z.string().min(10),
    password: z.string().min(8, "Password must be at least 8 characters.").max(200),
    confirmPassword: z.string().max(200),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(150),
  email,
  phone: phone.optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a little more.").max(3000),
  privacyAccepted: z.coerce.boolean().refine((v) => v === true, {
    message: "You must acknowledge the privacy notice to continue.",
  }),
});

export const projectImageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().max(300).default(""),
  order: z.number().int().min(0).default(0),
});

export const portfolioProjectSchema = z.object({
  title: z.string().trim().min(2, "Enter a project title.").max(200),
  slug,
  categoryId: z.string().optional().or(z.literal("")),
  summary: z.string().trim().max(400).optional().or(z.literal("")),
  description: z.string().trim().max(8000).optional().or(z.literal("")),
  inspiration: z.string().trim().max(4000).optional().or(z.literal("")),
  materials: z.string().trim().max(2000).optional().or(z.literal("")),
  dimensions: z.string().trim().max(500).optional().or(z.literal("")),
  location: z.string().trim().max(250).optional().or(z.literal("")),
  completedAt: z.string().optional().or(z.literal("")),
  status: z.enum(PROJECT_STATUSES.map((s) => s.value)),
  published: z.coerce.boolean().default(false),
  featured: z.coerce.boolean().default(false),
  coverImage: z.string().max(500).optional().or(z.literal("")),
  seoTitle: z.string().max(200).optional().or(z.literal("")),
  seoDescription: z.string().max(400).optional().or(z.literal("")),
  images: z.array(projectImageSchema).default([]),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Enter a product name.").max(200),
  slug,
  categoryId: z.string().optional().or(z.literal("")),
  summary: z.string().trim().max(400).optional().or(z.literal("")),
  description: z.string().trim().max(8000).optional().or(z.literal("")),
  dimensions: z.string().trim().max(500).optional().or(z.literal("")),
  materials: z.string().trim().max(1000).optional().or(z.literal("")),
  colours: z.string().trim().max(500).optional().or(z.literal("")),
  priceFrom: z.coerce.number().int().min(0).optional().or(z.nan()),
  priceTo: z.coerce.number().int().min(0).optional().or(z.nan()),
  availability: z.enum(PRODUCT_AVAILABILITY.map((a) => a.value)),
  leadTime: z.string().trim().max(200).optional().or(z.literal("")),
  customisable: z.coerce.boolean().default(true),
  featured: z.coerce.boolean().default(false),
  published: z.coerce.boolean().default(false),
  seoTitle: z.string().max(200).optional().or(z.literal("")),
  seoDescription: z.string().max(400).optional().or(z.literal("")),
  images: z.array(projectImageSchema).default([]),
});

export const quotationItemSchema = z.object({
  description: z.string().trim().min(1, "Item description is required.").max(500),
  quantity: z.coerce.number().int().min(1).max(10000),
  unitPrice: z.coerce.number().int().min(0),
});

export const quotationSchema = z.object({
  enquiryId: z.string().min(1),
  status: z.string().min(1).max(40).default("DRAFT"),
  validUntil: z.string().optional().or(z.literal("")),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
  terms: z.string().trim().max(4000).optional().or(z.literal("")),
  discount: z.coerce.number().int().min(0).default(0),
  delivery: z.coerce.number().int().min(0).default(0),
  items: z.array(quotationItemSchema).min(1, "Add at least one line item."),
});

export const customerProjectSchema = z.object({
  title: z.string().trim().min(2, "Enter a project title.").max(200),
  customerEmail: z.email("Enter the customer's account email.").max(200),
  categoryId: z.string().optional().or(z.literal("")),
  enquiryId: z.string().optional().or(z.literal("")),
  quotationId: z.string().optional().or(z.literal("")),
  status: z.string().min(1).max(40),
  summary: z.string().trim().max(4000).optional().or(z.literal("")),
  specifications: z.string().trim().max(6000).optional().or(z.literal("")),
  startDate: z.string().optional().or(z.literal("")),
  expectedEndDate: z.string().optional().or(z.literal("")),
  progressPercent: z.coerce.number().int().min(0).max(100).default(0),
  nextMilestone: z.string().trim().max(300).optional().or(z.literal("")),
  internalNotes: z.string().trim().max(6000).optional().or(z.literal("")),
});

export const projectUpdateSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().trim().min(2, "Enter an update title.").max(200),
  description: z.string().trim().min(5, "Describe the progress for the customer.").max(4000),
  stage: z.string().max(40).optional().or(z.literal("")),
  imageUrl: z.string().max(500).optional().or(z.literal("")),
  visibleToCustomer: z.coerce.boolean().default(true),
});

export const milestoneSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().trim().min(2).max(200),
  dueDate: z.string().optional().or(z.literal("")),
  status: z.enum(["PENDING", "IN_PROGRESS", "DONE"]).default("PENDING"),
  visible: z.coerce.boolean().default(true),
});

export const testimonialSchema = z.object({
  authorName: z.string().trim().min(2, "Enter the customer's name.").max(150),
  projectType: z.string().trim().max(150).optional().or(z.literal("")),
  content: z.string().trim().min(10, "Enter the review text.").max(2000),
  rating: z.coerce.number().int().min(1).max(5).optional().or(z.nan()),
  imageUrl: z.string().max(500).optional().or(z.literal("")),
  approved: z.coerce.boolean().default(false),
  published: z.coerce.boolean().default(false),
});

export const blogPostSchema = z.object({
  title: z.string().trim().min(2, "Enter a title.").max(250),
  slug,
  excerpt: z.string().trim().min(10, "Write a short excerpt.").max(400),
  content: z.string().trim().min(50, "Write the article content.").max(60000),
  coverImage: z.string().max(500).optional().or(z.literal("")),
  authorName: z.string().trim().max(150).optional().or(z.literal("")),
  published: z.coerce.boolean().default(false),
  seoTitle: z.string().max(200).optional().or(z.literal("")),
  seoDescription: z.string().max(400).optional().or(z.literal("")),
});

export const staffUserSchema = z.object({
  name: z.string().trim().min(2).max(150),
  email,
  phone: phone.optional().or(z.literal("")),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "STAFF"]),
  password: z.string().min(10, "Use at least 10 characters.").max(200),
  active: z.coerce.boolean().default(true),
});

export const settingsSchema = z.object({
  businessName: z.string().trim().max(200).default("Official Akogun Furniture"),
  logoUrl: z.string().trim().max(2000).default(""),
  tagline: z.string().trim().max(300).default(""),
  phone: z.string().trim().max(40).default(""),
  whatsapp: z.string().trim().max(40).default(""),
  email: z.string().trim().max(200).default(""),
  address: z.string().trim().max(400).default(""),
  hours: z.string().trim().max(300).default(""),
  facebook: z.string().trim().max(300).default(""),
  instagram: z.string().trim().max(300).default(""),
  twitter: z.string().trim().max(300).default(""),
  aboutBody: z.string().trim().max(10000).default(""),
  footerNote: z.string().trim().max(500).default(""),
  contentIsDemo: z.coerce.boolean().default(false),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
