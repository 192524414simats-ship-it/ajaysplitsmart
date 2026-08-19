// Formatting helpers — presentational only, no business logic.

export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return '₹' + rounded.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function monthLabel(monthStr: string): string {
  const d = new Date(monthStr + '-01');
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function getSignedCurrency(amount: number): string {
  const sign = amount > 0 ? '+' : amount < 0 ? '-' : '';
  return sign + formatCurrency(Math.abs(amount));
}
