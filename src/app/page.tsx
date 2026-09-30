import { Features } from "@/features/marketing/home/features";
import { Hero } from "@/features/marketing/home/hero";
import { HowItWorks } from "@/features/marketing/home/how-it-works";
import { LiveDemo } from "@/features/marketing/home/live-demo";
import { FinalCta, MobileShowcase, WhyUs } from "@/features/marketing/home/more-sections";
import { PersonalizeDemo } from "@/features/marketing/home/personalize-demo";
import { TemplateShowcase } from "@/features/marketing/home/template-showcase";
import { SiteFooter } from "@/features/marketing/site-footer";
import { SiteHeader } from "@/features/marketing/site-header";
import { selectableTemplates } from "@/templates/registry";

export default function HomePage() {
  const demoTemplates = selectableTemplates()
    .slice(0, 4)
    .map(({ id, name, themeDefaults, stationery, palettes }) => ({ id, name, themeDefaults, stationery, palettes }));

  return (
    <>
      <SiteHeader overlay />
      <main>
        <Hero />
        <Features />
        <TemplateShowcase />
        <LiveDemo />
        <HowItWorks />
        <PersonalizeDemo templates={demoTemplates} />
        <WhyUs />
        <MobileShowcase />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
