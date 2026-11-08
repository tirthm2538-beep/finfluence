export type AssetCategory =
  | 'Simulated Index Fund'
  | 'Simulated Equity'
  | 'Simulated Commodity';

export interface MarketInstrument {
  symbol: string;
  name: string;
  basePrice: number;
  price: number;
  change24h: number;
  changePercent24h: number;
  category: AssetCategory;
  conceptTieIn: string;
  description: string;
  isSimulated: true;
}

export interface PortfolioHolding {
  symbol: string;
  name: string;
  category: AssetCategory;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
}

export interface PortfolioTransaction {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  timestamp: string;
}

export interface PortfolioHistoryPoint {
  date: string;
  value: number;
}

export interface UserPortfolio {
  cashBalance: number;
  investedAmount: number;
  holdings: PortfolioHolding[];
  transactions: PortfolioTransaction[];
  history: PortfolioHistoryPoint[];
  updatedAt: string;
}

export const INITIAL_CASH_BALANCE = 100000; // Starting with ₹1,00,000 virtual balance

// 6 Simulated stocks/funds with purely made-up names
export const BASE_SIMULATED_INSTRUMENTS: Omit<MarketInstrument, 'price' | 'change24h' | 'changePercent24h'>[] = [
  {
    symbol: 'SIM-INDEX50',
    name: 'Top 50 Simulated Index ETF',
    basePrice: 250.0,
    category: 'Simulated Index Fund',
    conceptTieIn: 'Concept #3: Indexing & Diversification',
    description: 'A practice basket tracking 50 fictional companies. Low volatility learning asset.',
    isSimulated: true,
  },
  {
    symbol: 'SIM-CHAIBYTES',
    name: 'ChaiBytes Cloud Tech (Simulated)',
    basePrice: 820.0,
    category: 'Simulated Equity',
    conceptTieIn: 'Concept #1: What is a Stock',
    description: 'Fictional student software developer. Demonstrates high-growth tech valuation.',
    isSimulated: true,
  },
  {
    symbol: 'SIM-GREENWATT',
    name: 'GreenWatt Renewables (Simulated)',
    basePrice: 410.0,
    category: 'Simulated Equity',
    conceptTieIn: 'Concept #5: Bull vs Bear Markets',
    description: 'Fictional solar and clean energy grid developer. Medium cyclical volatility.',
    isSimulated: true,
  },
  {
    symbol: 'SIM-METROMART',
    name: 'MetroMart Quick Retail (Simulated)',
    basePrice: 165.0,
    category: 'Simulated Equity',
    conceptTieIn: 'Concept #8: Volume & Momentum',
    description: 'Fictional 10-minute grocery app. Demonstrates consumer retail volatility.',
    isSimulated: true,
  },
  {
    symbol: 'SIM-VAULTBANK',
    name: 'Vault Horizon Bank (Simulated)',
    basePrice: 1240.0,
    category: 'Simulated Equity',
    conceptTieIn: 'Concept #9: Dividends & Banking',
    description: 'Fictional bluechip financial institution. Stable value with dividend practice.',
    isSimulated: true,
  },
  {
    symbol: 'SIM-AURUMGOLD',
    name: 'Aurum Virtual Gold Hedge (Simulated)',
    basePrice: 58.0,
    category: 'Simulated Commodity',
    conceptTieIn: 'Concept #8: Inflation & Hedging',
    description: 'Fictional gold commodity token. Tests counter-cyclical portfolio protection.',
    isSimulated: true,
  },
];
