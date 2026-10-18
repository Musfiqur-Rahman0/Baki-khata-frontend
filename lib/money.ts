export function formatTaka(amount: number) {
  const formatted = new Intl.NumberFormat("en-BD").format(Math.abs(amount));
  return `৳${formatted}`;
}
