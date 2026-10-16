import { requirePermission } from "@/lib/auth";
import { getBusinessSettings, getProcessSteps, getHomepageCopy, isDemoContent } from "@/lib/settings";
import { BusinessSettingsForm, ProcessStepsForm, HomepageCopyForm } from "@/components/admin/SettingsForms";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requirePermission("settings.manage");
  const [settings, steps, demo, homeCopy] = await Promise.all([
    getBusinessSettings(),
    getProcessSteps(),
    isDemoContent(),
    getHomepageCopy(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl text-ivory sm:text-3xl">Settings</h1>
        <p className="mt-2 text-sm text-muted">
          Contact details, about copy and the public process timeline. Phone, WhatsApp and email set in environment
          variables override these values.
          {demo ? (
            <span className="ml-2 text-warning">Demo-content banner is currently ON.</span>
          ) : null}
        </p>
      </div>

      <section className="card-surface p-6 sm:p-8" aria-labelledby="business-heading">
        <h2 id="business-heading" className="text-lg text-ivory">Business details</h2>
        <div className="mt-5">
          <BusinessSettingsForm settings={settings} />
        </div>
      </section>

      <section className="card-surface p-6 sm:p-8" aria-labelledby="process-heading">
        <h2 id="process-heading" className="text-lg text-ivory">How we work (process timeline)</h2>
        <p className="mt-1 text-sm text-muted">Shown on the About page and homepage.</p>
        <div className="mt-5">
          <ProcessStepsForm steps={steps} />
        </div>
      </section>

      <section className="card-surface p-6 sm:p-8" aria-labelledby="homepage-heading">
        <h2 id="homepage-heading" className="text-lg text-ivory">Homepage copy</h2>
        <p className="mt-1 text-sm text-muted">Hero and call-to-action text shown at the top of the homepage.</p>
        <div className="mt-5">
          <HomepageCopyForm copy={homeCopy} />
        </div>
      </section>
    </div>
  );
}
