# Lấy Giá TOP10 Coim Real-time từ Pyth Network

Ứng dụng Next.js hiển thị giá ADA (Cardano) **real-time** từ Pyth Network Oracle với cập nhật **mỗi giây**.

## Tính Năng

- **Real-time Updates** - Giá cập nhật tự động mỗi 1 giây
- **Live Chart** - Biểu đồ giá real-time với 60 điểm dữ liệu
- **Animation** - Hiệu ứng màu sắc khi giá tăng/giảm
- **Price Change Indicator** - Hiển thị % thay đổi giá
- **Live Status** - Indicator trạng thái kết nối
- **Countdown Timer** - Đếm ngược đến lần cập nhật tiếp theo
- **Hoàn toàn miễn phí** - Không cần API key

## Demo

### Trang Chính (Real-time Price)
- Giá 10 Coin cập nhật mỗi giây
- Animation màu xanh khi giá tăng, đỏ khi giá giảm
- Hiển thị % thay đổi giá
- Confidence interval từ Pyth Network
- Countdown timer

### Trang Chart
- Biểu đồ giá real-time
- Lưu 60 điểm dữ liệu (1 phút)
- SVG chart với gradient
- Min/Max/Range statistics

## Cài Đặt và Chạy

```bash
# Bước 1: Cài đặt dependencies
npm install

# Bước 2: Chạy development server
npm run dev
```

Mở trình duyệt:
- **Trang chính**: http://localhost:3000
- **Trang chart**: http://localhost:3000/chart

## 📡 API Endpoint

### GET /api/ada-price

Response:
```json
{
  "price": 0.465403,
  "source": "Pyth Network",
  "timestamp": "2025-11-20T11:08:38.000Z",
  "confidence": 0.000491
}
```

## Giao Diện

### Trang Chính
- **Giá lớn** hiển thị ở giữa màn hình
- **Màu xanh** khi giá tăng (với animation scale)
- **Màu đỏ** khi giá giảm (với animation scale)
- **Live indicator** màu xanh khi đang kết nối
- **Countdown** hiển thị thời gian đến lần cập nhật tiếp theo
- **% thay đổi** so với giá trước đó

### Trang Chart
- **Biểu đồ SVG** real-time
- **Gradient fill** dưới đường giá
- **Grid lines** để dễ đọc
- **Animated dot** tại điểm giá hiện tại
- **Statistics** (Min, Max, Range)

## Cách Hoạt Động

### Frontend (pages/index.tsx)
```typescript
// Cập nhật mỗi 1 giây
useEffect(() => {
  fetchPrice();
  const interval = setInterval(fetchPrice, 1000);
  return () => clearInterval(interval);
}, []);
```

### Animation Logic
```typescript
// Xác định giá tăng/giảm
if (data.price > price) {
  setPriceChange('up');    // Màu xanh
} else if (data.price < price) {
  setPriceChange('down');  // Màu đỏ
}
```

### Chart (pages/chart.tsx)
```typescript
// Lưu 60 điểm dữ liệu (1 phút)
setPriceHistory(prev => {
  const newHistory = [...prev, newPoint];
  if (newHistory.length > 60) {
    return newHistory.slice(-60);
  }
  return newHistory;
});.
```
