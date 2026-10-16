import type { Metadata } from "next";
import Link from "next/link";
import { getBusinessSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms of use and trading terms for Official Akogun Furniture website visitors and customers.",
};

export default async function TermsPage() {
  const settings = await getBusinessSettings();

  return (
    <div className="container-site pb-24 pt-32">
      <article className="prose-akogun mx-auto max-w-3xl">
        <p className="eyebrow mb-3">Legal</p>
        <h1>Terms &amp; Conditions</h1>
        <p className="text-sm text-muted">Last updated: {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>

        <h2>1. About these terms</h2>
        <p>
          These terms apply to your use of the {settings.businessName || "Official Akogun Furniture"} website
          and to quotation requests submitted through it. Project-specific terms are confirmed in writing in
          your quotation and order confirmation.
        </p>

        <h2>2. Website content</h2>
        <p>
          We aim to keep content accurate, but descriptions, dimensions and lead times published on the website
          are indicative until confirmed in your quotation. Demonstration entries, where present, are clearly
          labelled and do not constitute offers for sale.
        </p>

        <h2>3. Quotations</h2>
        <ul>
          <li>A quotation request is not an order and does not create a binding contract.</li>
          <li>Quotations are valid for the period stated on the document.</li>
          <li>Prices, taxes, delivery charges and lead times apply as stated in each quotation.</li>
          <li>Work begins only after written approval and any agreed deposit is received.</li>
        </ul>

        <h2>4. Custom work</h2>
        <p>
          Custom furniture is made to the approved specifications. Changes after approval may affect price and
          schedule and will be confirmed in writing before being carried out.
        </p>

        <h2>5. Delivery &amp; installation</h2>
        <p>
          Delivery and installation dates are estimates until confirmed. Please ensure access is available on
          the agreed date; delays caused by site access may incur additional charges as advised in advance.
        </p>

        <h2>6. Customer accounts</h2>
        <p>
          You are responsible for keeping your login credentials secure. Notify us immediately if you believe
          your account has been compromised.
        </p>

        <h2>7. Acceptable use</h2>
        <p>
          Do not misuse the website, attempt unauthorised access, or submit unlawful, harmful or fraudulent
          content through the forms.
        </p>

        <h2>8. Contact</h2>
        <p>
          Questions about these terms:{" "}
          {settings.email ? <a href={`mailto:${settings.email}`}>{settings.email}</a> : "use the contact form"}
          {settings.phone ? <> or call <a href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`}>{settings.phone}</a></> : null}.
        </p>

        <p>
          See also our <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </article>
    </div>
  );
}
