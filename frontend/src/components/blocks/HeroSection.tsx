import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";

export default function HeroSection() {
  return (
    <Section fullBleed className="relative min-h-[90vh] flex items-end">
      <div className="absolute inset-0 bg-brand-surface" aria-hidden="true" />
      <div className="absolute inset-0 bg-brand-foreground/20" aria-hidden="true" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 pb-24 flex flex-col gap-6">
        <h1 className="font-serif text-brand-on-image text-5xl md:text-7xl uppercase tracking-widest max-w-xl">
          Maison de Lua
        </h1>
        <p className="font-serif italic text-brand-on-image text-lg max-w-sm">
          Editorial Vietnamese Ao Dai Rental — Melbourne, Australia.
        </p>
        <Button variant="secondary">Explore the Archive</Button>
      </div>
    </Section>
  );
}
