import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";

/**
 * HeroSection — Full-width editorial hero image với overlay + title + CTA.
 * Nội dung thật build ở Phase 3.
 */
export default function HeroSection() {
  return (
    <Section fullBleed className="relative min-h-[90vh] flex items-end">
      {/* Placeholder bg — sẽ thay bằng ảnh thật ở Phase 3 */}
      <div className="absolute inset-0 bg-brand-surface" aria-hidden="true" />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/[0.18]" aria-hidden="true" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16 pb-24 flex flex-col gap-6">
        <h1 className="font-serif text-brand-on-image text-5xl md:text-7xl uppercase tracking-widest max-w-xl">
          LUA Studio
        </h1>
        <p className="font-serif italic text-brand-on-image text-lg max-w-sm">
          Cho thuê áo dài editorial — elegant, calm, feminine.
        </p>
        <Button variant="secondary">Xem bộ sưu tập</Button>
      </div>
    </Section>
  );
}
