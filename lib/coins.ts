// Danh sách top 10 coins với Price Feed ID từ Pyth Network
export interface CoinInfo {
  id: string;
  name: string;
  symbol: string;
  priceFeedId: string;
  icon: string;
}

export const TOP_COINS: CoinInfo[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    priceFeedId: 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
    icon: '₿'
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    priceFeedId: 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    icon: 'Ξ'
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    priceFeedId: 'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
    icon: '◎'
  },
  {
    id: 'binancecoin',
    name: 'BNB',
    symbol: 'BNB',
    priceFeedId: '2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f',
    icon: '◆'
  },
  {
    id: 'ripple',
    name: 'XRP',
    symbol: 'XRP',
    priceFeedId: 'ec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8',
    icon: '✕'
  },
  {
    id: 'polkadot',
    name: 'Polkadot',
    symbol: 'DOT',
    priceFeedId: 'ca3eed9b267293f6595901c734c7525ce8ef49adafe8284606ceb307afa2ca5b',
    icon: '●'
  },
  {
    id: 'dogecoin',
    name: 'Dogecoin',
    symbol: 'DOGE',
    priceFeedId: 'dcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c',
    icon: 'Ð'
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    priceFeedId: '93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7',
    icon: '▲'
  },
  {
    id: 'chainlink',
    name: 'Chainlink',
    symbol: 'LINK',
    priceFeedId: '8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221',
    icon: '⬡'
  },
  {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ADA',
    priceFeedId: '2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d',
    icon: '₳'
  }
];

export const getCoinById = (id: string): CoinInfo | undefined => {
  return TOP_COINS.find(coin => coin.id === id);
};

export const getCoinBySymbol = (symbol: string): CoinInfo | undefined => {
  return TOP_COINS.find(coin => coin.symbol === symbol);
};
