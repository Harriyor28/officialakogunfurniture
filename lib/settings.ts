import { prisma } from "@/lib/prisma";
import { settingsSchema, type SettingsInput } from "@/lib/validation";

export const SETTING_KEYS = {
  business: "business",
  about: "about",
  process: "process",
  homepage: "homepage",
} as const;

const DEFAULT_BUSINESS: SettingsInput = {
  businessName: "Official Akogun Furniture",
  logoUrl: "",
  tagline: "Bespoke furniture, interior woodwork and custom design.",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  hours: "",
  facebook: "",
  instagram: "",
  twitter: "",
  aboutBody: "",
  footerNote: "",
  contentIsDemo: false,
};

export const DEFAULT_PROCESS_STEPS: Array<{ title: string; description: string }> = [
  { title: "Consultation", description: "We discuss your space, style, needs and budget." },
  { title: "Requirements & measurements", description: "We capture precise measurements and requirements on site." },
  { title: "Design proposal", description: "Our team prepares a design proposal tailored to your space." },
  { title: "Quotation & approval", description: "You receive a detailed quotation to review and approve." },
  { title: "Material selection", description: "We confirm materials, finishes and hardware together." },
  { title: "Furniture production", description: "Craftsmen build your furniture in our workshop." },
  { title: "Finishing & quality checks", description: "Every piece is finished and inspected before it leaves." },
  { title: "Delivery & installation", description: "We deliver and install with care in your space." },
  { title: "Customer handover", description: "Final walkthrough, care guidance and handover." },
];

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  if (!row) return fallback;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}

export async function getBusinessSettings(): Promise<SettingsInput> {
  const stored = await readJson<Partial<SettingsInput>>(SETTING_KEYS.business, {});
  const merged = { ...DEFAULT_BUSINESS, ...stored };
  // Environment variables act as an override so contact details can be
  // configured without database access during initial setup.
  return {
    ...merged,
    phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || merged.phone,
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || merged.whatsapp,
    email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || merged.email,
  };
}

export async function getProcessSteps(): Promise<Array<{ title: string; description: string }>> {
  const steps = await readJson<Array<{ title: string; description: string }>>(
    SETTING_KEYS.process,
    DEFAULT_PROCESS_STEPS,
  );
  return Array.isArray(steps) && steps.length > 0 ? steps : DEFAULT_PROCESS_STEPS;
}

export type HomepageCopy = {
  heroHeadline: string;
  heroSub: string;
  ctaHeadline: string;
  ctaSub: string;
  heroVideoUrl: string;
  heroVideoPoster: string;
};

export async function getHomepageCopy(): Promise<HomepageCopy> {
  return readJson<HomepageCopy>(`${SETTING_KEYS.homepage}:copy`, {
    heroHeadline: "Furniture with presence. Made for living.",
    heroSub:
      "Considered forms and made-to-measure furniture, shaped around the spaces and rituals of everyday life.",
    ctaHeadline: "Make room for something considered.",
    ctaSub:
      "Share the space, the feeling and the details you have in mind. We’ll help shape a piece around them.",
    heroVideoUrl: "/demo/atelier-motion.mp4",
    heroVideoPoster: "/demo/workshop-1.svg",
  });
}

export async function setJsonSetting(key: string, value: unknown): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: JSON.stringify(value) },
    update: { value: JSON.stringify(value) },
  });
}

export async function saveBusinessSettings(input: SettingsInput): Promise<void> {
  const parsed = settingsSchema.parse(input);
  await setJsonSetting(SETTING_KEYS.business, parsed);
}

export async function isDemoContent(): Promise<boolean> {
  const settings = await getBusinessSettings();
  return settings.contentIsDemo;
}
