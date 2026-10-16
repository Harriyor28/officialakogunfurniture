import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getBusinessSettings } from "@/lib/settings";
import { isStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Generates a professional quotation PDF on demand.
 * Access: the owning customer, or any staff member.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quotation = await prisma.quotation.findUnique({
    where: { reference },
    include: {
      items: { orderBy: { order: "asc" } },
      enquiry: { select: { reference: true, name: true, email: true, phone: true, title: true, serviceCategory: true } },
    },
  });
  if (!quotation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = quotation.enquiry.email.toLowerCase() === user.email.toLowerCase();
  if (!isOwner && !isStaff(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const settings = await getBusinessSettings();
  const total = quotation.subtotal - quotation.discount + quotation.delivery;

  const doc = await PDFDocument.create();
  let page = doc.addPage([595, 842]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const gold = rgb(0.776, 0.651, 0.42);
  const dark = rgb(0.07, 0.07, 0.08);
  const grey = rgb(0.4, 0.4, 0.42);

  let y = 780;
  page.drawText(settings.businessName || "Official Akogun Furniture", {
    x: 50, y, size: 18, font: bold, color: dark,
  });
  y -= 22;
  page.drawText("QUOTATION", { x: 50, y, size: 12, font: bold, color: gold });
  y -= 30;

  page.drawText(`Reference: ${quotation.reference}`, { x: 50, y, size: 10, font, color: dark });
  page.drawText(`Date: ${new Date().toLocaleDateString("en-GB")}`, { x: 330, y, size: 10, font, color: dark });
  y -= 16;
  if (quotation.validUntil) {
    page.drawText(`Valid until: ${quotation.validUntil.toLocaleDateString("en-GB")}`, { x: 330, y, size: 10, font, color: dark });
  }
  y -= 30;

  page.drawText("Bill to", { x: 50, y, size: 9, font: bold, color: grey });
  y -= 14;
  page.drawText(quotation.enquiry.name, { x: 50, y, size: 10, font, color: dark });
  y -= 13;
  page.drawText(quotation.enquiry.email, { x: 50, y, size: 10, font, color: dark });
  y -= 13;
  page.drawText(quotation.enquiry.phone, { x: 50, y, size: 10, font, color: dark });
  y -= 13;
  page.drawText(`Enquiry: ${quotation.enquiry.reference} — ${quotation.enquiry.serviceCategory}`, {
    x: 50, y, size: 9, font, color: grey,
  });
  y -= 30;

  // Table header
  page.drawRectangle({ x: 50, y: y - 4, width: 495, height: 20, color: rgb(0.95, 0.94, 0.91) });
  page.drawText("Description", { x: 56, y, size: 9, font: bold, color: dark });
  page.drawText("Qty", { x: 320, y, size: 9, font: bold, color: dark });
  page.drawText("Unit", { x: 370, y, size: 9, font: bold, color: dark });
  page.drawText("Amount", { x: 470, y, size: 9, font: bold, color: dark });
  y -= 20;

  const money = (value: number) => `N${value.toLocaleString("en-NG")}`;

  for (const item of quotation.items) {
    if (y < 120) {
      page = doc.addPage([595, 842]);
      y = 780;
    }
    const description = item.description.length > 60 ? `${item.description.slice(0, 57)}...` : item.description;
    page.drawText(description, { x: 56, y, size: 9, font, color: dark });
    page.drawText(String(item.quantity), { x: 320, y, size: 9, font, color: dark });
    page.drawText(money(item.unitPrice), { x: 370, y, size: 9, font, color: dark });
    page.drawText(money(item.quantity * item.unitPrice), { x: 470, y, size: 9, font, color: dark });
    y -= 16;
  }

  y -= 8;
  page.drawLine({ start: { x: 330, y: y + 8 }, end: { x: 545, y: y + 8 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
  page.drawText(`Subtotal: ${money(quotation.subtotal)}`, { x: 380, y, size: 9, font, color: grey });
  y -= 14;
  if (quotation.discount > 0) {
    page.drawText(`Discount: -${money(quotation.discount)}`, { x: 380, y, size: 9, font, color: grey });
    y -= 14;
  }
  if (quotation.delivery > 0) {
    page.drawText(`Delivery: ${money(quotation.delivery)}`, { x: 380, y, size: 9, font, color: grey });
    y -= 14;
  }
  page.drawText(`TOTAL: ${money(total)}`, { x: 380, y, size: 11, font: bold, color: dark });
  y -= 40;

  if (quotation.notes) {
    page.drawText("Notes", { x: 50, y, size: 9, font: bold, color: grey });
    y -= 14;
    for (const line of quotation.notes.split("\n").slice(0, 6)) {
      page.drawText(line.slice(0, 95), { x: 50, y, size: 9, font, color: dark });
      y -= 13;
    }
    y -= 10;
  }
  if (quotation.terms) {
    page.drawText("Terms", { x: 50, y, size: 9, font: bold, color: grey });
    y -= 14;
    for (const line of quotation.terms.split("\n").slice(0, 8)) {
      page.drawText(line.slice(0, 95), { x: 50, y, size: 9, font, color: dark });
      y -= 13;
    }
  }

  page.drawText(`${settings.businessName} — quotation ${quotation.reference}`, {
    x: 50, y: 40, size: 8, font, color: grey,
  });

  const bytes = await doc.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${quotation.reference}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
