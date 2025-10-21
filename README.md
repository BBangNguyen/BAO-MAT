# Mô Phỏng Bảo Mật Cookie

Dự án này mô phỏng các cuộc tấn công XSS nhằm vào cookie và các biện pháp bảo vệ chống lại chúng.

## Tính năng

- **Tạo cookie** với các biện pháp bảo vệ khác nhau:
  - HttpOnly cookie
  - Mã hóa AES
  - XSS Protection
  - Input Sanitization
  - Content Security Policy (CSP)

- **Mô phỏng các cuộc tấn công XSS** để lấy cookie:
  - Đánh cắp cookie
  - Hiển thị popup cảnh báo
  - Chèn thẻ script

- **Ghi lại nhật ký tấn công** với các chỉ báo trực quan cho thấy cuộc tấn công nào:
  - Thành công
  - Bị chặn
  - Bị mã hóa nhưng bị lộ

## Cách sử dụng

1. Clone repository:
```bash
git clone https://github.com/BBangNguyen/BAO-MAT.git
```

2. Cài đặt các phụ thuộc:
```bash
npm install
# hoặc
pnpm install
```

3. Khởi chạy server phát triển:
```bash
npm run dev
# hoặc
pnpm dev
```

4. Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt của bạn để xem kết quả.

## Công nghệ sử dụng

- Next.js
- React
- Shadcn UI
- Crypto-js cho mã hóa

## Học tập

Dự án này được thiết kế với mục đích giáo dục để hiểu rõ hơn về:
- Cross-Site Scripting (XSS)
- Các biện pháp bảo vệ Cookie
- Mã hóa dữ liệu nhạy cảm
- Input Sanitization
- Content Security Policy