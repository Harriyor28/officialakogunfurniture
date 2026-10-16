import { cn } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal className={cn(align === "center" && "text-center", className)}>
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      <h2 className="max-w-3xl text-3xl leading-tight text-ivory sm:text-4xl lg:text-[2.75rem]">{title}</h2>
      {align === "center" ? <div className="gold-rule mx-auto mt-5 w-40" /> : <div className="gold-rule mt-5 w-40" />}
      {description ? (
        <p className={cn("mt-5 max-w-2xl text-base leading-relaxed text-muted", align === "center" && "mx-auto")}>
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
