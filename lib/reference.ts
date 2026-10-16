import { prisma } from "@/lib/prisma";

async function nextSequence(kind: string): Promise<number> {
  const year = new Date().getFullYear();
  const key = `seq:${kind}:${year}`;
  const updated = await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: "1" },
    update: {},
  });
  const current = Number(updated.value) || 1;
  await prisma.siteSetting.update({ where: { key }, data: { value: String(current + 1) } });
  return current;
}

function pad(n: number, width = 4): string {
  return String(n).padStart(width, "0");
}

export async function nextEnquiryReference(): Promise<string> {
  const year = new Date().getFullYear();
  return `AKQ-${year}-${pad(await nextSequence("enquiry"))}`;
}

export async function nextQuotationReference(): Promise<string> {
  const year = new Date().getFullYear();
  return `AKQT-${year}-${pad(await nextSequence("quotation"))}`;
}

export async function nextProjectReference(): Promise<string> {
  const year = new Date().getFullYear();
  return `AKP-${year}-${pad(await nextSequence("project"))}`;
}
