import Image from "next/image";
import Link from "next/link";

/**
 * =====================================================================
 * COMPONENT: Hero (Banner trang chủ LUA STUDIO)
 * =====================================================================
 * Hướng dẫn cho người mới học (Newbie Developer):
 * - Banner Hero chiếm trọn vẹn màn hình đầu tiên (Above the Fold)
 *   với chiều cao h-[calc(100dvh-4rem)] (kết hợp hoàn hảo với Navbar 4rem).
 * - Sử dụng kiến trúc 2 tầng (Outer Section quản lý padding, Inner Div quản lý Image).
 * - Tích hợp nút kêu gọi hành động (CTA) "EXPLORE THE ARCHIVE →" dẫn thẳng vào trang Shop.
 * =====================================================================
 */

export default function Hero() {
  return (
    <section id="home" className="w-full max-w-[1440px] mx-auto h-[calc(100dvh-4rem)] min-h-[480px] md:min-h-[520px] px-4 py-3 sm:px-6 sm:py-4 md:px-10 md:py-5 lg:px-14 lg:py-6 flex flex-col">
      {/* Box con (Image Card): Mốc tọa độ relative chứa ảnh fill và overlay */}
      <div className="relative w-full h-full overflow-hidden bg-brand-surface">
        <Image
          src="/images/hero.jpg"
          alt="Welcome to LUA Studio Melbourne"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1440px"
          className="object-cover transition-transform duration-700 hover:scale-[1.02]"
        />

        {/* Lớp phủ màu sẫm nhẹ để chữ trắng luôn tương phản rõ ràng */}
        <div className="absolute inset-0 bg-black/20" aria-hidden="true" />

        {/* Khung chứa Typography & Nút bấm chuyển hướng */}
        <div className="absolute inset-0 z-10 p-6 md:p-10 lg:p-12 flex flex-col justify-between pointer-events-none">
          {/* Hàng trên cùng (Top Header Row) */}
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-serif text-brand-on-image text-xs md:text-sm lg:text-base tracking-[0.25em] uppercase font-normal">
              WELCOME TO OUR STUDIO
            </h1>
            <p className="font-serif text-brand-on-image text-[10px] md:text-xs lg:text-sm tracking-[0.2em] uppercase text-right opacity-90 font-light">
              WHERE INTENTIONALITY MEETS NATURE
            </p>
          </div>

          {/* Hàng dưới cùng (Bottom Row: Nút chuyển vào Shop + Câu trích dẫn) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pointer-events-auto">
            {/* Nút bấm vào trang Shop / Bộ sưu tập */}
            <Link
              href="/product"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[11px] font-sans tracking-[0.2em] uppercase bg-brand-background/95 hover:bg-brand-surface text-brand-foreground transition-all duration-300 border border-brand-border/60 hover:border-brand-foreground backdrop-blur-xs cursor-pointer shadow-none"
            >
              <span>EXPLORE THE ARCHIVE</span>
              <span className="text-xs">→</span>
            </Link>

            {/* Câu trích dẫn editorial in nghiêng Cormorant Garamond */}
            <p className="font-serif italic text-brand-on-image text-xs md:text-sm lg:text-[15px] leading-relaxed max-w-[360px] md:max-w-[440px] lg:max-w-[500px] text-left sm:text-right opacity-95">
              we bring a refined, intentional approach to editorial áo dài: handcrafted silhouettes created to reflect your style and elevate your occasion.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}