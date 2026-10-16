import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({
  items,
}: {
  items: Array<{ label: string; href?: string }>;
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="hover:text-gold">{item.label}</Link>
            ) : (
              <span className="text-ivory/85" aria-current={index === items.length - 1 ? "page" : undefined}>
                {item.label}
              </span>
            )}
            {index < items.length - 1 ? <ChevronRight className="size-3.5 opacity-50" aria-hidden /> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
