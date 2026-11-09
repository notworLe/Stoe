import Image from "next/image";

export default function About() {
  return (
    <section id="about" className="px-6 md:px-12 lg:px-20 py-16 md:py-24 max-w-[1280px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 lg:gap-20 items-center">
        {/* Left Column: Editorial Storytelling */}
        <div className="md:col-span-7 flex flex-col justify-center">
          <h2 className="font-serif text-brand-foreground text-3xl md:text-4xl lg:text-5xl font-normal mb-8 md:mb-10 tracking-[0.03em]">
            About Us
          </h2>

          <div className="space-y-6 text-brand-muted font-sans font-light text-[13px] md:text-sm lg:text-[15px] leading-relaxed max-w-[580px]">
            <p>
              Owned and led by Dawn Mones, Sunrise Blooms is an exclusive floral
              design studio on the island of Kaua&apos;i, renowned for its
              bespoke, Hapa-style wedding floral design.
            </p>
            <p>
              Dawn is a self-proclaimed &apos;forever flower girl&apos; who fell
              in love with the botanical beauty of her home island, Kauai. As
              soon as she could walk, her mother would always find bits of flowers
              and leaves in her pockets when doing laundry.
            </p>
            <p>
              For eight years, Dawn honed her craft as a freelance floral designer
              from San Diego to San Francisco before returning home to Kauai to
              establish her own studio. With a degree in horticulture providing a
              botanical foundation for her artistry, she is devoted to giving
              each bloom the spotlight it deserves through thoughtful and
              refined design.
            </p>
          </div>
        </div>

        {/* Right Column: Framed Portrait Image */}
        <div className="md:col-span-5 flex justify-center md:justify-end">
          <div className="relative w-full max-w-[340px] md:max-w-[400px] aspect-[3/4] overflow-hidden bg-brand-surface">
            <Image
              src="/images/about.jpg"
              alt="Portrait of Dawn Mones holding flowers"
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover transition-transform duration-700 hover:scale-[1.02]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
