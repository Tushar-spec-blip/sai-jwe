import { useState, useEffect } from 'react';
import { Menu, X, FlaskConical } from 'lucide-react';

const PAGE_TITLES = {
  '/': { title: 'Dashboard', breadcrumb: 'Home' },
  '/customers': { title: 'Customers', breadcrumb: 'Home / Customers' },
  '/inventory': { title: 'Jewellery Inventory', breadcrumb: 'Home / Jewellery / Inventory' },
  '/new-bill': { title: 'New Sale', breadcrumb: 'Home / Billing / New Sale' },
  '/gold-sale': { title: 'Gold Sale', breadcrumb: 'Home / Billing / Gold Sale' },
  '/silver-sale': { title: 'Silver Sale', breadcrumb: 'Home / Billing / Silver Sale' },
  '/old-purchase': { title: 'Old Purchase', breadcrumb: 'Home / Old Purchase' },
  '/bills': { title: 'Bills / Invoices', breadcrumb: 'Home / Bills / Invoices' },
  '/payments': { title: 'Payments', breadcrumb: 'Home / Payments' },
  '/reports': { title: 'Reports', breadcrumb: 'Home / Reports' },
  '/metal-rates': { title: 'Metal Rates', breadcrumb: 'Home / Metal Rates' },
  '/settings': { title: 'Settings', breadcrumb: 'Home / Settings' },
  '/backup': { title: 'Backup & Restore', breadcrumb: 'Home / Backup & Restore' },
};

function useCurrentTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);
  return now;
}

export default function Header({ currentPath, isMobileMenuOpen, onToggleMobileMenu }) {
  const now = useCurrentTime();
  const pageInfo = PAGE_TITLES[currentPath] || { title: 'Sri Sai Jewels', breadcrumb: 'Home' };

  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  return (
    <header className="top-header no-print">
      <button
        className="mobile-menu-toggle"
        onClick={onToggleMobileMenu}
        aria-label="Toggle Navigation Menu"
      >
        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div className="header-title">
        <h1>{pageInfo.title}</h1>
        <div className="breadcrumb">{pageInfo.breadcrumb}</div>
      </div>

      <div className="header-meta">
        <div className="demo-mode-badge" title="Shopkeeper Usability Testing Mode — Mock Data Only">
          <FlaskConical size={13} className="demo-icon" />
          <span>TEST VERSION</span>
        </div>

        <div className="header-date">
          <div className="date-main">{dateStr}</div>
          <div className="date-time">{timeStr}</div>
        </div>
        <div className="header-shop-badge">
          <span className="shop-dot"></span>
          <span>System Online</span>
        </div>
      </div>
    </header>
  );
}
