import { useState, useRef } from 'react';
import { X, Printer, Share2, Check } from 'lucide-react';
import A4InvoiceTemplate from './A4InvoiceTemplate';
import Thermal80InvoiceTemplate from './Thermal80InvoiceTemplate';
import { useSettings } from '../../context/SettingsContext';

/**
 * Print Preview Modal
 * Shows A4 or 80mm thermal preview and triggers window.print().
 * Does NOT save PDF files.
 */
export default function PrintPreviewModal({ invoice, isOpen, onClose }) {
  const { settings } = useSettings();
  const [format, setFormat] = useState(settings.default_invoice_format || 'A4');
  const [copied, setCopied] = useState(false);
  const printRef = useRef(null);

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;

    try {
      const printWindow = window.open('', '_blank', 'width=900,height=700');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${invoice.invoice_number} — ${format === 'A4' ? 'A4 Invoice' : '80mm Receipt'}</title>
              <link rel="preconnect" href="https://fonts.googleapis.com">
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
              <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: ${format === '80mm' ? "'Courier New', monospace" : "'Inter', sans-serif"}; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                @page { size: ${format === '80mm' ? '80mm auto' : 'A4'}; margin: ${format === '80mm' ? '4mm' : '0'}; }
                ${format === 'A4' ? `
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
                  .invoice-totals-table { width: 300px; font-size: 13px; }
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
                ` : `
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
                `}
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
    // Fallback if popup blocked
    window.print();
  };

  const handleCopySummary = () => {
    const summaryText = `*SRI SAI JEWELS*\nInvoice: ${invoice.invoice_number}\nCustomer: ${invoice.customer_name}\nTotal: Rs. ${invoice.grand_total?.toLocaleString('en-IN')}\nStatus: ${invoice.payment_status}\nDate: ${invoice.invoice_date}`;
    navigator.clipboard?.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-xl" style={{ maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header no-print" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2>Invoice Preview</h2>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{invoice.invoice_number}</div>
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {['A4', '80mm'].map(f => (
              <button
                key={f}
                className={`btn ${format === f ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => setFormat(f)}
              >
                {f === 'A4' ? '📄 A4 Format' : '🧾 80mm Thermal'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleCopySummary} title="Copy bill summary text">
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
            <span>Pan / Scroll horizontally to view full page preview →</span>
          </div>

          <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
            <div ref={printRef} style={{ display: 'flex', justifyContent: 'center', minWidth: format === 'A4' ? 700 : 300, margin: '0 auto' }}>
              {format === 'A4'
                ? <A4InvoiceTemplate invoice={invoice} shopSettings={settings} />
                : <Thermal80InvoiceTemplate invoice={invoice} shopSettings={settings} />
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

