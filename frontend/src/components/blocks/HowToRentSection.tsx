import Section from "@/components/layout/Section";
import Divider from "@/components/ui/Divider";

const STEPS = [
  {
    number: "01",
    title: "Chọn áo dài",
    description: "Duyệt bộ sưu tập, chọn size và thời gian thuê phù hợp.",
  },
  {
    number: "02",
    title: "Đặt lịch",
    description: "Chọn ngày nhận và ngày trả. Phí giao hàng hiển thị rõ trước khi thanh toán.",
  },
  {
    number: "03",
    title: "Nhận & Trả",
    description: "Nhận tại studio hoặc giao tận nơi. Trả lại theo đúng lịch đã chọn.",
  },
];

/**
 * HowToRentSection — 3 bước đánh số theo MASTER.md.
 * Icons: số thứ tự thay vì SVG icon (phong cách editorial minimalism).
 */
export default function HowToRentSection() {
  return (
    <Section className="bg-brand-card">
      <h2 className="font-serif text-brand-foreground text-2xl uppercase tracking-widest text-center mb-16">
        Cách thuê áo dài
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
