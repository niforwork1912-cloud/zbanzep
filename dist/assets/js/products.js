/*
 * KOWIN — DỮ LIỆU SẢN PHẨM
 * ------------------------------------------------------------
 * Thêm sản phẩm mới: sao chép một khối { ... } trong KOWIN_PRODUCTS và sửa nội dung.
 * Thêm màu: thêm một mục vào "colors". Thêm ảnh: đặt file vào /assets/img/p/ và khai báo trong "images".
 *
 * Quy tắc:
 * - Giá là số nguyên VND (ví dụ 299000). Để null = trang hiển thị ô giữ chỗ, KHÔNG tự bịa giá.
 *   Nếu chỉ nhập originalPrice, giá khuyến mãi được tự tính theo discountPercent.
 * - available: false = màu/sản phẩm bị ẩn khỏi trang (màu) hoặc hiện "Tạm hết hàng" (sản phẩm).
 * - rating: chỉ điền khi có số liệu đánh giá đã xác minh cho riêng sản phẩm đó.
 * - family: nhóm màu dùng cho bộ lọc (den, trang, xanh, cam, do, hong, be).
 * - featured: thứ tự "Nổi bật". salesRank: thứ hạng bán chạy (1 = bán chạy nhất). addedAt: ngày ra mắt "YYYY-MM-DD".
 *   Các tuỳ chọn sắp xếp "Bán chạy" / "Mới nhất" / theo giá chỉ xuất hiện khi có dữ liệu tương ứng.
 */

window.KOWIN_CATEGORIES = [
  {
    id: "dep-kep",
    name: "Dép kẹp xỏ ngón",
    description: "Dép kẹp EVA đế dày, nhẹ và êm cho mọi hoạt động thường ngày.",
    image: "/assets/img/p/cat-dep-kep.webp"
  },
  {
    id: "dep-suc",
    name: "Dép sục",
    description: "Dép sục EVA đế cao, lỗ thoáng khí, có quai hậu.",
    image: "/assets/img/p/cat-dep-suc.webp"
  }
];

window.KOWIN_PRODUCTS = [
  {
    id: "dep-kep-eva-classic",
    name: "KOWIN Dép Kẹp EVA Classic",
    category: "dep-kep",
    description: "Dép kẹp EVA đế dày với quai liền khối, mũi chia ngón đặc trưng và đế có rãnh. Nhẹ, êm và dễ phối đồ — phù hợp cả trong nhà lẫn ngoài trời.",
    sizes: [35, 36, 37, 38, 39, 40, 41, 42],
    originalPrice: 360000,
    salePrice: null,
    discountPercent: 10,
    available: true,
    rating: null,
    featured: 1,
    salesRank: null,
    addedAt: null,
    gallery: [
      { src: "/assets/img/hero-1400.webp", alt: "Bộ sưu tập KOWIN Dép Kẹp EVA Classic năm màu" }
    ],
    colors: [
      { id: "den", name: "Đen", family: ["den"], swatch: "#17191F", available: true,
        images: [{ src: "/assets/img/p/classic-den.webp" }] },
      { id: "kem", name: "Kem", family: ["trang"], swatch: "#EEE9DF", available: true,
        images: [{ src: "/assets/img/editorial-3-1200.webp" }] },
      { id: "den-van-xanh", name: "Đen vân Xanh", family: ["den", "xanh"], swatch: "linear-gradient(135deg,#17191F 0 45%,#1F4FD6 45% 70%,#17191F 70%)", available: true,
        images: [{ src: "/assets/img/editorial-2-1200.webp" }] },
      { id: "den-van-cam", name: "Đen vân Cam", family: ["den", "cam"], swatch: "linear-gradient(135deg,#17191F 0 45%,#F25C1F 45% 70%,#17191F 70%)", available: true,
        images: [{ src: "/assets/img/p/marble-cam.webp" }] },
      { id: "den-van-trang", name: "Đen vân Trắng", family: ["den", "trang"], swatch: "linear-gradient(135deg,#17191F 0 45%,#F2F3F5 45% 70%,#17191F 70%)", available: true,
        images: [{ src: "/assets/img/hero-1400.webp" }] }
    ]
  },
  {
    id: "dep-kep-marble",
    name: "KOWIN Dép Kẹp Marble",
    category: "dep-kep",
    description: "Dép kẹp EVA vân loang nổi bật với đế dày bo tròn và quai kẹp mảnh. Mỗi đôi có hoạ tiết vân hơi khác nhau, mang lại nét riêng cho từng đôi.",
    sizes: [35, 36, 37, 38, 39, 40, 41, 42],
    originalPrice: null,
    salePrice: null,
    discountPercent: 10,
    available: true,
    rating: null,
    featured: 2,
    salesRank: null,
    addedAt: null,
    gallery: [
      { src: "/assets/img/p/marble-group.webp", alt: "Bốn màu KOWIN Dép Kẹp Marble xếp chồng" }
    ],
    colors: [
      { id: "cam-van-den", name: "Cam vân Đen", family: ["cam", "den"], swatch: "linear-gradient(135deg,#F07A22 0 50%,#17191F 50% 70%,#F07A22 70%)", available: true,
        images: [{ src: "/assets/img/p/marble-cam.webp" }] },
      { id: "xanh-van-trang", name: "Xanh vân Trắng", family: ["xanh", "trang"], swatch: "linear-gradient(135deg,#3A7BE0 0 45%,#F2F3F5 45% 65%,#17191F 65%)", available: true,
        images: [{ src: "/assets/img/p/marble-xanh.webp" }] },
      { id: "den-van-trang", name: "Đen vân Trắng", family: ["den", "trang"], swatch: "linear-gradient(135deg,#17191F 0 45%,#F2F3F5 45% 70%,#17191F 70%)", available: true,
        images: [{ src: "/assets/img/p/marble-den-trang.webp" }] },
      { id: "do-van-den", name: "Đỏ vân Đen", family: ["do", "den"], swatch: "linear-gradient(135deg,#E2342B 0 50%,#17191F 50% 70%,#E2342B 70%)", available: true,
        images: [{ src: "/assets/img/p/marble-do.webp" }] }
    ]
  },
  {
    id: "dep-suc-de-cao",
    name: "KOWIN Dép Sục Đế Cao",
    category: "dep-suc",
    description: "Dép sục EVA đế cao, mũi tròn với lỗ thoáng khí và quai hậu linh hoạt. Kiểu dáng trẻ trung, dễ phối đồ hằng ngày.",
    sizes: [35, 36, 37, 38, 39, 40, 41, 42],
    originalPrice: null,
    salePrice: null,
    discountPercent: 10,
    available: true,
    rating: null,
    featured: 3,
    salesRank: null,
    addedAt: null,
    gallery: [
      { src: "/assets/img/p/suc-group.webp", alt: "Bốn màu KOWIN Dép Sục Đế Cao xếp chồng" }
    ],
    colors: [
      { id: "hong", name: "Hồng", family: ["hong"], swatch: "#F2C9C4", available: true,
        images: [{ src: "/assets/img/p/suc-hong.webp" }] },
      { id: "be", name: "Be", family: ["be"], swatch: "#EBD9C6", available: true,
        images: [{ src: "/assets/img/p/suc-be.webp" }] },
      { id: "den", name: "Đen", family: ["den"], swatch: "#17191F", available: true,
        images: [{ src: "/assets/img/p/suc-den.webp" }] },
      { id: "trang", name: "Trắng", family: ["trang"], swatch: "#F7F7F7", available: true,
        images: [{ src: "/assets/img/p/suc-trang.webp" }] }
    ]
  }
];

/* Tên hiển thị của nhóm màu trong bộ lọc */
window.KOWIN_COLOR_FAMILIES = {
  den: { name: "Đen", swatch: "#17191F" },
  trang: { name: "Trắng / Kem", swatch: "#F2F0EA" },
  xanh: { name: "Xanh", swatch: "#2F66E0" },
  cam: { name: "Cam", swatch: "#F07A22" },
  do: { name: "Đỏ", swatch: "#E2342B" },
  hong: { name: "Hồng", swatch: "#F2C9C4" },
  be: { name: "Be", swatch: "#EBD9C6" }
};
