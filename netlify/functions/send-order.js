const nodemailer = require("nodemailer");

const ORIGINAL_PRICE = 360000;
const DISCOUNT_PERCENT = 10;
const COLORS = ["Đen", "Kem", "Đen vân Xanh", "Đen vân Cam", "Đen vân Trắng"];
const SIZES = ["35", "36", "37", "38", "39", "40", "41", "42"];

function response(statusCode, message) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify({ message })
  };
}

function formatVnd(amount) {
  return new Intl.NumberFormat("vi-VN").format(amount) + "₫";
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return response(405, "Phương thức gửi đơn không được hỗ trợ.");
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  const orderEmail = process.env.ORDER_EMAIL;
  if (!gmailUser || !gmailPassword || !orderEmail) {
    console.error("Order email is not configured.");
    return response(500, "Máy chủ chưa cấu hình email nhận đơn. Vui lòng gọi hotline.");
  }

  const body = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64").toString("utf8")
    : event.body || "";
  if (body.length > 10000) {
    return response(413, "Thông tin đơn hàng vượt quá giới hạn cho phép.");
  }
  const params = new URLSearchParams(body);
  if (params.get("bot-field")) {
    return response(200, "Đơn hàng đã được gửi thành công.");
  }
  const name = (params.get("ho_ten") || "").trim();
  const phone = (params.get("so_dien_thoai") || "").replace(/[\s.\-()]/g, "").replace(/^\+?84/, "0");
  const address = (params.get("dia_chi") || "").trim();
  const color = params.get("mau_sac") || "";
  const size = params.get("size") || "";
  const qty = Number(params.get("so_luong"));

  if (
    name.length < 2 ||
    !/^0[35789]\d{8}$/.test(phone) ||
    address.length < 10 ||
    !COLORS.includes(color) ||
    !SIZES.includes(size) ||
    !Number.isInteger(qty) ||
    qty < 1 ||
    qty > 20
  ) {
    return response(400, "Thông tin đơn hàng chưa hợp lệ. Vui lòng kiểm tra lại.");
  }

  const salePrice = Math.round(ORIGINAL_PRICE * (100 - DISCOUNT_PERCENT) / 100);
  const subtotal = ORIGINAL_PRICE * qty;
  const discount = (ORIGINAL_PRICE - salePrice) * qty;
  const total = salePrice * qty;
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailPassword.replace(/\s/g, "")
    }
  });

  try {
    await transporter.sendMail({
      from: gmailUser,
      to: orderEmail,
      subject: "Đơn hàng COD mới — KOWIN",
      text: [
        "ĐƠN HÀNG COD MỚI — KOWIN",
        "",
        "Sản phẩm: KOWIN Dép Kẹp EVA Classic",
        "Màu: " + color,
        "Size: " + size,
        "Số lượng: " + qty,
        "Đơn giá: " + formatVnd(salePrice),
        "Tạm tính: " + formatVnd(subtotal),
        "Giảm giá: " + formatVnd(discount),
        "Tổng cộng: " + formatVnd(total),
        "",
        "Người nhận: " + name,
        "Số điện thoại: " + phone,
        "Địa chỉ: " + address
      ].join("\n")
    });
  } catch (error) {
    console.error("Order email delivery failed:", error.code || error.name || "SMTP_ERROR");
    return response(502, "Chưa gửi được đơn hàng qua email. Vui lòng thử lại hoặc gọi hotline.");
  }

  return response(200, "Đơn hàng đã được gửi thành công.");
};
