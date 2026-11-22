import Section from "@/components/layout/Section";

export default function IntroSection() {
  return (
    <Section className="text-center">
      <p className="font-serif italic text-brand-muted text-sm uppercase tracking-widest mb-6">
        Welcome
      </p>
      <h2 className="font-serif text-brand-foreground text-3xl md:text-4xl uppercase tracking-widest max-w-2xl mx-auto leading-snug">
        Where Every Silk Silhouette Tells a Story
      </h2>
      <p className="font-sans text-brand-muted text-sm mt-6 max-w-lg mx-auto leading-relaxed">
        Maison de Lua — an editorial Vietnamese Ao Dai rental atelier in Melbourne.
      </p>
    </Section>
  );
}
