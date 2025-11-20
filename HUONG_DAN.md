# HƯỚNG DẪN LẤY GIÁ ADA TỪ PYTH NETWORK

## Giới Thiệu

Pyth Network là một oracle network cung cấp dữ liệu giá real-time cho crypto và tài sản tài chính. Điểm đặc biệt:

- ✅ **Hoàn toàn miễn phí** - Không cần đăng ký, không cần API key
- ✅ **Real-time** - Cập nhật liên tục
- ✅ **Độ tin cậy cao** - Dữ liệu từ 90+ publishers uy tín

## Bước 1: Cài Đặt

```bash
# Clone repository (nếu chưa có)
git clone <your-repo>
cd <your-repo>

# Cài đặt dependencies
npm install
```

## Bước 2: Chạy Server

```bash
npm run dev
```

Server sẽ chạy tại: http://localhost:3000

## Bước 3: Test API

### Cách 1: Dùng Trình Duyệt

Mở trình duyệt và truy cập:
```
http://localhost:3000/api/ada-price
```

### Cách 2: Dùng curl

```bash
curl http://localhost:3000/api/ada-price
```

### Cách 3: Dùng JavaScript/Fetch

```javascript
fetch('http://localhost:3000/api/ada-price')
  .then(res => res.json())
  .then(data => console.log('Giá ADA:', data.price, 'USD'));
```

## Kết Quả Mong Đợi

```json
{
  "price": 0.465157,
  "source": "Pyth Network",
  "timestamp": "2025-11-20T10:30:00.000Z",
  "confidence": 0.000527
}
```

**Giải thích:**
- `price`: Giá ADA/USD hiện tại (0.465157 USD)
- `source`: Nguồn dữ liệu (Pyth Network)
- `timestamp`: Thời gian cập nhật giá
- `confidence`: Độ tin cậy (±0.000527 USD)

## Giải Thích Code

### File: `pages/api/ada-price.ts`

```typescript
// Price Feed ID của ADA/USD trên Pyth Network
const ADA_USD_PRICE_FEED_ID = 
  "0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d";

// Gọi API Pyth (không cần API key)
const pythResponse = await fetch(
  `https://hermes.pyth.network/api/latest_price_feeds?ids[]=${ADA_USD_PRICE_FEED_ID}`
);

// Parse dữ liệu
const data = await pythResponse.json();
const priceInfo = data[0].price;

// Tính giá thực từ price và expo
// Ví dụ: price = 46515737, expo = -8
// Giá thực = 46515737 × 10^(-8) = 0.46515737 USD
const price = parseFloat(priceInfo.price) * Math.pow(10, priceInfo.expo);
```

## Cấu Trúc Response từ Pyth

```json
[
  {
    "id": "0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d",
    "price": {
      "price": "46515737",      // Giá raw
      "conf": "52691",          // Confidence interval
      "expo": -8,               // Exponent
      "publish_time": 1763636696 // Unix timestamp
    },
    "ema_price": {              // Exponential Moving Average
      "price": "46600416",
      "conf": "47856",
      "expo": -8,
      "publish_time": 1763636696
    }
  }
]
```

## Lấy Giá Token Khác

Bạn có thể lấy giá của các token khác bằng cách thay đổi Price Feed ID:

### Bitcoin (BTC/USD)
```typescript
const BTC_FEED = "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43";
```

### Ethereum (ETH/USD)
```typescript
const ETH_FEED = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";
```

### Solana (SOL/USD)
```typescript
const SOL_FEED = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
```

Xem danh sách đầy đủ: https://pyth.network/developers/price-feed-ids

## Test Trực Tiếp Pyth API

Bạn có thể test trực tiếp API của Pyth:

```bash
curl "https://hermes.pyth.network/api/latest_price_feeds?ids[]=0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d"
```

## Tại Sao Pyth Network?

### 1. Miễn Phí Hoàn Toàn
- Không cần đăng ký
- Không cần API key
- Không giới hạn request (trong mức hợp lý)

### 2. Dữ Liệu Chất Lượng Cao
- Tổng hợp từ 90+ publishers
- Bao gồm các sàn lớn: Binance, OKX, Bybit, v.v.
- Market makers chuyên nghiệp

### 3. Real-time
- Cập nhật liên tục
- Độ trễ thấp
- Dữ liệu on-chain

### 4. Đa Blockchain
- Solana
- Ethereum
- Aptos
- Sui
- Và nhiều chain khác

## So Sánh với Các Oracle Khác

| Tính Năng | Pyth Network | Charli3 | CoinGecko |
|-----------|--------------|---------|-----------|
| Miễn phí | ✅ | ❌ (cần API key) | ⚠️ (giới hạn) |
| Real-time | ✅ | ✅ | ❌ |
| Không cần đăng ký | ✅ | ❌ | ❌ |
| Độ tin cậy | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Số nguồn dữ liệu | 90+ | 7+ DEXs | Nhiều sàn |

## Lỗi Thường Gặp

### 1. "No price data available"
- Kiểm tra Price Feed ID có đúng không
- Thử lại sau vài giây

### 2. Network Error
- Kiểm tra kết nối internet
- Pyth API có thể đang bảo trì (hiếm khi)

### 3. Invalid Price Feed ID
- Kiểm tra lại ID tại: https://pyth.network/developers/price-feed-ids
- Đảm bảo có prefix "0x"

## Tài Liệu Tham Khảo

- **Pyth Network**: https://pyth.network/
- **Price Feed IDs**: https://pyth.network/developers/price-feed-ids
- **API Documentation**: https://docs.pyth.network/price-feeds/api-instances-and-providers/hermes
- **GitHub**: https://github.com/pyth-network

## Deploy Production

### Vercel
```bash
npm run build
vercel deploy
```

### Docker
```bash
docker build -t ada-price-api .
docker run -p 3000:3000 ada-price-api
```

## Câu Hỏi Thường Gặp

**Q: Có giới hạn số lượng request không?**
A: Không có giới hạn cứng, nhưng nên sử dụng hợp lý (không spam).

**Q: Dữ liệu cập nhật bao lâu một lần?**
A: Liên tục, thường dưới 1 giây.

**Q: Có thể dùng cho production không?**
A: Có, Pyth được sử dụng bởi nhiều dApp lớn.

**Q: Có cần cache không?**
A: Nên cache 1-5 giây để giảm tải server.
