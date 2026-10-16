import type { Metadata } from "next";
import Link from "next/link";
import { getBusinessSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Official Akogun Furniture collects, uses and protects your personal information.",
};

export default async function PrivacyPage() {
  const settings = await getBusinessSettings();

  return (
    <div className="container-site pb-24 pt-32">
      <article className="prose-akogun mx-auto max-w-3xl">
        <p className="eyebrow mb-3">Legal</p>
        <h1>Privacy Policy</h1>
        <p className="text-sm text-muted">Last updated: {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>

        <h2>Who we are</h2>
        <p>
          {settings.businessName || "Official Akogun Furniture"} designs and builds bespoke furniture and
          interior woodwork. This policy explains what happens to information you share with us through this
          website.
        </p>

        <h2>Information we collect</h2>
        <ul>
          <li>Details you submit in quotation and contact forms (name, phone, email, project requirements).</li>
          <li>Reference images or design files you choose to upload with an enquiry.</li>
          <li>Account details if you register to track a project (name, email, phone, password — stored only as an irreversible hash).</li>
          <li>Project records created when you approve a quotation with us.</li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To respond to your enquiry and prepare quotations.</li>
          <li>To manage and communicate progress on projects you commission.</li>
          <li>To meet legal and accounting obligations.</li>
        </ul>
        <p>We do not sell personal information and we do not use your data for unrelated marketing without consent.</p>

        <h2>Who can see it</h2>
        <p>
          Access is restricted to authorised staff of the business through role-based permissions. Project
          records are visible only to the customer they belong to when accessed through the customer portal.
        </p>

        <h2>How long we keep it</h2>
        <p>
          Enquiries and project records are retained for as long as needed for customer service and legal
          obligations, then deleted or anonymised on request.
        </p>

        <h2>Your rights</h2>
        <p>
          You may request a copy of the information we hold about you, ask for corrections, or ask us to delete
          it where we have no continuing legal obligation. Contact us using the details below.
        </p>

        <h2>Cookies</h2>
        <p>
          This website uses a single essential cookie to keep you signed in to the customer portal. No
          advertising or third-party tracking cookies are set by default.
        </p>

        <h2>Contact</h2>
        <p>
          {settings.email ? (
            <>Email: <a href={`mailto:${settings.email}`}>{settings.email}</a><br /></>
          ) : null}
          {settings.phone ? <>Phone: <a href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`}>{settings.phone}</a><br /></> : null}
          {settings.address ? <>{settings.address}</> : null}
        </p>

        <p>
          See also our <Link href="/terms">Terms &amp; Conditions</Link>.
        </p>
      </article>
    </div>
  );
}
