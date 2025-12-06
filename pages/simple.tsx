import { useEffect, useState } from 'react';
import { TOP_COINS } from '../lib/coins';

export default function Simple() {
  const [status, setStatus] = useState('Loading...');
  const [prices, setPrices] = useState<any[]>([]);

  useEffect(() => {
    console.log('Simple page loaded!');
    console.log('TOP_COINS:', TOP_COINS);
    
    const test = async () => {
      try {
        setStatus('Building URL...');
        const url = new URL('https://hermes.pyth.network/api/latest_price_feeds');
        TOP_COINS.forEach(coin => {
          url.searchParams.append('ids[]', coin.priceFeedId);
        });
        
        console.log('Fetching from:', url.toString());
        setStatus(`Fetching from: ${url.toString().substring(0, 100)}...`);
        
        const res = await fetch(url.toString());
        console.log('Response status:', res.status);
        
        if (!res.ok) {
          setStatus(`Error: ${res.status} ${res.statusText}`);
          return;
        }
        
        const data = await res.json();
        console.log('Got data:', data.length, 'coins');
        setStatus(`Got ${data.length} coins!`);
        setPrices(data.map((d: any) => ({
          id: d.id,
          price: parseFloat(d.price.price) * Math.pow(10, d.price.expo)
        })));
        
      } catch (error: any) {
        console.error('Error:', error);
        setStatus(`Error: ${error.message}`);
      }
    };
    
    test();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Simple Test</h1>
      <p>Status: {status}</p>
      <h2>Prices:</h2>
      <ul>
        {prices.map((p, i) => (
          <li key={i}>
            {p.id}: ${p.price.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}
