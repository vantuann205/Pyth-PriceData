import { useEffect, useRef } from 'react';
import { priceCache } from './priceCache';

// Hook để fetch prices liên tục và cache
export function usePriceUpdates() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      // Tránh fetch đồng thời
      if (isFetchingRef.current) return;
      
      isFetchingRef.current = true;
      
      // Hủy request trước đó nếu có
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      try {
        const res = await fetch('/api/all-prices', {
          signal: abortControllerRef.current.signal,
          // Thêm cache để tối ưu
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (res.ok) {
          const result = await res.json();
          
          if (result.success && result.data) {
            // Cache tất cả prices
            priceCache.setAll(
              result.data.map((d: any) => ({
                coinId: d.coinId,
                price: d.price,
                source: 'Pyth Network'
              }))
            );
          }
        }
      } catch (error: any) {
        // Ignore abort errors
        if (error.name !== 'AbortError') {
          console.error('Error fetching prices:', error);
        }
      } finally {
        isFetchingRef.current = false;
      }
    };

    // Fetch ngay lập tức
    fetchPrices();

    // Fetch liên tục mỗi 1 giây (giữ nguyên để real-time)
    intervalRef.current = setInterval(fetchPrices, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
}
