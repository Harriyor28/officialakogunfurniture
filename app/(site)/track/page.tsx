import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/ui/Button";
import { Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track My Project",
  description: "Sign in to track the progress of your furniture project.",
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const user = await getSessionUser();

  if (user && user.role === "CUSTOMER") {
    redirect(ref ? `/portal/projects/${ref}` : "/portal");
  }
  if (user && user.role !== "CUSTOMER") {
    redirect("/admin");
  }

  // Visitors without an account can still see whether a reference exists —
  // but no project details are disclosed here.
  let referenceFound: boolean | null = null;
  if (ref) {
    const project = await prisma.customerProject.findUnique({ where: { reference: ref }, select: { id: true } });
    referenceFound = Boolean(project);
  }

  return (
    <div className="container-site flex min-h-[70vh] items-center pb-24 pt-32">
      <div className="card-surface mx-auto w-full max-w-lg p-8 text-center sm:p-10">
        <Lock className="mx-auto size-10 text-gold" aria-hidden />
        <h1 className="mt-6 text-3xl text-ivory">Track my project</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Project tracking is available to customers with an account. Sign in to see your project stages,
          progress updates and approved quotations.
        </p>

        {ref ? (
          <p className="mt-6 rounded-lg border border-ivory/10 bg-charcoal/60 px-4 py-3 text-sm text-muted">
            Reference: <span className="text-ivory">{ref}</span>
            {referenceFound === false ? " — sign in with the account linked to this project." : ""}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3">
          <ButtonLink href={ref ? `/login?next=/portal/projects/${encodeURIComponent(ref)}` : "/login"} className="w-full">
            Sign in to track
          </ButtonLink>
          <ButtonLink href="/register" variant="secondary" className="w-full">
            Create an account
          </ButtonLink>
        </div>

        <p className="mt-6 text-xs text-muted">
          Submitted an enquiry but have no account yet?{" "}
          <Link href="/register" className="text-gold hover:text-gold-soft">Register</Link> with the same email
          used for the enquiry, or <Link href="/contact" className="text-gold hover:text-gold-soft">contact us</Link>.
        </p>
      </div>
    </div>
  );
}
