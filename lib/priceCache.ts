// Global cache cho prices - giữ data khi chuyển trang
interface CachedPrice {
  price: number;
  timestamp: number;
  source: string;
  dayStartPrice?: number; // Giá đầu ngày (24h ago)
  dayStartTimestamp?: number; // Timestamp của giá đầu ngày
}

interface PriceHistoryPoint {
  price: number;
  timestamp: number;
  time: string;
}

class PriceCache {
  private cache: Map<string, CachedPrice> = new Map();
  private listeners: Map<string, Set<(price: CachedPrice) => void>> = new Map();
  private dayStartPrices: Map<string, { price: number; timestamp: number }> = new Map();
  private priceHistory: Map<string, PriceHistoryPoint[]> = new Map(); // Lưu 30 điểm lịch sử
  private readonly STORAGE_KEY = 'crypto_day_start_prices';
  private readonly HISTORY_STORAGE_KEY = 'crypto_price_history';
  private readonly MAX_HISTORY_POINTS = 30;

  constructor() {
    // Load day start prices từ localStorage khi khởi tạo
    this.loadDayStartPrices();
    this.loadPriceHistory();
  }

  // Load day start prices từ localStorage
  private loadDayStartPrices() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([coinId, value]: [string, any]) => {
          this.dayStartPrices.set(coinId, value);
        });
      }
    } catch (error) {
      console.error('Error loading day start prices:', error);
    }
  }

  // Save day start prices vào localStorage
  private saveDayStartPrices() {
    if (typeof window === 'undefined') return;
    
    try {
      const data: Record<string, any> = {};
      this.dayStartPrices.forEach((value, key) => {
        data[key] = value;
      });
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving day start prices:', error);
    }
  }

  // Load price history từ localStorage
  private loadPriceHistory() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.HISTORY_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([coinId, history]: [string, any]) => {
          this.priceHistory.set(coinId, history);
        });
      }
    } catch (error) {
      console.error('Error loading price history:', error);
    }
  }

  // Save price history vào localStorage
  private savePriceHistory() {
    if (typeof window === 'undefined') return;
    
    try {
      const data: Record<string, any> = {};
      this.priceHistory.forEach((value, key) => {
        data[key] = value;
      });
      localStorage.setItem(this.HISTORY_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving price history:', error);
    }
  }

  // Lấy price history của coin
  getHistory(coinId: string): PriceHistoryPoint[] {
    return this.priceHistory.get(coinId) || [];
  }

  // Lấy giá từ cache
  get(coinId: string): CachedPrice | null {
    return this.cache.get(coinId) || null;
  }

  // Set giá vào cache và notify listeners
  set(coinId: string, price: number, source: string = 'Pyth Network') {
    const now = Date.now();
    
    // Lấy giá đầu ngày hiện tại
    let dayStartPrice = this.dayStartPrices.get(coinId);
    
    // Nếu chưa có giá đầu ngày, set giá hiện tại làm baseline (giá đầu ngày)
    // Nếu đã qua 24h kể từ lần set giá đầu ngày, reset lại với giá hiện tại
    if (!dayStartPrice || (now - dayStartPrice.timestamp) >= 24 * 60 * 60 * 1000) {
      dayStartPrice = { price, timestamp: now };
      this.dayStartPrices.set(coinId, dayStartPrice);
      this.saveDayStartPrices(); // Lưu vào localStorage
    }
    
    const cached: CachedPrice = {
      price,
      timestamp: now,
      source,
      dayStartPrice: dayStartPrice.price,
      dayStartTimestamp: dayStartPrice.timestamp
    };
    
    this.cache.set(coinId, cached);
    
    // Thêm vào price history (giữ 30 điểm gần nhất)
    let history = this.priceHistory.get(coinId) || [];
    history.push({
      price,
      timestamp: now,
      time: new Date(now).toLocaleTimeString('vi-VN')
    });
    
    // Giữ tối đa 30 điểm
    if (history.length > this.MAX_HISTORY_POINTS) {
      history = history.slice(-this.MAX_HISTORY_POINTS);
    }
    
    this.priceHistory.set(coinId, history);
    this.savePriceHistory(); // Lưu vào localStorage
    
    // Notify tất cả listeners
    const listeners = this.listeners.get(coinId);
    if (listeners) {
      listeners.forEach(callback => callback(cached));
    }
  }

  // Subscribe để nhận updates real-time
  subscribe(coinId: string, callback: (price: CachedPrice) => void) {
    if (!this.listeners.has(coinId)) {
      this.listeners.set(coinId, new Set());
    }
    this.listeners.get(coinId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(coinId);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  // Lấy tất cả prices
  getAll(): Map<string, CachedPrice> {
    return new Map(this.cache);
  }

  // Set nhiều prices cùng lúc
  setAll(prices: Array<{ coinId: string; price: number; source?: string }>) {
    prices.forEach(({ coinId, price, source }) => {
      this.set(coinId, price, source);
    });
  }
}

// Export singleton instance
export const priceCache = new PriceCache();
