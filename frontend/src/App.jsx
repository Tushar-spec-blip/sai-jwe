import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Inventory from './pages/Inventory';
import NewBill from './pages/NewBill';
import Bills from './pages/Bills';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import MetalRates from './pages/MetalRates';
import Settings from './pages/Settings';
import BackupRestore from './pages/BackupRestore';

const ROUTES = {
  '/': Dashboard,
  '/customers': Customers,
  '/inventory': Inventory,
  '/new-bill': NewBill,
  '/bills': Bills,
  '/payments': Payments,
  '/reports': Reports,
  '/metal-rates': MetalRates,
  '/settings': Settings,
  '/backup': BackupRestore,
};

export default function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = (path) => {
    setCurrentPath(path);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const PageComponent = ROUTES[currentPath] || Dashboard;

  return (
    <div className="app-layout">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      <Sidebar
        currentPath={currentPath}
        onNavigate={navigate}
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
      />

      <div className="main-area">
        <Header
          currentPath={currentPath}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={toggleMobileMenu}
        />
        <main className="page-content">
          <PageComponent onNavigate={navigate} />
        </main>
      </div>
    </div>
  );
}
