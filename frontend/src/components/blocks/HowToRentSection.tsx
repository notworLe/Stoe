import Section from "@/components/layout/Section";
import Divider from "@/components/ui/Divider";

const STEPS = [
  {
    number: "01",
    title: "Select Your Ao Dai",
    description:
      "Browse our archive, review exact measurements in cm, and pick your size.",
  },
  {
    number: "02",
    title: "Choose Delivery & Time",
    description:
      "Pick in Person (1, 2, 4 or 8 days) or Transport Post (4 or 8 days) with a 1-day garment care gap.",
  },
  {
    number: "03",
    title: "Checkout & Receive Invoice",
    description:
      "Complete guest payment in AUD and receive your confirmation invoice by email.",
  },
];

export default function HowToRentSection() {
  return (
    <Section className="bg-brand-card">
      <h2 className="font-serif text-brand-foreground text-2xl uppercase tracking-widest text-center mb-16">
        How to Rent
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
        {STEPS.map((step, index) => (
          <div key={step.number} className="flex flex-col gap-4">
            {index > 0 && <Divider className="md:hidden" />}
            <span className="font-serif text-brand-muted text-4xl tracking-widest">
              {step.number}
            </span>
            <h3 className="font-serif text-brand-foreground text-lg uppercase tracking-wide">
              {step.title}
            </h3>
            <p className="font-sans text-brand-muted text-sm leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
