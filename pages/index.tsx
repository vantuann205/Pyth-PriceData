import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { TOP_COINS } from '../lib/coins';
import { priceCache } from '../lib/priceCache';
import { usePriceUpdates } from '../lib/usePriceUpdates';

interface CoinPrice {
  price: number;
  dayStartPrice: number | null; // Giá đầu ngày để tính % change
  change: 'up' | 'down' | 'same';
  loading: boolean;
}

export default function Home() {
  // Fetch prices liên tục và cache (chạy ở background)
  usePriceUpdates();

  // Khởi tạo từ cache nếu có (hiển thị ngay không cần load)
  const getInitialPrices = () => {
    const prices = new Map<string, CoinPrice>();
    TOP_COINS.forEach(coin => {
      const cached = priceCache.get(coin.id);
      
      let change: 'up' | 'down' | 'same' = 'same';
      if (cached && cached.dayStartPrice) {
        if (cached.price > cached.dayStartPrice) change = 'up';
        else if (cached.price < cached.dayStartPrice) change = 'down';
      }
      
      prices.set(coin.id, {
        price: cached?.price || 0,
        dayStartPrice: cached?.dayStartPrice || null,
        change,
        loading: !cached
      });
    });
    return prices;
  };
  
  const [coinPrices, setCoinPrices] = useState<Map<string, CoinPrice>>(getInitialPrices);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  // Khởi tạo ngay nếu đã có cache (không cần loading)
  const [isInitialized, setIsInitialized] = useState<boolean>(() => {
    // Kiểm tra xem đã có cache chưa
    const hasCache = TOP_COINS.some(coin => priceCache.get(coin.id) !== null);
    return hasCache;
  });

  // Subscribe to cache updates - dữ liệu update real-time
  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    // Subscribe to mỗi coin để nhận updates ngay khi có
    TOP_COINS.forEach(coin => {
      const unsubscribe = priceCache.subscribe(coin.id, (cached) => {
        setCoinPrices(prev => {
          const newPrices = new Map(prev);
          
          // Tính change dựa trên giá đầu ngày
          let change: 'up' | 'down' | 'same' = 'same';
          if (cached.dayStartPrice) {
            if (cached.price > cached.dayStartPrice) change = 'up';
            else if (cached.price < cached.dayStartPrice) change = 'down';
          }
          
          newPrices.set(coin.id, {
            price: cached.price,
            dayStartPrice: cached.dayStartPrice || null,
            change,
            loading: false
          });
          
          return newPrices;
        });
        
        setIsConnected(true);
        setIsInitialized(true);

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
      });
      
      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4 font-sans text-white">
      <Head>
        <title>Top 10 Crypto Prices | Real-time</title>
        <meta name="description" content="Real-time top 10 cryptocurrency prices from Pyth Network" />
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-300 mb-3">
            Top 10 Crypto Prices
          </h1>
          <p className="text-gray-400 text-lg">Real-time updates • Instant load</p>
          <div className={`inline-flex items-center space-x-2 mt-4 px-4 py-2 rounded-full text-sm font-bold ${
            isConnected 
              ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
              : 'bg-red-500/20 border border-red-500/30 text-red-300'
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
          </div>
        </div>

        {/* Coins Grid */}
        {!isInitialized ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading prices...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {TOP_COINS.map((coin, index) => {
              const priceData = coinPrices.get(coin.id);
              const price = priceData?.price || 0;
              const dayStartPrice = priceData?.dayStartPrice;
              const change = priceData?.change || 'same';
              const loading = priceData?.loading !== false;
              
              // Tính % change dựa trên giá đầu ngày (24h change)
              const percentChange = dayStartPrice && dayStartPrice !== 0
                ? ((price - dayStartPrice) / dayStartPrice) * 100
                : 0;

              return (
                <div key={coin.id} className="relative group">
                  <div className={`absolute -inset-0.5 bg-gradient-to-r rounded-xl blur opacity-20 transition-all duration-500 ${
                    change === 'up' ? 'from-green-600 to-emerald-600' :
                    change === 'down' ? 'from-red-600 to-rose-600' :
                    'from-purple-600 to-blue-600'
                  }`}></div>
                  
                  <div className="relative bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 hover:border-purple-500/50 transition-all">
                    {/* Coin Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                          {coin.icon}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-purple-400">#{index + 1}</span>
                            <span className="font-bold text-white">{coin.symbol}</span>
                          </div>
                          <div className="text-xs text-gray-500">{coin.name}</div>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    {loading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-700/50 rounded mb-2"></div>
                        <div className="h-4 bg-gray-700/50 rounded w-20"></div>
                      </div>
                    ) : (
                      <>
                        <div className={`text-2xl font-bold mb-1 transition-all duration-300 ${
                          change === 'up' ? 'text-green-400' :
                          change === 'down' ? 'text-red-400' :
                          'text-white'
                        }`}>
                          ${price.toFixed(6)}
                        </div>
                        
                        {/* Luôn hiển thị % change (24h) */}
                        <div className={`flex items-center space-x-1 text-xs font-bold ${
                          percentChange > 0 ? 'text-green-400' : 
                          percentChange < 0 ? 'text-red-400' : 
                          'text-gray-400'
                        }`}>
                          {percentChange > 0 ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : percentChange < 0 ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span>{percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}% 24h</span>
                        </div>
                      </>
                    )}

                    {/* View Chart Button */}
                    <Link
                      href={`/chart/${coin.id}`}
                      className="mt-4 w-full py-2 px-4 bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center space-x-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>View Chart</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center text-xs text-gray-600">
          Powered by Pyth Network • Real-time updates with instant cache
        </div>
      </div>
    </div>
  );
}
