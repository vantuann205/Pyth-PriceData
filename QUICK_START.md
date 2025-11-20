# 🚀 QUICK START - GIÁ ADA REAL-TIME

## ⚡ 2 Bước Siêu Nhanh

### 1️⃣ Cài Đặt (1 phút)
```bash
npm install
```

### 2️⃣ Chạy (30 giây)
```bash
npm run dev
```

## ✅ Xem Ngay

### Trang Chính (Real-time Price)
```
http://localhost:3000
```
- 🔴 **LIVE** - Giá cập nhật mỗi 1 giây
- 🎨 **Animation** - Màu xanh khi tăng, đỏ khi giảm
- ⏱️ **Countdown** - Đếm ngược đến lần cập nhật tiếp theo
- 📊 **% Change** - Hiển thị % thay đổi giá

### Trang Chart (Real-time Chart)
```
http://localhost:3000/chart
```
- 📈 **Live Chart** - Biểu đồ cập nhật real-time
- 📊 **60 điểm dữ liệu** - Lưu 1 phút lịch sử
- 🎨 **SVG Animation** - Gradient đẹp mắt
- 📉 **Statistics** - Min, Max, Range

## 🎯 Tính Năng Real-time

### ⚡ Cập Nhật Mỗi Giây
Giá ADA tự động cập nhật mỗi 1 giây mà **không cần refresh trang**!

### 🎨 Animation Thông Minh
- **Màu xanh + scale up** khi giá tăng
- **Màu đỏ + scale up** khi giá giảm
- **Smooth transition** 300ms

### 🔴 Live Indicator
- **Chấm xanh nhấp nháy** khi đang kết nối
- **Chấm đỏ** khi mất kết nối

### ⏱️ Countdown Timer
Hiển thị thời gian đến lần cập nhật tiếp theo: "Update: 1s"

## 📊 Kết Quả

### Trang Chính
```
┌─────────────────────────────┐
│  🔴 LIVE    Update: 1s      │
│                             │
│     $0.465403               │
│     ↑ 0.123%                │
│                             │
│  Source: Pyth Network       │
│  Last Update: 11:08:38      │
│                             │
│  [Refresh] [Chart]          │
└─────────────────────────────┘
```

### Trang Chart
```
┌─────────────────────────────┐
│  ADA/USD Live Chart         │
│  🔴 LIVE    Next: 1s        │
│                             │
│  $0.465403                  │
│                             │
│  ╱╲  ╱╲                     │
│ ╱  ╲╱  ╲  ╱╲                │
│          ╲╱  ╲              │
│                             │
│  Min: 0.465100              │
│  Max: 0.465600              │
│  Range: 0.000500            │
└─────────────────────────────┘
```

## 🎉 Đặc Điểm

- ✅ **Không cần API key** - Hoàn toàn miễn phí
- ✅ **Không cần đăng ký** - Clone và chạy ngay
- ✅ **Real-time** - Cập nhật mỗi 1 giây
- ✅ **Animation đẹp** - Smooth transitions
- ✅ **Chart live** - Biểu đồ real-time
- ✅ **Responsive** - Hoạt động trên mobile

## 🔧 Test API Trực Tiếp

```bash
# Test API endpoint
curl http://localhost:3000/api/ada-price

# Hoặc dùng script test
node test-api.js
```

## 💡 Thay Đổi Tần Suất Cập Nhật

Mở `pages/index.tsx` và thay đổi:

```typescript
// Từ 1 giây
setInterval(fetchPrice, 1000);

// Sang 2 giây
setInterval(fetchPrice, 2000);

// Hoặc 0.5 giây (nhanh hơn)
setInterval(fetchPrice, 500);
```

## 📈 Lấy Giá Token Khác

Mở `pages/api/ada-price.ts` và thay đổi Price Feed ID:

```typescript
// Bitcoin
const PRICE_FEED_ID = "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43";

// Ethereum
const PRICE_FEED_ID = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";

// Solana
const PRICE_FEED_ID = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
```

## 🚀 Deploy

### Vercel (1 click)
```bash
vercel deploy
```

### Netlify
```bash
netlify deploy
```

## 📚 Đọc Thêm

- `README.md` - Tài liệu đầy đủ
- `HUONG_DAN.md` - Hướng dẫn chi tiết
- https://pyth.network/ - Pyth Network

---

**Giá ADA cập nhật real-time mỗi giây, không cần refresh! 🎉**
