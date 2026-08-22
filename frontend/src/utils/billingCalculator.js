// Centralized billing calculation engine
// All formula logic lives here — nothing is spread across UI components.
// Phase 2 can replace/extend this without touching UI code.

/**
 * Calculate a single bill item's values.
 *
 * Formula (Phase 1):
 *   Net Weight = Gross Weight - Stone Weight
 *   Gold Value = Net Weight × Gold Rate
 *   Wastage Amount = Gold Value × (Wastage% / 100)
 *   Item Total = Gold Value + Wastage Amount + Making Charge + Stone Charge - Discount
 */
export function calculateItem(item) {
  const grossWeight = parseFloat(item.gross_weight) || 0;
  const stoneWeight = parseFloat(item.stone_weight) || 0;
  const goldRate = parseFloat(item.gold_rate) || 0;
  const wastagePercent = parseFloat(item.wastage_percent) || 0;
  const makingCharge = parseFloat(item.making_charge) || 0;
  const stoneCharge = parseFloat(item.stone_charge) || 0;
  const discount = parseFloat(item.discount) || 0;

  const netWeight = Math.max(0, grossWeight - stoneWeight);
  const metalValue = netWeight * goldRate;
  const wastageAmount = metalValue * (wastagePercent / 100);
  const itemTotal = metalValue + wastageAmount + makingCharge + stoneCharge - discount;

  return {
    ...item,
    net_weight: netWeight,
    metal_value: metalValue,
    wastage_amount: wastageAmount,
    item_total: Math.max(0, itemTotal),
  };
}

/**
 * Calculate the full invoice totals from items + settings.
 *
 * Formula (Phase 1):
 *   Subtotal = Sum of all item_total
 *   Taxable Amount = Subtotal - Global Discount
 *   GST Amount = Taxable × GST%
 *   Grand Total = Taxable + GST Amount (rounded)
 */
export function calculateInvoice(items, { globalDiscount = 0, gstRate = 3 }) {
  const processedItems = items.map(calculateItem);
  const subtotal = processedItems.reduce((sum, item) => sum + item.item_total, 0);
  const taxableAmount = Math.max(0, subtotal - globalDiscount);
  const gstAmount = taxableAmount * (gstRate / 100);
  const grandTotal = Math.round(taxableAmount + gstAmount);

  return {
    items: processedItems,
    subtotal,
    globalDiscount,
    taxableAmount,
    gstRate,
    gstAmount,
    grandTotal,
  };
}

/**
 * Calculate payment status from grand total and payments array.
 */
export function calculatePaymentStatus(grandTotal, payments) {
  const paidAmount = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const balanceAmount = grandTotal - paidAmount;
  let paymentStatus = 'PENDING';
  if (paidAmount >= grandTotal) paymentStatus = 'PAID';
  else if (paidAmount > 0) paymentStatus = 'PARTIAL';
  return { paidAmount, balanceAmount, paymentStatus };
}

/**
 * Convert a number to words (Indian format).
 * Used on invoice for "Amount in words".
 */
export function numberToWords(amount) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convert(n) {
    if (n === 0) return '';
    if (n < 20) return ones[n] + ' ';
    if (n < 100) return tens[Math.floor(n / 10)] + ' ' + ones[n % 10] + ' ';
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + convert(n % 100);
    if (n < 100000) return convert(Math.floor(n / 1000)) + 'Thousand ' + convert(n % 1000);
    if (n < 10000000) return convert(Math.floor(n / 100000)) + 'Lakh ' + convert(n % 100000);
    return convert(Math.floor(n / 10000000)) + 'Crore ' + convert(n % 10000000);
  }

  const intPart = Math.floor(Math.abs(amount));
  const decPart = Math.round((Math.abs(amount) - intPart) * 100);
  let result = convert(intPart).trim() + ' Rupees';
  if (decPart > 0) result += ' and ' + convert(decPart).trim() + ' Paise';
  result += ' Only';
  return result;
}

/**
 * Format a number as Indian currency string.
 * Uses "Rs." prefix instead of ₹ symbol to avoid serif font rendering
 * when the symbol inherits Playfair Display from parent containers.
 */
export function formatCurrency(amount) {
  const num = Number(amount || 0);
  return `Rs. ${num.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format weight to 3 decimal places.
 */
export function formatWeight(weight) {
  return `${parseFloat(weight || 0).toFixed(3)} g`;
}
