export function formatMoney(amount: number | null | undefined, currency = "NGN"): string {
  if (amount === null || amount === undefined) return "";
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₦${amount.toLocaleString("en-NG")}`;
  }
}

export function formatDate(date: Date | string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  const options: Intl.DateTimeFormatOptions =
    opts?.dateStyle || opts?.timeStyle
      ? opts
      : {
          day: "numeric",
          month: "long",
          year: "numeric",
          ...opts,
        };
  return new Intl.DateTimeFormat("en-GB", options).format(d);
}

export function formatDateInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** WhatsApp deep link with a prefilled message. Returns null when unconfigured. */
export function whatsappLink(number: string | null | undefined, message: string): string | null {
  if (!number) return null;
  const digits = number.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const withCountry = digits.startsWith("234") ? digits : `234${digits.replace(/^0/, "")}`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`;
}
