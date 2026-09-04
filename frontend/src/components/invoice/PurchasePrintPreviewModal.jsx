import { useState, useRef, useEffect } from 'react';
import { X, Printer, Share2, Check } from 'lucide-react';
import A4PurchaseReceiptTemplate from './A4PurchaseReceiptTemplate';
import A5PurchaseReceiptTemplate from './A5PurchaseReceiptTemplate';
import Thermal80PurchaseReceiptTemplate from './Thermal80PurchaseReceiptTemplate';
import { useSettings } from '../../context/SettingsContext';

/**
 * Purchase Print Preview Modal
 * Shows A4, A5, or 80mm thermal purchase receipt preview.
 * Uses purchase-specific templates — NOT the customer sales invoice.
 *
 * Terminology used: "Purchase Receipt Preview", not "Invoice Preview".
 */
export default function PurchasePrintPreviewModal({ purchase, isOpen, onClose, initialFormat }) {
  const { settings } = useSettings();
  const [format, setFormat] = useState(initialFormat || settings.default_invoice_format || 'A4');
  const [copied, setCopied] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFormat(initialFormat || settings.default_invoice_format || 'A4');
    }
  }, [isOpen, initialFormat, settings.default_invoice_format]);

  if (!isOpen || !purchase) return null;

  const isGold = purchase.transactionType === 'GOLD_PURCHASE';
  const receiptHeading = isGold ? 'OLD GOLD PURCHASE RECEIPT' : 'OLD SILVER PURCHASE RECEIPT';

  // ── A5 print CSS (injected into popup) ──
  // @page margin: 6mm → printable area: 136mm × 198mm
  // .a5-invoice padding:0 so the full 136mm width is available to the table.
  const A5_PRINT_CSS = `
    * { box-sizing: border-box; }
    .a5-invoice {
      width: 100%;
      padding: 0;
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      color: #000;
      background: #fff;
      box-sizing: border-box;
      overflow: hidden;
    }
    .a5-invoice table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      box-sizing: border-box;
    }
    .a5-invoice th {
      padding: 4px 3px;
      font-size: 7.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      vertical-align: top;
      line-height: 1.3;
    }
    .a5-invoice td {
      padding: 4px 3px;
      font-size: 8px;
      vertical-align: top;
      line-height: 1.35;
      word-break: break-word;
    }
    tr { break-inside: avoid; }
  `;

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;

    const isA5 = format === 'A5';
    const is80mm = format === '80mm';

    const pageSize = is80mm ? '80mm auto' : isA5 ? 'A5 portrait' : 'A4';
    const pageMargin = is80mm ? '4mm' : isA5 ? '6mm' : '0';
    const fontFamily = is80mm ? "'Courier New', monospace" : "'Inter', sans-serif";


    const A4_CSS = `
      .a4-invoice { padding: 20mm; max-width: 100%; font-family: 'Inter', sans-serif; }
      .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid #C9A84C; }
      .invoice-shop-logo { width: 64px; height: 64px; object-fit: contain; margin-bottom: 6px; }
      .invoice-shop-name { font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 700; color: #8B6914; }
      .invoice-shop-details { font-size: 12px; color: #7A6A4A; line-height: 1.7; }
      .invoice-meta { text-align: right; }
      .invoice-number { font-size: 18px; font-weight: 700; }
      .invoice-date { font-size: 12px; color: #888; }
      .invoice-customer { background: #FDF8EE; padding: 14px 18px; border-radius: 8px; margin-bottom: 20px; border-left: 3px solid #C9A84C; }
      .invoice-customer h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #7A6A4A; margin-bottom: 6px; }
      .customer-name { font-size: 15px; font-weight: 700; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      thead { background: #1A1205; }
      th { background: #1A1205; color: #C9A84C; padding: 8px 10px; text-align: left; font-size: 10px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
      td { padding: 8px 10px; border-bottom: 1px solid #F0E4C4; vertical-align: top; }
      .invoice-totals { display: flex; justify-content: flex-end; margin-top: 16px; }
      .invoice-totals-table { width: 320px; font-size: 13px; }
      .invoice-totals-table td { border: none; padding: 4px 0; }
      .label-col { color: #7A6A4A; padding-right: 20px; }
      .value-col { text-align: right; font-weight: 600; }
      .invoice-grand-total td { background: #1A1205; color: #C9A84C; font-size: 15px; font-weight: 700; padding: 10px 14px; border-radius: 8px; }
      .invoice-amount-words { background: #FDF8EE; padding: 10px 16px; border-radius: 8px; font-size: 12px; margin-top: 14px; }
      .invoice-payment { margin-top: 16px; padding: 12px 16px; background: #FDF8EE; border-radius: 8px; border: 1px solid #F0E4C4; }
      .invoice-payment h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #7A6A4A; margin-bottom: 8px; }
      .invoice-signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #F0E4C4; }
      .invoice-sig-box { text-align: center; }
      .invoice-sig-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 6px; font-size: 11px; color: #888; }
    `;

    const THERMAL_CSS = `
      .thermal-invoice { width: 72mm; font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.5; padding: 4mm; }
      .thermal-header { text-align: center; margin-bottom: 8px; }
      .thermal-logo { width: 40px; height: 40px; object-fit: contain; margin-bottom: 4px; }
      .thermal-shop-name { font-size: 14px; font-weight: bold; text-transform: uppercase; }
      .thermal-shop-sub { font-size: 9px; color: #555; }
      .thermal-divider { border: none; border-top: 1px dashed #333; margin: 6px 0; }
      .thermal-row { display: flex; justify-content: space-between; font-size: 10.5px; }
      .thermal-item-name { font-weight: bold; font-size: 12px; margin-bottom: 3px; }
      .thermal-total { font-size: 14px; font-weight: bold; text-align: center; margin: 6px 0; padding: 4px; border: 1px solid #000; }
      .thermal-footer { text-align: center; font-size: 10px; margin-top: 8px; color: #555; }
    `;

    const formatCSS = isA5 ? A5_PRINT_CSS : is80mm ? THERMAL_CSS : A4_CSS;

    try {
      const printWindow = window.open('', '_blank', 'width=900,height=700');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${purchase.purchase_number} — ${receiptHeading}</title>
              <link rel="preconnect" href="https://fonts.googleapis.com">
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
              <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: ${fontFamily}; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                @page { size: ${pageSize}; margin: ${pageMargin}; }
                ${formatCSS}
              </style>
            </head>
            <body>${printContent}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
        return;
      }
    } catch (e) {
      console.warn('Popup print blocked, falling back to direct window.print()', e);
    }
    window.print();
  };

  const handleCopySummary = () => {
    const summaryText = `*SRI SAI JEWELS — OLD PURCHASE*\nReceipt: ${purchase.purchase_number}\nPurchased From: ${purchase.customer_name}\nType: ${purchase.transaction_type_label}\nAmount Paid: Rs. ${purchase.final_payable?.toLocaleString('en-IN')}\nDate: ${purchase.purchase_date}`;
    navigator.clipboard?.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Preview container width per format
  const previewMinWidth = format === 'A4' ? 700 : format === 'A5' ? 520 : 300;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-xl" style={{ maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header no-print" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2>Purchase Receipt Preview</h2>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {purchase.purchase_number} — {purchase.transaction_type_label}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { key: 'A4', label: '📄 A4' },
              { key: 'A5', label: '📋 A5' },
              { key: '80mm', label: '🧾 80mm Thermal' },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`btn ${format === key ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setFormat(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleCopySummary} title="Copy purchase summary text">
              {copied ? <Check size={14} color="#16a34a" /> : <Share2 size={14} />} {copied ? 'Copied!' : 'Share'}
            </button>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} /> Print {format}
            </button>
            <button className="modal-close" onClick={onClose} aria-label="Close modal"><X size={16} /></button>
          </div>
        </div>

        <div className="modal-body" style={{ background: '#f0f0f0', padding: '16px 12px', overflowY: 'auto', flex: 1 }}>
          <div className="scroll-hint" style={{ justifyContent: 'center', marginBottom: 12 }}>
            <span>Pan / Scroll horizontally to view full receipt preview →</span>
          </div>

          <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
            <div ref={printRef} style={{ display: 'flex', justifyContent: 'center', minWidth: previewMinWidth, margin: '0 auto' }}>
              {format === 'A4' && <A4PurchaseReceiptTemplate purchase={purchase} shopSettings={settings} />}
              {format === 'A5' && <A5PurchaseReceiptTemplate purchase={purchase} shopSettings={settings} />}
              {format === '80mm' && <Thermal80PurchaseReceiptTemplate purchase={purchase} shopSettings={settings} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
