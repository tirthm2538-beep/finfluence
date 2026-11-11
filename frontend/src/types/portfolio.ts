export type AssetCategory =
  | 'Simulated Index Fund'
  | 'Simulated Equity'
  | 'Simulated Commodity';

export type MarketSector =
  | 'Indices'
  | 'IT & Tech'
  | 'Banking & Finance'
  | 'FMCG & Consumer'
  | 'Auto & EV'
  | 'Pharma & Health'
  | 'Energy & Power'
  | 'Infra & Realty'
  | 'Commodities';

export interface OhlcCandle {
  time: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketInstrument {
  symbol: string;
  name: string;
  basePrice: number;
  price: number;
  change24h: number;
  changePercent24h: number;
  category: AssetCategory;
  sector: MarketSector;
  volatilityLevel: 'Low' | 'Medium' | 'High';
  beta: number;
  dayHigh: number;
  dayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  conceptTieIn: string;
  description: string;
  candles: OhlcCandle[];
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

// 19 Realistic, clearly-fictional Indian market simulated instruments
export const BASE_SIMULATED_INSTRUMENTS: Omit<
  MarketInstrument,
  'price' | 'change24h' | 'changePercent24h' | 'dayHigh' | 'dayLow' | 'fiftyTwoWeekHigh' | 'fiftyTwoWeekLow' | 'candles'
>[] = [
  // 1. Broad Market Indices
  {
    symbol: 'SIM-NIFTY50X',
    name: 'Bharat 50 Simulated Index ETF',
    basePrice: 245.0,
    category: 'Simulated Index Fund',
    sector: 'Indices',
    volatilityLevel: 'Low',
    beta: 1.0,
    conceptTieIn: 'Concept #3: Mutual Funds & Indexing',
    description: 'A practice basket tracking 50 premier fictional enterprises. Low volatility anchor asset for long-term compounding.',
    isSimulated: true,
  },
  {
    symbol: 'SIM-NEXTMID',
    name: 'NextGen 100 Midcap Fund (Simulated)',
    basePrice: 185.0,
    category: 'Simulated Index Fund',
    sector: 'Indices',
    volatilityLevel: 'Medium',
    beta: 1.25,
    conceptTieIn: 'Concept #12: Diversification & Asset Allocation',
    description: 'Simulated mid-cap basket featuring fast-scaling mid-tier companies. Higher growth potential with balanced risk.',
    isSimulated: true,
  },

  // 2. Information Technology & SaaS
  {
    symbol: 'SIM-BYTECRAFT',
    name: 'ByteCraft Cloud Solutions (Simulated)',
    basePrice: 1420.0,
    category: 'Simulated Equity',
    sector: 'IT & Tech',
    volatilityLevel: 'High',
    beta: 1.35,
    conceptTieIn: 'Concept #11: What is a Stock?',
    description: 'Fictional Indian IT powerhouse providing enterprise cloud migration and AI automation for global banks.',
    isSimulated: true,
  },
  {
    symbol: 'SIM-CYBERKAVACH',
    name: 'Kavach Infosec Systems (Simulated)',
    basePrice: 680.0,
    category: 'Simulated Equity',
    sector: 'IT & Tech',
    volatilityLevel: 'Medium',
    beta: 1.15,
    conceptTieIn: 'Concept #15: Candlestick Price Action',
    description: 'Fictional cybersecurity developer safeguarding cloud workloads and UPI financial identity data.',
    isSimulated: true,
  },
  {
    symbol: 'SIM-DATASTRIDE',
    name: 'DataStride Analytics (Simulated)',
    basePrice: 940.0,
    category: 'Simulated Equity',
    sector: 'IT & Tech',
    volatilityLevel: 'High',
    beta: 1.4,
    conceptTieIn: 'Concept #17: Support & Resistance',
    description: 'Fictional AI big data platform helping quick-commerce brands predict local customer consumption spikes.',
    isSimulated: true,
  },

  // 3. Banking & Financial Services
  {
    symbol: 'SIM-APEXBANK',
    name: 'Apex Bharat Commercial Bank (Simulated)',
    basePrice: 1650.0,
    category: 'Simulated Equity',
    sector: 'Banking & Finance',
    volatilityLevel: 'Medium',
    beta: 1.05,
    conceptTieIn: 'Concept #6: Credit Score & Banking',
    description: 'Fictional top-tier private lender with millions of savings accounts, home loans, and zero-NPA corporate books.',
    isSimulated: true,
  },
  {
    symbol: 'SIM-VAULTNBFC',
    name: 'Vault Capital Housing Finance (Simulated)',
    basePrice: 430.0,
    category: 'Simulated Equity',
    sector: 'Banking & Finance',
    volatilityLevel: 'Medium',
    beta: 1.1,
    conceptTieIn: 'Concept #7: The EMI & Debt Trap',
    description: 'Fictional non-banking mortgage lender financing tier-2 and tier-3 affordable residential apartments.',
    isSimulated: true,
  },
  {
    symbol: 'SIM-FINPULSE',
    name: 'FinPulse Digital Micro-Credit (Simulated)',
    basePrice: 215.0,
    category: 'Simulated Equity',
    sector: 'Banking & Finance',
    volatilityLevel: 'High',
    beta: 1.45,
    conceptTieIn: 'Concept #18: Trading Volume & Momentum',
    description: 'Fictional fintech credit network extending working capital to small neighbourhood shopkeepers via QR codes.',
    isSimulated: true,
  },

  // 4. FMCG & Consumer Retail
  {
    symbol: 'SIM-DESIHARVEST',
    name: 'DesiHarvest Consumer Brands (Simulated)',
    basePrice: 540.0,
    category: 'Simulated Equity',
    sector: 'FMCG & Consumer',
    volatilityLevel: 'Low',
    beta: 0.75,
    conceptTieIn: 'Concept #4: Inflation & Purchasing Power',
    description: 'Fictional staple foods producer of organic flours, cold-pressed mustard oil, and daily kitchen pantry essentials.',
    isSimulated: true,
  },
  {
    symbol: 'SIM-CHAIBREWS',
    name: 'ChaiBrews Foods & Cafes (Simulated)',
    basePrice: 310.0,
    category: 'Simulated Equity',
    sector: 'FMCG & Consumer',
    volatilityLevel: 'Medium',
    beta: 1.05,
    conceptTieIn: 'Concept #19: Dividends vs Capital Growth',
    description: 'Fictional nationwide youth cafe chain serving premium artisanal teas, baked rusks, and instant coffee pouches.',
    isSimulated: true,
  },
  {
    symbol: 'SIM-VELVETCARE',
    name: 'VelvetCare Personal Wellness (Simulated)',
    basePrice: 780.0,
    category: 'Simulated Equity',
    sector: 'FMCG & Consumer',
    volatilityLevel: 'Low',
    beta: 0.8,
    conceptTieIn: 'Concept #10: Risk vs Return Profile',
    description: 'Fictional ayurvedic body care and derma-certified baby care manufacturer with steady recession-proof cash flows.',
    isSimulated: true,
  },

  // 5. Automobile & EV Mobility
  {
    symbol: 'SIM-VOLTEV',
    name: 'VoltMobility Electric Motors (Simulated)',
    basePrice: 890.0,
    category: 'Simulated Equity',
    sector: 'Auto & EV',
    volatilityLevel: 'High',
    beta: 1.5,
    conceptTieIn: 'Concept #14: IPOs & New Listings',
    description: 'Fictional smart electric scooter pioneer with automated battery-swap stations across 40 metro hubs.',
    isSimulated: true,
  },
  {
    symbol: 'SIM-GATIAUTO',
    name: 'Gati Commercial Automotive (Simulated)',
    basePrice: 1120.0,
    category: 'Simulated Equity',
    sector: 'Auto & EV',
    volatilityLevel: 'Medium',
    beta: 1.1,
    conceptTieIn: 'Concept #16: Bull vs Bear Cycles',
    description: 'Fictional industrial truck, multi-axle carrier, and agricultural tractor maker directly tracking economic capex.',
    isSimulated: true,
  },

  // 6. Pharma & Healthcare
  {
    symbol: 'SIM-AUSHADH',
    name: 'Aushadh Lifesciences Labs (Simulated)',
    basePrice: 1280.0,
    category: 'Simulated Equity',
    sector: 'Pharma & Health',
    volatilityLevel: 'Medium',
    beta: 0.85,
    conceptTieIn: 'Concept #5: The Emergency Fund Formula',
    description: 'Fictional research laboratory synthesizing complex antibiotic generics and pediatric immunization vials.',
    isSimulated: true,
  },
  {
    symbol: 'SIM-SANJEEV',
    name: 'Sanjeevani Diagnostic Clinics (Simulated)',
    basePrice: 640.0,
    category: 'Simulated Equity',
    sector: 'Pharma & Health',
    volatilityLevel: 'Low',
    beta: 0.7,
    conceptTieIn: 'Concept #2: Compound Interest Machine',
    description: 'Fictional healthcare chain running 120 regional daycare surgical facilities and advanced pathology testing hubs.',
    isSimulated: true,
  },

  // 7. Energy & Green Power
  {
    symbol: 'SIM-GREENWATT',
    name: 'GreenWatt Renewable Energy (Simulated)',
    basePrice: 375.0,
    category: 'Simulated Equity',
    sector: 'Energy & Power',
    volatilityLevel: 'High',
    beta: 1.3,
    conceptTieIn: 'Concept #16: Market Sentiment & Cycles',
    description: 'Fictional clean energy developer operating 4 gigawatts of floating solar arrays and wind corridors in Western India.',
    isSimulated: true,
  },
  {
    symbol: 'SIM-URJAGRID',
    name: 'Urja High-Voltage Power (Simulated)',
    basePrice: 510.0,
    category: 'Simulated Equity',
    sector: 'Energy & Power',
    volatilityLevel: 'Low',
    beta: 0.65,
    conceptTieIn: 'Concept #19: Dividend Yielding Assets',
    description: 'Fictional power transmission infrastructure operator with long-term sovereign energy transmission concessions.',
    isSimulated: true,
  },

  // 8. Infrastructure, Realty & Logistics
  {
    symbol: 'SIM-SETUINFRA',
    name: 'Setu Expressways & Ports (Simulated)',
    basePrice: 460.0,
    category: 'Simulated Equity',
    sector: 'Infra & Realty',
    volatilityLevel: 'Medium',
    beta: 1.1,
    conceptTieIn: 'Concept #13: NSE vs BSE Exchange Mechanics',
    description: 'Fictional infrastructure contractor developing modern access-controlled expressways and inland multi-modal freight yards.',
    isSimulated: true,
  },
  {
    symbol: 'SIM-SKYLINE',
    name: 'Skyline Urban TechParks (Simulated)',
    basePrice: 820.0,
    category: 'Simulated Equity',
    sector: 'Infra & Realty',
    volatilityLevel: 'Medium',
    beta: 1.15,
    conceptTieIn: 'Concept #20: Investing vs Trading Mindset',
    description: 'Fictional commercial developer constructing eco-certified technology campuses leased to international IT giants.',
    isSimulated: true,
  },

  // 9. Commodities & Precious Hedging
  {
    symbol: 'SIM-AURUMGOLD',
    name: 'Aurum Digital Gold Bullion (Simulated)',
    basePrice: 65.0,
    category: 'Simulated Commodity',
    sector: 'Commodities',
    volatilityLevel: 'Low',
    beta: 0.35,
    conceptTieIn: 'Concept #4: Inflation Hedging',
    description: 'Fictional 24-karat gold digital token. Simulates counter-cyclical safe-haven behavior during turbulent equity swings.',
    isSimulated: true,
  },
];
