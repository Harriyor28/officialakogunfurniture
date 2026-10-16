import { cn } from "@/lib/format";

const TONES = {
  neutral: "",
  gold: "badge-gold",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
} as const;

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return <span className={cn("badge", TONES[tone], className)}>{children}</span>;
}

export function StatusBadge({ status, map }: { status: string; map: ReadonlyArray<{ value: string; label: string }> }) {
  const found = map.find((s) => s.value === status);
  const tone =
    /APPROVED|COMPLETED|SENT|DONE|IN_STOCK/.test(status)
      ? "success"
      : /DECLINED|EXPIRED|UNAVAILABLE|FAILED/.test(status)
        ? "danger"
        : /PENDING|AWAITING|REVIEW|IN_PROGRESS|PRODUCTION|DRAFT|MADE_TO_ORDER/.test(status)
          ? "warning"
          : "neutral";
  return <Badge tone={tone}>{found?.label ?? status}</Badge>;
}
