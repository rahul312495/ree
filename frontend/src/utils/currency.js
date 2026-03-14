/**
 * Format a number as Indian Rupees using the Indian numbering system.
 * e.g. 123456.78 → ₹1,23,456.78
 */
export const formatINR = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Short label — no decimal for whole numbers, useful for stat cards
 * e.g. 123456 → ₹1,23,456
 */
export const formatINRShort = (amount) => {
  if (!amount) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
