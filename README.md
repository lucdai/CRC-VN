# CRC VN - Điểm Danh Thông Minh (Android App)

Ứng dụng Android được đóng gói từ mã nguồn web (Attendance App UI Demo v35), hỗ trợ chạy **offline hoàn toàn**.

## Tính năng
- Chạy không cần mạng (toàn bộ assets được bundle trong APK).
- Hỗ trợ PWA (Service Worker & Manifest).
- Lưu trữ dữ liệu local qua `localStorage`.

## Cấu trúc Bundle
- `index.html`: Giao diện chính.
- `assets/icons/`: Icon ứng dụng (192x192, 512x512).
- `js/`: Thư viện local (Tailwind, Chart.js, html2canvas).
- `css/`: Font Inter local.
- `manifest.json` & `service-worker.js`: Hỗ trợ cài đặt và cache offline.

## Hướng dẫn Ký APK (Signing)
Nếu bạn muốn phát hành ứng dụng hoặc cài đặt bản chính thức, hãy làm theo các bước sau:

1. **Tạo Keystore (nếu chưa có):**
   ```bash
   keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias
   ```

2. **Ký APK bằng `apksigner` (có trong Android SDK):**
   ```bash
   apksigner sign --ks my-release-key.jks --out app-release-signed.apk app-debug.apk
   ```

3. **Tối ưu hóa APK (zipalign):**
   ```bash
   zipalign -v 4 app-debug.apk app-release-aligned.apk
   ```

## Tự động Build
Dự án đã được thiết lập GitHub Actions. Mỗi khi bạn push code lên nhánh `main`, một bản APK debug sẽ được tự động tạo trong phần **Actions** của repository.

## Cài đặt
Tải file `app-debug.apk` về điện thoại Android, mở file và chọn "Cài đặt" (Cho phép cài đặt từ nguồn không xác định nếu được hỏi).
