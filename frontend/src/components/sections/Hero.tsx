import Image from "next/image";

export default function Hero() {
  return (
    <section className="w-full max-w-[1440px] mx-auto h-[calc(100dvh-4rem)] min-h-[480px] md:min-h-[520px] px-4 py-3 sm:px-6 sm:py-4 md:px-10 md:py-5 lg:px-14 lg:py-6 flex flex-col">
      {/* Box con (Image Card): giới hạn phạm vi của Image fill bên trong padding của box cha */}

      <div className="relative w-full h-full overflow-hidden bg-brand-surface">
        <Image
          src="/images/hero.jpg"
          alt="Welcome to our studio"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1440px"
          className="object-cover transition-transform duration-700 hover:scale-[1.02]"
        />
        {/* Subtle dark overlay to ensure readability */}
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />

        {/* Overlaid Editorial Typography */}
        <div className="absolute inset-0 z-10 p-6 md:p-10 lg:p-12 flex flex-col justify-between pointer-events-none">
          {/* Top Header Row */}
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-serif text-brand-on-image text-xs md:text-sm lg:text-base tracking-[0.25em] uppercase font-normal">
              WELCOME TO OUR STUDIO
            </h1>
            <p className="font-serif text-brand-on-image text-[10px] md:text-xs lg:text-sm tracking-[0.2em] uppercase text-right opacity-90 font-light">
              WHERE INTENTIONALITY MEETS NATURE
            </p>
          </div>

          {/* Bottom Statement Row */}
          <div className="flex justify-end">
            <p className="font-serif italic text-brand-on-image text-xs md:text-sm lg:text-[15px] leading-relaxed max-w-[360px] md:max-w-[480px] lg:max-w-[540px] text-right opacity-95">
              we bring a refined, intentional approach to floral design: every arrangement is created to reflect your style and elevate your occasion.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}