import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getBusinessSettings } from "@/lib/settings";

export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getBusinessSettings();

  return (
    <div className="public-site flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-obsidian"
      >
        Skip to content
      </a>
      <Header
        whatsapp={settings.whatsapp}
        phone={settings.phone}
        logoUrl={settings.logoUrl}
        businessName={settings.businessName}
      />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer
        businessName={settings.businessName}
        logoUrl={settings.logoUrl}
        phone={settings.phone}
        email={settings.email}
        whatsapp={settings.whatsapp}
        address={settings.address}
        hours={settings.hours}
        socials={{
          facebook: settings.facebook,
          instagram: settings.instagram,
          twitter: settings.twitter,
        }}
        footerNote={settings.footerNote}
        demoContent={settings.contentIsDemo}
      />
    </div>
  );
}
