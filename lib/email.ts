import { prisma } from "@/lib/prisma";

type LogInput = {
  channel: "EMAIL" | "WHATSAPP" | "SYSTEM";
  recipient: string;
  subject: string;
  body?: string;
  status: "SENT" | "SKIPPED" | "FAILED";
  error?: string;
  relatedType?: string;
  relatedId?: string;
};

/**
 * Dispatch a transactional email. Uses the Resend HTTP API when
 * RESEND_API_KEY is configured; otherwise the message is recorded in
 * NotificationLog with status SKIPPED — it is never reported as sent.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  relatedType?: string;
  relatedId?: string;
}): Promise<"SENT" | "SKIPPED" | "FAILED"> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Official Akogun Furniture <no-reply@akogunfurniture.local>";

  if (!apiKey) {
    await log({
      channel: "EMAIL",
      recipient: input.to,
      subject: input.subject,
      body: input.text,
      status: "SKIPPED",
      error: "RESEND_API_KEY is not configured.",
      relatedType: input.relatedType,
      relatedId: input.relatedId,
    });
    return "SKIPPED";
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Resend responded ${res.status}: ${detail.slice(0, 300)}`);
    }
    await log({
      channel: "EMAIL",
      recipient: input.to,
      subject: input.subject,
      body: input.text,
      status: "SENT",
      relatedType: input.relatedType,
      relatedId: input.relatedId,
    });
    return "SENT";
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    await log({
      channel: "EMAIL",
      recipient: input.to,
      subject: input.subject,
      body: input.text,
      status: "FAILED",
      error: message,
      relatedType: input.relatedType,
      relatedId: input.relatedId,
    });
    return "FAILED";
  }
}

export async function log(input: LogInput): Promise<void> {
  try {
    await prisma.notificationLog.create({ data: input });
  } catch {
    // Logging must never break the user-facing flow.
  }
}

export async function notifyAdmins(subject: string, body: string, relatedType?: string, relatedId?: string): Promise<void> {
  const admins = await prisma.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER"] }, active: true },
    select: { email: true },
  });
  await Promise.all(
    admins.map((admin) =>
      sendEmail({ to: admin.email, subject, text: body, relatedType, relatedId }),
    ),
  );
}
