import { useState } from 'react';
import logo from '../../assets/logo.png';
import {
  LayoutDashboard, Users, FileText, CreditCard,
  BarChart3, Coins, Settings, HardDrive, ChevronDown,
  ShoppingBag, X
} from 'lucide-react';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { key: 'customers', label: 'Customers', icon: Users, path: '/customers' },
  {
    key: 'jewellery', label: 'Jewellery', icon: ShoppingBag,
    children: [
      { key: 'inventory', label: 'Inventory', path: '/inventory' },
    ]
  },
  {
    key: 'billing', label: 'Billing', icon: FileText,
    children: [
      { key: 'new-bill', label: 'New Bill', path: '/new-bill' },
      { key: 'bills', label: 'Bills / Invoices', path: '/bills' },
    ]
  },
  { key: 'payments', label: 'Payments', icon: CreditCard, path: '/payments' },
  { key: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
  { key: 'metal-rates', label: 'Metal Rates', icon: Coins, path: '/metal-rates' },
  { key: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  { key: 'backup', label: 'Backup & Restore', icon: HardDrive, path: '/backup' },
];

export default function Sidebar({ currentPath, onNavigate, isOpen, onClose }) {
  const [openGroups, setOpenGroups] = useState({ jewellery: true, billing: true });

  const toggleGroup = (key) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (path) => currentPath === path;

  const isGroupActive = (item) => {
    if (!item.children) return false;
    return item.children.some(child => currentPath === child.path);
  };

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-logo">
        <img src={logo} alt="Sri Sai Jewels Logo" />
        <div className="sidebar-logo-text">
          <span className="brand-name">Sri Sai Jewels</span>
          <span className="brand-tagline">Jewellery Billing</span>
        </div>
        {onClose && (
          <button className="sidebar-mobile-close" onClick={onClose} aria-label="Close navigation menu">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          if (item.children) {
            const isOpen = openGroups[item.key];
            const groupActive = isGroupActive(item);
            const Icon = item.icon;
            return (
              <div key={item.key} className="nav-section">
                <div
                  className={`nav-group-toggle ${isOpen ? 'open' : ''} ${groupActive ? 'active' : ''}`}
                  onClick={() => toggleGroup(item.key)}
                >
                  <Icon className="nav-icon" />
                  <span>{item.label}</span>
                  <ChevronDown className="chevron" />
                </div>
                <div className={`nav-sub-group ${isOpen ? 'open' : ''}`}>
                  {item.children.map((child) => (
                    <div
                      key={child.key}
                      className={`nav-item sub-item ${isActive(child.path) ? 'active' : ''}`}
                      onClick={() => onNavigate(child.path)}
                    >
                      <span>{child.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => onNavigate(item.path)}
            >
              <Icon className="nav-icon" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="version">Sri Sai Jewels v1.0 — Phase 1</div>
      </div>
    </aside>
  );
}
