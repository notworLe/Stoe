import { type Product } from "@/types";

/**
 * =====================================================================
 * DANH SÁCH SẢN PHẨM ÁO DÀI MẪU — LUA STUDIO MELBOURNE
 * =====================================================================
 * Dành cho người mới học (Newbie Developer Guide):
 * - Đây là "Mock Data" (dữ liệu mẫu) đại diện cho các mẫu áo dài cho thuê.
 * - Sau này khi kết nối với Backend FastAPI / PostgreSQL, dữ liệu này sẽ
 *   được thay thế bằng hàm gọi API (ví dụ fetch('/api/v1/products')).
 * - Mỗi sản phẩm gồm:
 *   + id: Định danh duy nhất
 *   + slug: Chuỗi ký tự định danh trên URL (vd: /product/bach-lien-ivory-silk)
 *   + name: Tên áo dài theo phong cách thơ mộng, tao nhã
 *   + images: Mảng các đường dẫn ảnh (ảnh đầu tiên là ảnh bìa)
 *   + rentalPricePerDay: Giá thuê tính theo ngày (VND)
 *   + rentalPriceAud: Giá thuê tiêu chuẩn 4 ngày tại Melbourne (AUD)
 *   + sizes: Các kích cỡ có sẵn kèm số đo vòng ngực, eo, mông
 *   + occasion: Dịp mặc (Wedding, Editorial, Tea Ceremony, Event)
 *   + color: Nhóm màu sắc (Ivory, Sage, Terracotta, Rose)
 * =====================================================================
 */

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "lua-001",
    code: "AD-12",
    slug: "bach-lien-ivory-silk",
    name: "Bạch Liên — Raw Silk Áo Dài",
    images: ["/images/aodai-ivory.jpg", "/images/hero.jpg"],
    rentalPricePerDay: 450000,
    rentalPriceAud: 130,
    occasion: "Wedding",
    color: "Ivory",
    description: "Áo dài lụa tơ tằm thô màu kem ngà Warm Ivory, cổ trụ cao tối giản với đường viền hạt ngọc thanh thoát.",
    modelInfo: {
      height: "1m68",
      wearingSize: "Size S",
    },
    sizes: [
      { label: "XS", bust: 80, waist: 62, hip: 88, length: 138, available: true },
      { label: "S", bust: 84, waist: 66, hip: 92, length: 140, available: true },
      { label: "M", bust: 88, waist: 70, hip: 96, length: 142, available: true },
      { label: "L", bust: 92, waist: 74, hip: 100, length: 144, available: false },
    ],
  },
  {
    id: "lua-002",
    code: "AD-08",
    slug: "thanh-tra-sage-linen",
    name: "Thanh Trà — Washed Linen Áo Dài",
    images: ["/images/aodai-sage.jpg", "/images/about.jpg"],
    rentalPricePerDay: 350000,
    rentalPriceAud: 95,
    occasion: "Editorial",
    color: "Sage",
    description: "Chất liệu đũi lanh mộc mạc màu xanh xô thơm Sage Green, cúc bọc vạt chéo truyền thống, tà rũ mềm mại.",
    modelInfo: {
      height: "1m65",
      wearingSize: "Size S",
    },
    sizes: [
      { label: "S", bust: 84, waist: 66, hip: 92, length: 138, available: true },
      { label: "M", bust: 88, waist: 70, hip: 96, length: 140, available: true },
      { label: "L", bust: 92, waist: 74, hip: 100, length: 142, available: true },
    ],
  },
  {
    id: "lua-003",
    code: "AD-15",
    slug: "hoang-cuc-terracotta-organza",
    name: "Hoàng Cúc — Terracotta Organza Áo Dài",
    images: ["/images/aodai-terracotta.jpg", "/images/next-footer.jpg"],
    rentalPricePerDay: 480000,
    rentalPriceAud: 140,
    occasion: "Tea Ceremony",
    color: "Terracotta",
    description: "Tơ organza dệt mỏng màu gạch nung đất nung ấm, thêu tay hoa cúc nổi tạo điểm nhấn sang trọng cho lễ gia tiên.",
    sizes: [
      { label: "XS", bust: 80, waist: 62, hip: 88, available: true },
      { label: "S", bust: 84, waist: 66, hip: 92, available: true },
      { label: "M", bust: 88, waist: 70, hip: 96, available: true },
      { label: "L", bust: 92, waist: 74, hip: 100, available: true },
    ],
  },
  {
    id: "lua-004",
    slug: "mau-don-blush-rose",
    name: "Mẫu Đơn — Blush Rose Silk Áo Dài",
    images: ["/images/aodai-blush.jpg", "/images/aodai-ivory.jpg"],
    rentalPricePerDay: 420000,
    rentalPriceAud: 120,
    occasion: "Wedding",
    color: "Rose",
    description: "Lụa satin mềm mại màu cánh hồng phấn dịu ngọt, đính kết hoa đào nổi tinh xảo dọc bờ vai.",
    sizes: [
      { label: "S", bust: 84, waist: 66, hip: 92, available: true },
      { label: "M", bust: 88, waist: 70, hip: 96, available: true },
      { label: "XL", bust: 96, waist: 78, hip: 104, available: false },
    ],
  },
  {
    id: "lua-005",
    slug: "huong-xua-vintage-brocade",
    name: "Hương Xưa — Vintage Brocade Áo Dài",
    images: ["/images/hero.jpg", "/images/aodai-ivory.jpg"],
    rentalPricePerDay: 520000,
    rentalPriceAud: 155,
    occasion: "Event",
    color: "Ivory",
    description: "Gấm dệt vân chìm phong cách vintage thập niên 90, phom dáng suông rộng nhẹ thoải mái, thích hợp sự kiện trang trọng.",
    sizes: [
      { label: "XS", bust: 80, waist: 62, hip: 88, available: true },
      { label: "S", bust: 84, waist: 66, hip: 92, available: true },
      { label: "M", bust: 88, waist: 70, hip: 96, available: true },
      { label: "L", bust: 92, waist: 74, hip: 100, available: true },
    ],
  },
  {
    id: "lua-006",
    slug: "lam-van-minimalist-crepe",
    name: "Lam Vân — Minimalist Studio Áo Dài",
    images: ["/images/about.jpg", "/images/aodai-sage.jpg"],
    rentalPricePerDay: 320000,
    rentalPriceAud: 90,
    occasion: "Editorial",
    color: "Sage",
    description: "Áo dài crepe dệt trơn tối giản, không hoa văn, tôn vinh đường cắt may chuẩn xác và thần thái người mặc.",
    sizes: [
      { label: "S", bust: 84, waist: 66, hip: 92, available: true },
      { label: "M", bust: 88, waist: 70, hip: 96, available: true },
      { label: "L", bust: 92, waist: 74, hip: 100, available: true },
    ],
  },
  {
    id: "lua-007",
    slug: "co-dien-signature-silhouette",
    name: "Cổ Điển — Signature Editorial Silhouette",
    images: ["/images/next-footer.jpg", "/images/aodai-terracotta.jpg"],
    rentalPricePerDay: 460000,
    rentalPriceAud: 135,
    occasion: "Event",
    color: "Terracotta",
    description: "Mẫu áo dài mang phom dáng biểu tượng của LUA Studio tại Melbourne, màu sắc trầm ấm, tôn dáng chụp hình tạp chí.",
    sizes: [
      { label: "XS", bust: 80, waist: 62, hip: 88, available: true },
      { label: "S", bust: 84, waist: 66, hip: 92, available: true },
      { label: "M", bust: 88, waist: 70, hip: 96, available: true },
    ],
  },
  {
    id: "lua-008",
    slug: "ngoc-lan-ceremonial-crepe",
    name: "Ngọc Lan — Ceremonial Organza Áo Dài",
    images: ["/images/aodai-ivory.jpg", "/images/aodai-blush.jpg"],
    rentalPricePerDay: 430000,
    rentalPriceAud: 125,
    occasion: "Tea Ceremony",
    color: "Rose",
    description: "Áo dài lễ đính cườm tone màu hoa ngọc lan dịu nhẹ, hai lớp tà bồng bềnh quý phái cho các nghi lễ gia đình.",
    sizes: [
      { label: "S", bust: 84, waist: 66, hip: 92, available: true },
      { label: "M", bust: 88, waist: 70, hip: 96, available: true },
      { label: "L", bust: 92, waist: 74, hip: 100, available: true },
      { label: "XL", bust: 96, waist: 78, hip: 104, available: true },
    ],
  },
  {
    id: "lua-009",
    slug: "thu-vu-olive-silk",
    name: "Thu Vũ — Olive Raw Silk Áo Dài",
    images: ["/images/aodai-sage.jpg", "/images/hero.jpg"],
    rentalPricePerDay: 410000,
    rentalPriceAud: 115,
    occasion: "Editorial",
    color: "Sage",
    description: "Lụa tơ tằm thô tone màu xanh lá olive trầm mặc, tà suông bay bổng trong không gian ánh sáng tự nhiên.",
    sizes: [
      { label: "XS", bust: 80, waist: 62, hip: 88, available: true },
      { label: "S", bust: 84, waist: 66, hip: 92, available: true },
      { label: "M", bust: 88, waist: 70, hip: 96, available: true },
    ],
  },
  {
    id: "lua-010",
    slug: "nguyet-da-pearl-brocade",
    name: "Nguyệt Dạ — Pearl White Brocade Áo Dài",
    images: ["/images/aodai-ivory.jpg", "/images/about.jpg"],
    rentalPricePerDay: 490000,
    rentalPriceAud: 145,
    occasion: "Wedding",
    color: "Ivory",
    description: "Gấm dệt vân mây ánh ngọc trai, mang vẻ đẹp tinh khôi và trang nhã chuẩn mực cho cô dâu ngày cưới.",
    sizes: [
      { label: "S", bust: 84, waist: 66, hip: 92, available: true },
      { label: "M", bust: 88, waist: 70, hip: 96, available: true },
      { label: "L", bust: 92, waist: 74, hip: 100, available: true },
    ],
  },
  {
    id: "lua-011",
    slug: "thu-cuc-sunset-ochre",
    name: "Thu Cúc — Sunset Ochre Organza Áo Dài",
    images: ["/images/aodai-terracotta.jpg", "/images/next-footer.jpg"],
    rentalPricePerDay: 460000,
    rentalPriceAud: 135,
    occasion: "Tea Ceremony",
    color: "Terracotta",
    description: "Màu vàng hoàng thổ đất nung ấm áp như ráng chiều mùa thu Melbourne, tôn da và rạng rỡ trước ống kính.",
    sizes: [
      { label: "XS", bust: 80, waist: 62, hip: 88, available: true },
      { label: "S", bust: 84, waist: 66, hip: 92, available: true },
      { label: "M", bust: 88, waist: 70, hip: 96, available: true },
      { label: "L", bust: 92, waist: 74, hip: 100, available: true },
    ],
  },
  {
    id: "lua-012",
    slug: "to-quyen-rose-chiffon",
    name: "Tố Quyên — Rose Chiffon Áo Dài",
    images: ["/images/aodai-blush.jpg", "/images/aodai-ivory.jpg"],
    rentalPricePerDay: 440000,
    rentalPriceAud: 125,
    occasion: "Event",
    color: "Rose",
    description: "Áo dài lụa tơ chiffon mềm rũ màu hồng tro nhẹ, đính ngọc trai thủ công tinh xảo quanh cổ áo.",
    sizes: [
      { label: "S", bust: 84, waist: 66, hip: 92, available: true },
      { label: "M", bust: 88, waist: 70, hip: 96, available: true },
      { label: "XL", bust: 96, waist: 78, hip: 104, available: true },
    ],
  },
];
