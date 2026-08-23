// Centralized billing calculation engine
// All formula logic lives here — nothing is spread across UI components.
// Phase 1.7 Modular Calculation Service

/**
 * Calculate a single bill item's values.
 *
 * Formula (Phase 1.7+):
 *   Net Weight = Gross Weight - Stone Weight
 *   Metal Value (Internal Only) = Net Weight × Metal Rate
 *
 *   GOLD SALE — Wastage Calculation:
 *     - If wastage_mode === 'percentage':
 *         Wastage Weight (g) = Net Weight × (Wastage % / 100)
 *         Wastage Amount (Rs.) = Wastage Weight × Gold Rate
 *     - If wastage_mode === 'weight':
 *         Wastage Weight (g) = User entered wastage weight
 *         Wastage % = (Wastage Weight / Net Weight) × 100 (for internal display)
 *         Wastage Amount (Rs.) = Wastage Weight × Gold Rate
 *   Gold Item Total = Gold Value + Wastage Amount + Making Charge + Stone Charge - Discount
 *
 *   SILVER SALE — No Wastage, No Making Charge:
 *   Silver Item Total = Silver Value + Stone Charge - Discount
 */
export function calculateItem(item) {
  const grossWeight = parseFloat(item.gross_weight) || 0;
  const stoneWeight = parseFloat(item.stone_weight) || 0;
  const goldRate = parseFloat(item.gold_rate) || 0;
  const isSilver = item.sale_type === 'SILVER';
  const wastageMode = item.wastage_mode || 'percentage'; // 'percentage' | 'weight'

  // Silver Sale: making charge is excluded
  const makingCharge = isSilver ? 0 : (parseFloat(item.making_charge) || 0);
  const stoneCharge = parseFloat(item.stone_charge) || 0;
  const discount = parseFloat(item.discount) || 0;

  const netWeight = Math.max(0, grossWeight - stoneWeight);
  const metalValue = netWeight * goldRate; // Silver Value or Gold Value (internal)

  // Silver Sale: no wastage at all
  let wastagePercent = 0;
  let wastageWeight = 0;
  let wastageAmount = 0;

  if (!isSilver) {
    if (wastageMode === 'weight') {
      wastageWeight = parseFloat(item.wastage_weight) || 0;
      wastagePercent = netWeight > 0 ? (wastageWeight / netWeight) * 100 : 0;
    } else {
      wastagePercent = parseFloat(item.wastage_percent) || 0;
      wastageWeight = netWeight * (wastagePercent / 100);
    }
    wastageAmount = wastageWeight * goldRate;
  }

  const itemTotal = metalValue + wastageAmount + makingCharge + stoneCharge - discount;

  return {
    ...item,
    net_weight: netWeight,
    metal_value: metalValue,
    gold_value: metalValue,
    wastage_mode: wastageMode,
    wastage_percent: wastagePercent,
    wastage_weight: wastageWeight,
    wastage_amount: wastageAmount,
    making_charge: makingCharge,
    item_total: Math.max(0, itemTotal),
  };
}

/**
 * Calculate the full invoice totals from items + settings.
 *
 * Formula (Phase 1.7):
 *   Subtotal = Sum of all item_total
 *   Before Tax = Subtotal - Global Discount
 *   CGST Rate = Total GST Rate / 2
 *   SGST Rate = Total GST Rate / 2
 *   CGST Amount = Before Tax × (CGST Rate / 100)
 *   SGST Amount = Before Tax × (SGST Rate / 100)
 *   GST Amount = CGST Amount + SGST Amount
 *   After Tax = Before Tax + GST Amount
 *   Grand Total = After Tax (rounded based on settings)
 */
export function calculateInvoice(items, { globalDiscount = 0, gstRate = 3, roundingMethod = 'nearest' } = {}) {
  const processedItems = items.map(calculateItem);
  const subtotal = processedItems.reduce((sum, item) => sum + item.item_total, 0);
  const beforeTax = Math.max(0, subtotal - globalDiscount);

  const parsedGst = parseFloat(gstRate) || 0;
  const cgstRate = parsedGst / 2;
  const sgstRate = parsedGst / 2;

  const cgstAmount = beforeTax * (cgstRate / 100);
  const sgstAmount = beforeTax * (sgstRate / 100);
  const gstAmount = cgstAmount + sgstAmount;

  const afterTax = beforeTax + gstAmount;

  let grandTotal = afterTax;
  if (roundingMethod === 'nearest') {
    grandTotal = Math.round(afterTax);
  } else if (roundingMethod === 'up') {
    grandTotal = Math.ceil(afterTax);
  } else if (roundingMethod === 'down') {
    grandTotal = Math.floor(afterTax);
  } else if (roundingMethod === 'none') {
    grandTotal = afterTax;
  } else {
    grandTotal = Math.round(afterTax);
  }

  return {
    items: processedItems,
    subtotal,
    globalDiscount,
    taxableAmount: beforeTax, // backward compatibility
    beforeTax,
    gstRate: parsedGst,
    cgstRate,
    sgstRate,
    cgstAmount,
    sgstAmount,
    gstAmount,
    afterTax,
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
