/*
 * KOWIN — CẤU HÌNH NỘI DUNG CÓ THỂ CHỈNH SỬA
 * ------------------------------------------------------------
 * Sửa file này để cập nhật quà tặng, hạn ưu đãi, liên hệ và đánh giá.
 * Sản phẩm, màu, size, ảnh và giá nằm trong file products.js.
 *
 * Để trống (null) = hiển thị ô giữ chỗ trên trang, KHÔNG tự bịa số liệu.
 */
window.KOWIN_CONFIG = {
  promo: {
    gift: null,                       // Mô tả quà tặng. Ví dụ: "Túi đựng dép KOWIN"
    endDate: null                     // Ngày kết thúc ưu đãi, định dạng ISO. Ví dụ: "2026-12-31T23:59:59+07:00"
  },

  contact: {
    hotline: "056 838 5999",
    fanpageName: "Z Bán Zép",
    fanpageUrl: null                  // Link fanpage Facebook. Ví dụ: "https://www.facebook.com/..."
  },

  /*
   * Đánh giá THẬT của khách hàng. Chỉ thêm đánh giá đã được xác minh.
   * Mỗi mục: { name: "Tên (có thể viết tắt)", rating: 5, text: "Nội dung", meta: "Màu Đen · Size 40" }
   * Khi danh sách trống, trang chỉ hiển thị khối điểm tổng hợp.
   */
  reviews: []
};
