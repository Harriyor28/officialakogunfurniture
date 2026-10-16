import Link from "next/link";
import { cn } from "@/lib/format";

type ButtonLinkProps = {
  href: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
  target?: string;
  rel?: string;
  onClick?: () => void;
  "aria-label"?: string;
};

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  target,
  rel,
  ...rest
}: ButtonLinkProps) {
  const variantClass =
    variant === "primary"
      ? "btn-primary"
      : variant === "secondary"
        ? "btn-secondary"
        : variant === "danger"
          ? "btn-danger"
          : "btn-ghost";
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={cn("btn", variantClass, size === "sm" && "px-4 py-2 text-xs", className)}
      {...rest}
    >
      {children}
    </Link>
  );
}

type SubmitButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function SubmitButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: SubmitButtonProps) {
  const variantClass =
    variant === "primary"
      ? "btn-primary"
      : variant === "secondary"
        ? "btn-secondary"
        : variant === "danger"
          ? "btn-danger"
          : "btn-ghost";
  return (
    <button type="submit" className={cn("btn", variantClass, size === "sm" && "px-4 py-2 text-xs", className)} {...rest}>
      {children}
    </button>
  );
}
