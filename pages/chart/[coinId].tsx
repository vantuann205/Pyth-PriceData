 import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getCoinById } from '../../lib/coins';
import { priceCache } from '../../lib/priceCache';
import { usePriceUpdates } from '../../lib/usePriceUpdates';

interface PricePoint {
  time: string;
  price: number;
  timestamp: number;
}

export default function CoinChart() {
  // Fetch prices liên tục và cache (chạy ở background)
  usePriceUpdates();

  const router = useRouter();
  const { coinId } = router.query;
  
  const coin = typeof coinId === 'string' ? getCoinById(coinId) : null;
  
  // Khởi tạo từ cache nếu có
  const getCachedPrice = () => {
    if (!coin) return null;
    const cached = priceCache.get(coin.id);
    return cached?.price || null;
  };
  
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(getCachedPrice);
  const [source, setSource] = useState<string>('Pyth Network');
  const [isConnected, setIsConnected] = useState<boolean>(true);

  // Subscribe to cache updates - nhận price real-time
  useEffect(() => {
    if (!coin) return;

    // Subscribe to coin để nhận updates ngay khi có
    const unsubscribe = priceCache.subscribe(coin.id, (cached) => {
      const now = Date.now();
      const timeStr = new Date().toLocaleTimeString('vi-VN');
      
      setCurrentPrice(cached.price);
      setSource(cached.source);
      setIsConnected(true);
      
      // Lưu vào backend (fire and forget)
      fetch('/api/save-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coinId: coin.id,
          price: cached.price,
          source: cached.source
        })
      }).catch(() => {});
      
      // Thêm vào history (giữ tối đa 120 điểm = 2 phút)
      setPriceHistory(prev => {
        const newHistory = [...prev, {
          time: timeStr,
          price: cached.price,
          timestamp: now
        }];
        
        if (newHistory.length > 120) {
          return newHistory.slice(-120);
        }
        return newHistory;
      });
    });

    // Load history SONG SONG (không block)
    fetch(`/api/price-history?coinId=${coin.id}&limit=50`)
      .then(res => res.json())
      .then(historyData => {
        if (historyData.success && historyData.data.length > 0) {
          const historicalData: PricePoint[] = historyData.data.map((item: any) => ({
            time: new Date(item.timestamp).toLocaleTimeString('vi-VN'),
            price: item.price,
            timestamp: item.timestamp
          }));
          
          // Merge history với current data
          setPriceHistory(prev => {
            if (prev.length === 0) return historicalData;
            const oldestNewTimestamp = prev[0]?.timestamp || Date.now();
            const oldHistory = historicalData.filter(h => h.timestamp < oldestNewTimestamp);
            return [...oldHistory, ...prev];
          });
        }
      })
      .catch(err => console.error('Error loading history:', err));

    return () => {
      unsubscribe();
    };
  }, [coin]);

  if (!coin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Coin not found</h1>
          <Link href="/" className="text-purple-400 hover:text-purple-300">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  // Tính min/max cho scale với padding
  const prices = priceHistory.map(p => p.price);
  const dataMin = prices.length > 0 ? Math.min(...prices) : 0;
  const dataMax = prices.length > 0 ? Math.max(...prices) : 0;
  const dataRange = dataMax - dataMin;
  
  const paddingPercent = 0.2;
  const minRange = 0.001;
  
  const actualRange = Math.max(dataRange, minRange);
  const padding = actualRange * paddingPercent;
  
  const minPrice = dataMin - padding;
  const maxPrice = dataMax + padding;
  const priceRange = maxPrice - minPrice;

  const getPath = () => {
    if (priceHistory.length < 2) return '';
    
    const width = 800;
    const height = 300;
    const padding = 20;
    
    const points = priceHistory.map((point, index) => {
      const x = padding + (index / (priceHistory.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((point.price - minPrice) / priceRange) * (height - 2 * padding);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-4">
      <Head>
        <title>{coin.name} ({coin.symbol}) Price Chart | Real-time</title>
        <meta name="description" content={`Real-time ${coin.name} price chart`} />
      </Head>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
              {coin.icon}
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-300">
                {coin.name} ({coin.symbol})
              </h1>
              <p className="text-gray-400 mt-1">Real-time price updates every second</p>
            </div>
          </div>
          <Link href="/" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            ← Back
          </Link>
        </div>

        {/* Current Price Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-5xl font-bold text-white mb-2">
                ${currentPrice?.toFixed(6) || '0.000000'}
              </div>
              <div className="text-gray-400">
                {source} • {priceHistory.length} data points
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-2 ${
              isConnected 
                ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
                : 'bg-red-500/20 border border-red-500/30 text-red-300'
            }`}>
              <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-2">Price Movement (Last 2 minutes)</h2>
            {priceHistory.length >= 2 && (
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div>Min: ${dataMin.toFixed(6)}</div>
                <div>Max: ${dataMax.toFixed(6)}</div>
                <div>Range: ${dataRange.toFixed(6)}</div>
                <div className="text-purple-400">• Optimized view</div>
              </div>
            )}
          </div>

          {priceHistory.length < 2 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="mb-2">Collecting data...</p>
                <p className="text-xs">
                  {priceHistory.length > 0 
                    ? `${priceHistory.length} / 2 points needed to draw chart` 
                    : 'Fetching first price...'}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <svg 
                viewBox="0 0 800 300" 
                className="w-full h-auto"
                style={{ maxHeight: '300px' }}
              >
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal grid lines with price labels */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const yPos = 20 + (i * 260 / 4);
                  const priceAtLine = maxPrice - (i / 4) * priceRange;
                  return (
                    <g key={i}>
                      <line
                        x1="20"
                        y1={yPos}
                        x2="780"
                        y2={yPos}
                        stroke="#374151"
                        strokeWidth="1"
                        strokeDasharray="5,5"
                      />
                      <text
                        x="10"
                        y={yPos + 4}
                        fill="#9CA3AF"
                        fontSize="10"
                        textAnchor="end"
                      >
                        ${priceAtLine.toFixed(4)}
                      </text>
                    </g>
                  );
                })}

                {/* Area under the line */}
                <path
                  d={`${getPath()} L 780,280 L 20,280 Z`}
                  fill="url(#gradient)"
                />

                {/* Price line */}
                <path
                  d={getPath()}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Current price dot */}
                {priceHistory.length > 0 && (
                  <circle
                    cx={20 + ((priceHistory.length - 1) / (priceHistory.length - 1)) * 760}
                    cy={280 - ((priceHistory[priceHistory.length - 1].price - minPrice) / priceRange) * 260}
                    r="6"
                    fill="#8b5cf6"
                    className="animate-pulse"
                  />
                )}
              </svg>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Data Points</div>
            <div className="text-2xl font-bold text-white">{priceHistory.length}</div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Update Frequency</div>
            <div className="text-2xl font-bold text-white">1 giây</div>
          </div>
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Source</div>
            <div className="text-2xl font-bold text-purple-300">{source}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
