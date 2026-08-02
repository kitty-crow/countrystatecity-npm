import { getCurrencies, getCurrencyByCode } from './loaders.ts';
import type { ICurrency } from './types.ts';

/** Returns the symbol for a currency code (e.g. "USD" → "$"), or undefined if not found. */
export async function getCurrencySymbol(code: string): Promise<string | undefined> {
  return (await getCurrencyByCode(code))?.symbol;
}

/** Returns the native symbol for a currency code (e.g. "INR" → "₹"), or undefined if not found. */
export async function getCurrencySymbolNative(code: string): Promise<string | undefined> {
  return (await getCurrencyByCode(code))?.symbolNative;
}

/** Returns a currency by its symbol (e.g. "$"), checking both symbol and symbolNative. */
export async function getCurrencyBySymbol(symbol: string): Promise<ICurrency | undefined> {
  const rows = await getCurrencies();
  return rows.find(item => item.symbol === symbol || item.symbolNative === symbol);
}

/**
 * Formats a number as a currency string using the currency's symbol and decimal rules.
 * e.g. formatCurrencyAmount(1234.5, "USD") → "$1,234.50"
 */
export async function formatCurrencyAmount(amount: number, code: string): Promise<string> {
  const item = await getCurrencyByCode(code);
  if (!item) return String(amount);
  const [whole = '', decimal] = amount.toFixed(item.decimalDigits).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (decimal === undefined) return `${item.symbol}${grouped}`;
  return `${item.symbol}${grouped}.${decimal}`;
}
