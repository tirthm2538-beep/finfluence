import { getSupabaseClient, isSupabaseConfigured, AuthUser } from './supabase';
import {
  UserPortfolio,
  PortfolioHolding,
  PortfolioTransaction,
  PortfolioHistoryPoint,
  MarketInstrument,
  BASE_SIMULATED_INSTRUMENTS,
  INITIAL_CASH_BALANCE,
} from '../types/portfolio';

const STORAGE_KEY_PREFIX = 'finfluence_practice_portfolio_';

const getStorageKey = (userId: string) => `${STORAGE_KEY_PREFIX}${userId}`;

// In-memory cache for the current session's simulated random-walk prices
let cachedSimulatedMarket: MarketInstrument[] | null = null;
let lastMarketGenTime = 0;

/**
 * Generates simulated random-walk market prices with slight fluctuations on each visit/session
 */
export function getSimulatedMarketInstruments(): MarketInstrument[] {
  const now = Date.now();
  // Refresh price noise every 30 seconds
  if (cachedSimulatedMarket && now - lastMarketGenTime < 30000) {
    return cachedSimulatedMarket;
  }

  const generated = BASE_SIMULATED_INSTRUMENTS.map((inst, index) => {
    // Deterministic random drift between -3% and +3%
    const randomFactor = Math.sin((now / 15000) + index * 1.7) * 0.02 + ((Math.random() - 0.5) * 0.02);
    const price = Number((inst.basePrice * (1 + randomFactor)).toFixed(2));
    const change24h = Number((price - inst.basePrice).toFixed(2));
    const changePercent24h = Number(((change24h / inst.basePrice) * 100).toFixed(2));

    return {
      ...inst,
      price,
      change24h,
      changePercent24h,
    };
  });

  cachedSimulatedMarket = generated;
  lastMarketGenTime = now;
  return generated;
}

export function getInstrument(symbol: string): MarketInstrument | undefined {
  const market = getSimulatedMarketInstruments();
  return market.find((m) => m.symbol === symbol);
}

/**
 * Recomputes live valuation and PnL for each holding using current simulated prices
 */
export function recomputePortfolioValuation(portfolio: UserPortfolio): UserPortfolio {
  const market = getSimulatedMarketInstruments();

  const updatedHoldings: PortfolioHolding[] = (portfolio.holdings || []).map((h) => {
    const marketItem = market.find((m) => m.symbol === h.symbol);
    const currentPrice = marketItem ? marketItem.price : h.currentPrice;
    const investedValue = Number((h.quantity * h.avgPrice).toFixed(2));
    const currentValue = Number((h.quantity * currentPrice).toFixed(2));
    const pnl = Number((currentValue - investedValue).toFixed(2));
    const pnlPercent = investedValue > 0 ? Number(((pnl / investedValue) * 100).toFixed(2)) : 0;

    return {
      ...h,
      currentPrice,
      investedValue,
      currentValue,
      pnl,
      pnlPercent,
    };
  });

  const totalInvested = updatedHoldings.reduce((sum, h) => sum + h.investedValue, 0);
  const totalHoldingsValue = updatedHoldings.reduce((sum, h) => sum + h.currentValue, 0);
  const currentNetWorth = portfolio.cashBalance + totalHoldingsValue;

  // Build history points for the trend chart
  let history: PortfolioHistoryPoint[] = portfolio.history || [];
  if (!history || history.length === 0) {
    history = [
      { date: 'Day 1', value: 100000 },
      { date: 'Day 2', value: 100000 },
      { date: 'Day 3', value: 99800 },
      { date: 'Day 4', value: 100450 },
      { date: 'Today', value: Number(currentNetWorth.toFixed(2)) },
    ];
  } else {
    // Update the last point ('Today') with the current live value
    const lastPoint = history[history.length - 1];
    if (lastPoint && lastPoint.date === 'Today') {
      history[history.length - 1] = { date: 'Today', value: Number(currentNetWorth.toFixed(2)) };
    }
  }

  return {
    ...portfolio,
    investedAmount: Number(totalInvested.toFixed(2)),
    holdings: updatedHoldings,
    history,
  };
}

/**
 * Loads user portfolio from Supabase if authenticated, or from localStorage for guest
 */
export async function loadPortfolio(user: AuthUser): Promise<UserPortfolio> {
  const defaultPortfolio: UserPortfolio = {
    cashBalance: INITIAL_CASH_BALANCE,
    investedAmount: 0,
    holdings: [],
    transactions: [],
    history: [
      { date: 'Day 1', value: 100000 },
      { date: 'Day 2', value: 100000 },
      { date: 'Day 3', value: 99800 },
      { date: 'Day 4', value: 100450 },
      { date: 'Today', value: 100000 },
    ],
    updatedAt: new Date().toISOString(),
  };

  // Guest Mode or Supabase unconfigured
  if (user.isGuest || !isSupabaseConfigured()) {
    if (typeof window === 'undefined') return defaultPortfolio;
    try {
      const stored = localStorage.getItem(getStorageKey(user.id));
      if (stored) {
        return recomputePortfolioValuation(JSON.parse(stored));
      }
    } catch {
      // Ignore parse error
    }
    saveLocalPortfolio(user.id, defaultPortfolio);
    return defaultPortfolio;
  }

  // Supabase Authenticated Mode
  const supabase = getSupabaseClient();
  if (!supabase) {
    return loadPortfolio({ ...user, isGuest: true });
  }

  try {
    const { data, error } = await supabase
      .from('virtual_portfolios')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching portfolio from Supabase:', error.message);
      return loadPortfolio({ ...user, isGuest: true });
    }

    if (!data) {
      // Insert initial portfolio with ₹100,000 cash balance
      const initialRow = {
        user_id: user.id,
        cash_balance: INITIAL_CASH_BALANCE,
        invested_amount: 0,
        holdings: [],
      };
      await supabase.from('virtual_portfolios').insert(initialRow);

      saveLocalPortfolio(user.id, defaultPortfolio);
      return defaultPortfolio;
    }

    const portfolio: UserPortfolio = {
      cashBalance: Number(data.cash_balance ?? INITIAL_CASH_BALANCE),
      investedAmount: Number(data.invested_amount ?? 0),
      holdings: Array.isArray(data.holdings) ? data.holdings : [],
      transactions: [],
      history: [
        { date: 'Day 1', value: 100000 },
        { date: 'Day 2', value: 100000 },
        { date: 'Day 3', value: 99800 },
        { date: 'Day 4', value: 100450 },
        { date: 'Today', value: Number(data.cash_balance ?? INITIAL_CASH_BALANCE) + Number(data.invested_amount ?? 0) },
      ],
      updatedAt: data.updated_at || new Date().toISOString(),
    };

    const recomputed = recomputePortfolioValuation(portfolio);
    saveLocalPortfolio(user.id, recomputed);
    return recomputed;
  } catch (err) {
    console.warn('Supabase portfolio load error, falling back to local storage:', err);
    return loadPortfolio({ ...user, isGuest: true });
  }
}

/**
 * Executes a simulated BUY or SELL order with full balance & holdings validation
 */
export async function executeOrder(
  user: AuthUser,
  currentPortfolio: UserPortfolio,
  symbol: string,
  type: 'BUY' | 'SELL',
  quantity: number
): Promise<{ success: boolean; portfolio: UserPortfolio; message: string }> {
  const instrument = getInstrument(symbol);
  if (!instrument) {
    return { success: false, portfolio: currentPortfolio, message: `Simulated asset ${symbol} not found.` };
  }

  if (quantity <= 0) {
    return { success: false, portfolio: currentPortfolio, message: 'Quantity must be at least 1 unit.' };
  }

  const price = instrument.price;
  const orderTotal = Number((quantity * price).toFixed(2));

  let newCash = Number(currentPortfolio.cashBalance.toFixed(2));
  const existingHoldingIndex = currentPortfolio.holdings.findIndex((h) => h.symbol === symbol);
  const existingHolding = currentPortfolio.holdings[existingHoldingIndex];

  let updatedHoldings = [...currentPortfolio.holdings];

  if (type === 'BUY') {
    if (newCash < orderTotal) {
      return {
        success: false,
        portfolio: currentPortfolio,
        message: `Insufficient virtual cash. Needed ₹${orderTotal.toLocaleString('en-IN')}, available ₹${newCash.toLocaleString('en-IN')}.`,
      };
    }

    newCash = Number((newCash - orderTotal).toFixed(2));

    if (existingHolding) {
      const totalQuantity = existingHolding.quantity + quantity;
      const totalCost = existingHolding.quantity * existingHolding.avgPrice + orderTotal;
      const newAvgPrice = Number((totalCost / totalQuantity).toFixed(2));

      updatedHoldings[existingHoldingIndex] = {
        ...existingHolding,
        quantity: totalQuantity,
        avgPrice: newAvgPrice,
        currentPrice: price,
        investedValue: totalCost,
        currentValue: totalQuantity * price,
        pnl: totalQuantity * price - totalCost,
        pnlPercent: totalCost > 0 ? ((totalQuantity * price - totalCost) / totalCost) * 100 : 0,
      };
    } else {
      updatedHoldings.push({
        symbol: instrument.symbol,
        name: instrument.name,
        category: instrument.category,
        quantity,
        avgPrice: price,
        currentPrice: price,
        investedValue: orderTotal,
        currentValue: orderTotal,
        pnl: 0,
        pnlPercent: 0,
      });
    }
  } else {
    // SELL
    if (!existingHolding || existingHolding.quantity < quantity) {
      const owned = existingHolding ? existingHolding.quantity : 0;
      return {
        success: false,
        portfolio: currentPortfolio,
        message: `You currently hold ${owned} unit(s) of ${symbol}. Cannot sell ${quantity}.`,
      };
    }

    newCash = Number((newCash + orderTotal).toFixed(2));
    const remainingQty = existingHolding.quantity - quantity;

    if (remainingQty === 0) {
      updatedHoldings = updatedHoldings.filter((h) => h.symbol !== symbol);
    } else {
      const newInvested = Number((remainingQty * existingHolding.avgPrice).toFixed(2));
      const newCurrentVal = Number((remainingQty * price).toFixed(2));
      updatedHoldings[existingHoldingIndex] = {
        ...existingHolding,
        quantity: remainingQty,
        investedValue: newInvested,
        currentValue: newCurrentVal,
        pnl: newCurrentVal - newInvested,
        pnlPercent: newInvested > 0 ? ((newCurrentVal - newInvested) / newInvested) * 100 : 0,
      };
    }
  }

  const newTransaction: PortfolioTransaction = {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    symbol,
    type,
    quantity,
    price,
    total: orderTotal,
    timestamp: new Date().toISOString(),
  };

  const updatedPortfolio: UserPortfolio = recomputePortfolioValuation({
    cashBalance: newCash,
    investedAmount: 0,
    holdings: updatedHoldings,
    transactions: [newTransaction, ...(currentPortfolio.transactions || [])],
    history: currentPortfolio.history,
    updatedAt: new Date().toISOString(),
  });

  saveLocalPortfolio(user.id, updatedPortfolio);

  // Sync to Supabase if authenticated
  if (!user.isGuest && isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('virtual_portfolios')
          .update({
            cash_balance: updatedPortfolio.cashBalance,
            invested_amount: updatedPortfolio.investedAmount,
            holdings: updatedPortfolio.holdings,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Failed to sync virtual portfolio to Supabase:', err);
      }
    }
  }

  const verb = type === 'BUY' ? 'Bought' : 'Sold';
  return {
    success: true,
    portfolio: updatedPortfolio,
    message: `Simulated order executed: ${verb} ${quantity} ${symbol} at ₹${price.toFixed(2)} (Total: ₹${orderTotal.toLocaleString('en-IN')})!`,
  };
}

/**
 * Resets portfolio to ₹100,000 virtual balance
 */
export async function resetPortfolio(user: AuthUser): Promise<UserPortfolio> {
  const freshPortfolio: UserPortfolio = {
    cashBalance: INITIAL_CASH_BALANCE,
    investedAmount: 0,
    holdings: [],
    transactions: [],
    history: [
      { date: 'Day 1', value: 100000 },
      { date: 'Day 2', value: 100000 },
      { date: 'Day 3', value: 99800 },
      { date: 'Day 4', value: 100450 },
      { date: 'Today', value: 100000 },
    ],
    updatedAt: new Date().toISOString(),
  };

  saveLocalPortfolio(user.id, freshPortfolio);

  if (!user.isGuest && isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('virtual_portfolios')
          .update({
            cash_balance: INITIAL_CASH_BALANCE,
            invested_amount: 0,
            holdings: [],
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Failed to reset portfolio in Supabase:', err);
      }
    }
  }

  return freshPortfolio;
}

function saveLocalPortfolio(userId: string, portfolio: UserPortfolio): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(portfolio));
  } catch {
    // Ignore storage quota error
  }
}
