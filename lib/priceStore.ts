// Shared price history store using global to persist across HMR
interface PricePoint {
  price: number;
  timestamp: number;
  source: string;
}

interface GlobalPriceStore {
  priceHistoryMap: Map<string, PricePoint[]>;
  isTracking: boolean;
  trackingInterval: NodeJS.Timeout | null;
}

// Use global to persist across hot reloads in development
declare global {
  var priceStoreData: GlobalPriceStore | undefined;
}

if (!global.priceStoreData) {
  global.priceStoreData = {
    priceHistoryMap: new Map<string, PricePoint[]>(),
    isTracking: false,
    trackingInterval: null
  };
}

class PriceStore {
  private get data(): GlobalPriceStore {
    return global.priceStoreData!;
  }

  addPrice(coinId: string, price: number, source: string) {
    const now = Date.now();
    
    let history = this.data.priceHistoryMap.get(coinId) || [];
    
    history.push({
      price,
      timestamp: now,
      source
    });
    
    // Giữ tối đa 300 điểm (5 phút)
    if (history.length > 300) {
      history = history.slice(-300);
    }
    
    this.data.priceHistoryMap.set(coinId, history);
  }

  getHistory(coinId: string, limit: number = 50): PricePoint[] {
    const history = this.data.priceHistoryMap.get(coinId) || [];
    return history.slice(-limit);
  }

  getAllHistory(): Map<string, PricePoint[]> {
    return this.data.priceHistoryMap;
  }

  setTracking(value: boolean) {
    this.data.isTracking = value;
  }

  getTracking(): boolean {
    return this.data.isTracking;
  }

  setInterval(interval: NodeJS.Timeout | null) {
    this.data.trackingInterval = interval;
  }

  getInterval(): NodeJS.Timeout | null {
    return this.data.trackingInterval;
  }

  clearInterval() {
    if (this.data.trackingInterval) {
      clearInterval(this.data.trackingInterval);
      this.data.trackingInterval = null;
    }
  }
}

// Export singleton instance
export const priceStore = new PriceStore();
