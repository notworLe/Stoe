import Section from "@/components/layout/Section";

/**
 * IntroSection — Welcome statement giới thiệu LUA Studio.
 * Nội dung thật build ở Phase 3.
 */
export default function IntroSection() {
  return (
    <Section className="text-center">
      <p className="font-serif italic text-brand-muted text-sm uppercase tracking-widest mb-6">
        Welcome
      </p>
      <h2 className="font-serif text-brand-foreground text-3xl md:text-4xl uppercase tracking-widest max-w-2xl mx-auto leading-snug">
        Nơi mỗi chiếc áo dài kể một câu chuyện
      </h2>
      <p className="font-sans text-brand-muted text-sm mt-6 max-w-lg mx-auto leading-relaxed">
        LUA Studio — không gian thuê áo dài editorial cho những khoảnh khắc đáng nhớ.
      </p>
    </Section>
  );
}
