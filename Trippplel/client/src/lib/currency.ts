export const FREE_SHIPPING_THRESHOLD = 5000; // KES
export const SHIPPING_COST = 500;             // KES

export function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
