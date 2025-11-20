# 🚀 Lấy Giá ADA Real-time từ Pyth Network

Ứng dụng Next.js hiển thị giá ADA (Cardano) **real-time** từ Pyth Network Oracle với cập nhật **mỗi giây**.

## ✨ Tính Năng

- ⚡ **Real-time Updates** - Giá cập nhật tự động mỗi 1 giây
- 📊 **Live Chart** - Biểu đồ giá real-time với 60 điểm dữ liệu
- 🎨 **Animation** - Hiệu ứng màu sắc khi giá tăng/giảm
- 📈 **Price Change Indicator** - Hiển thị % thay đổi giá
- 🔴 **Live Status** - Indicator trạng thái kết nối
- ⏱️ **Countdown Timer** - Đếm ngược đến lần cập nhật tiếp theo
- 💯 **Hoàn toàn miễn phí** - Không cần API key

## 🎯 Demo

### Trang Chính (Real-time Price)
- Giá ADA/USD cập nhật mỗi giây
- Animation màu xanh khi giá tăng, đỏ khi giá giảm
- Hiển thị % thay đổi giá
- Confidence interval từ Pyth Network
- Countdown timer

### Trang Chart
- Biểu đồ giá real-time
- Lưu 60 điểm dữ liệu (1 phút)
- SVG chart với gradient
- Min/Max/Range statistics

## 🚀 Cài Đặt và Chạy

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

## 🎨 Giao Diện

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

## 🔧 Cách Hoạt Động

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
});
```

## 📊 Pyth Network

### Tại Sao Dùng Pyth?

1. **Miễn phí hoàn toàn** - Không cần API key
2. **Real-time** - Cập nhật liên tục
3. **Độ tin cậy cao** - Dữ liệu từ 90+ publishers
4. **Low latency** - Độ trễ thấp
5. **Confidence interval** - Độ tin cậy của giá

### Price Feed ID

ADA/USD: `0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d`

### API Endpoint

```
https://hermes.pyth.network/api/latest_price_feeds?ids[]={PRICE_FEED_ID}
```

## 🎯 Tính Năng Real-time

### 1. Auto-refresh mỗi giây
```typescript
setInterval(fetchPrice, 1000); // Cập nhật mỗi 1 giây
```

### 2. Countdown Timer
```typescript
const [countdown, setCountdown] = useState<number>(1);

useEffect(() => {
  const timer = setInterval(() => {
    setCountdown((prev) => (prev > 0 ? prev - 1 : 1));
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

### 3. Price Change Detection
```typescript
if (data.price > price) {
  setPriceChange('up');
} else if (data.price < price) {
  setPriceChange('down');
}
```

### 4. Animation
```css
className={`transition-all duration-300 ${
  priceChange === 'up' ? 'text-green-400 scale-105' :
  priceChange === 'down' ? 'text-red-400 scale-105' :
  'text-white'
}`}
```

## 🔴 Live Status Indicator

```typescript
const [isConnected, setIsConnected] = useState<boolean>(true);

// Trong fetchPrice()
try {
  const res = await fetch('/api/ada-price');
  setIsConnected(true);
} catch (error) {
  setIsConnected(false);
}
```

## 📈 Lấy Giá Token Khác

Thay đổi Price Feed ID trong `pages/api/ada-price.ts`:

```typescript
// Bitcoin (BTC/USD)
const BTC_FEED = "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43";

// Ethereum (ETH/USD)
const ETH_FEED = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";

// Solana (SOL/USD)
const SOL_FEED = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
```

Xem tất cả: https://pyth.network/developers/price-feed-ids

## 🚀 Deploy Production

### Vercel
```bash
npm run build
vercel deploy
```

### Netlify
```bash
npm run build
netlify deploy
```

### Docker
```bash
docker build -t ada-price-realtime .
docker run -p 3000:3000 ada-price-realtime
```

## 🎨 Customization

### Thay đổi tần suất cập nhật

Trong `pages/index.tsx`:
```typescript
// Thay đổi từ 1000ms (1 giây) sang giá trị khác
setInterval(fetchPrice, 2000); // 2 giây
setInterval(fetchPrice, 500);  // 0.5 giây
```

### Thay đổi số điểm dữ liệu trong chart

Trong `pages/chart.tsx`:
```typescript
// Thay đổi từ 60 điểm sang giá trị khác
if (newHistory.length > 120) { // 2 phút
  return newHistory.slice(-120);
}
```

## 📚 Tài Liệu

- **Pyth Network**: https://pyth.network/
- **Price Feeds**: https://pyth.network/developers/price-feed-ids
- **API Docs**: https://docs.pyth.network/price-feeds/api-instances-and-providers/hermes
- **Next.js**: https://nextjs.org/docs

## 🐛 Troubleshooting

### Giá không cập nhật
- Kiểm tra console log có lỗi không
- Kiểm tra kết nối internet
- Refresh lại trang

### Chart không hiển thị
- Đợi ít nhất 2 giây để có dữ liệu
- Kiểm tra console log

### Animation không mượt
- Giảm tần suất cập nhật xuống 2-3 giây
- Kiểm tra performance của máy

## ⚡ Performance

- **Update frequency**: 1 giây
- **Data retention**: 60 điểm (1 phút)
- **Memory usage**: ~1MB cho chart data
- **Network**: ~1KB per request

## 🎉 Kết Luận

Ứng dụng này cung cấp:
- ✅ Giá ADA real-time cập nhật mỗi giây
- ✅ Không cần API key hay đăng ký
- ✅ Animation đẹp mắt
- ✅ Chart real-time
- ✅ Hoàn toàn miễn phí

**Chỉ cần `npm install` và `npm run dev` là có thể xem giá ADA real-time ngay!** 🚀
