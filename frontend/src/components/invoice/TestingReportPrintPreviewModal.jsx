import { useState, useRef, useEffect } from 'react';
import { X, Printer, Share2, Check } from 'lucide-react';
import A4TestingReportTemplate from './A4TestingReportTemplate';
import A5TestingReportTemplate from './A5TestingReportTemplate';
import Thermal80TestingReportTemplate from './Thermal80TestingReportTemplate';
import { useSettings } from '../../context/SettingsContext';

/**
 * Testing Report Print Preview Modal
 * Shows A4, A5 Landscape, or 80mm thermal Testing Report preview.
 * Uses testing-report-specific templates — NOT the sales invoice.
 */
export default function TestingReportPrintPreviewModal({ report, isOpen, onClose, initialFormat }) {
  const { settings } = useSettings();
  const [format, setFormat] = useState(initialFormat || settings.default_invoice_format || 'A4');
  const [copied, setCopied] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFormat(initialFormat || settings.default_invoice_format || 'A4');
    }
  }, [isOpen, initialFormat, settings.default_invoice_format]);

  if (!isOpen || !report) return null;

  const typeLabel = report.type === 'GOLD' ? 'Gold' : 'Silver';

  // A5 Landscape print CSS — 210mm × 148mm, margin 6mm
  const A5_PRINT_CSS = `
    * { box-sizing: border-box; }
    .a5-invoice {
      width: 100%; padding: 0;
      font-family: 'Inter', sans-serif; font-size: 10px;
      color: #000; background: #fff;
      box-sizing: border-box; overflow: hidden;
    }
    .a5-invoice table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    .a5-invoice th { padding: 4px 6px; font-size: 7.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; vertical-align: top; line-height: 1.3; }
    .a5-invoice td { padding: 4px 6px; font-size: 9px; vertical-align: top; line-height: 1.35; word-break: break-word; }
    tr { break-inside: avoid; }
  `;

  const A4_CSS = `.a4-invoice { padding: 20mm; max-width: 100%; font-family: 'Inter', sans-serif; }`;

  const THERMAL_CSS = `
    .thermal-invoice { width: 72mm; font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.5; padding: 4mm; }
    .thermal-header { text-align: center; margin-bottom: 8px; }
    .thermal-logo { width: 40px; height: 40px; object-fit: contain; margin-bottom: 4px; }
    .thermal-shop-name { font-size: 14px; font-weight: bold; text-transform: uppercase; }
    .thermal-shop-sub { font-size: 9px; color: #555; }
    .thermal-divider { border: none; border-top: 1px dashed #333; margin: 6px 0; }
    .thermal-row { display: flex; justify-content: space-between; font-size: 10.5px; }
    .thermal-footer { text-align: center; font-size: 10px; margin-top: 8px; color: #555; }
  `;

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;

    const isA5   = format === 'A5';
    const is80mm = format === '80mm';

    const pageSize   = is80mm ? '80mm auto' : isA5 ? 'A5 landscape' : 'A4';
    const pageMargin = is80mm ? '4mm' : isA5 ? '6mm' : '12mm';
    const fontFamily = is80mm ? "'Courier New', monospace" : "'Inter', sans-serif";
    const formatCSS  = isA5 ? A5_PRINT_CSS : is80mm ? THERMAL_CSS : A4_CSS;

    try {
      const printWindow = window.open('', '_blank', 'width=900,height=700');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Report ${report.reportNumber} — ${typeLabel} Testing Report</title>
              <link rel="preconnect" href="https://fonts.googleapis.com">
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;700&display=swap" rel="stylesheet">
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
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
        return;
      }
    } catch (e) {
      console.warn('Popup blocked, falling back to window.print()', e);
    }
    window.print();
  };

  const handleCopySummary = () => {
    const text = `*SRI SAI JEWELS — ${typeLabel.toUpperCase()} TESTING REPORT*\nReport No: ${report.reportNumber}\nDate: ${report.date}\nCustomer: ${report.customerName}\nTesting Center: ${report.testingCenter}\nBefore Melt: ${report.beforeMelt} gms\nAfter Melt: ${report.afterMelt} gms\nMelting Loss: ${report.meltingLoss} gms\nPurity: ${report.purity}%`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewMinWidth = format === 'A4' ? 700 : format === 'A5' ? 620 : 300;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-xl" style={{ maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header no-print" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2>Testing Report Preview</h2>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Report {report.reportNumber} — {typeLabel} — {report.customerName}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { key: 'A4',   label: '📄 A4' },
              { key: 'A5',   label: '📋 A5 Landscape' },
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
            <button className="btn btn-secondary btn-sm" onClick={handleCopySummary} title="Copy summary">
              {copied ? <Check size={14} color="#16a34a" /> : <Share2 size={14} />} {copied ? 'Copied!' : 'Share'}
            </button>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} /> Print {format}
            </button>
            <button className="modal-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
          </div>
        </div>

        <div className="modal-body" style={{ background: '#f0f0f0', padding: '16px 12px', overflowY: 'auto', flex: 1 }}>
          <div className="scroll-hint" style={{ justifyContent: 'center', marginBottom: 12 }}>
            <span>Pan / Scroll horizontally to view full report preview →</span>
          </div>
          <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
            <div ref={printRef} style={{ display: 'flex', justifyContent: 'center', minWidth: previewMinWidth, margin: '0 auto' }}>
              {format === 'A4'   && <A4TestingReportTemplate   report={report} shopSettings={settings} />}
              {format === 'A5'   && <A5TestingReportTemplate   report={report} shopSettings={settings} />}
              {format === '80mm' && <Thermal80TestingReportTemplate report={report} shopSettings={settings} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
