import React, { useState } from 'react';
import { LayoutDashboard, ShoppingCart, Package } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { POS } from './components/POS';
import { Inventory } from './components/Inventory';
import { TabView } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<TabView>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'pos':
        return <POS />;
      case 'inventory':
        return <Inventory />;
      default:
        return <Dashboard />;
    }
  };

  const NavItem = ({ tab, icon: Icon, label }: { tab: TabView; icon: any; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-4 py-2 md:py-3 rounded-xl transition-all duration-200 ${
        activeTab === tab 
          ? 'bg-green-600 text-white shadow-md' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className={`w-6 h-6 md:w-5 md:h-5 ${activeTab === tab ? 'stroke-2' : 'stroke-1.5'}`} />
      <span className="text-[10px] md:text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-6 fixed h-full z-10">
        <div className="flex flex-col items-center mb-10 text-center">
            {/* Logo Placeholder - Replace src with your uploaded image file path */}
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-3xl mb-3 shadow-lg border-4 border-green-100">
                RD
            </div>
            
            <div>
                <h1 className="font-bold text-gray-800 text-xl leading-tight">RD COMPANY</h1>
                <p className="text-xs text-gray-400 mt-1">Laundry • Store • Konter</p>
            </div>
        </div>
        
        <nav className="space-y-2">
            <NavItem tab="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem tab="pos" icon={ShoppingCart} label="Kasir / Transaksi" />
            <NavItem tab="inventory" icon={Package} label="Gudang / Stok" />
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-20 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">RD</div>
            <div>
                <div className="font-bold text-gray-800 leading-none">RD Company</div>
                <div className="text-[10px] text-gray-500">System v2.0</div>
            </div>
         </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto min-h-screen">
        <div className="max-w-6xl mx-auto">
            {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 z-30 flex justify-between items-center safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <NavItem tab="dashboard" icon={LayoutDashboard} label="Home" />
        <NavItem tab="pos" icon={ShoppingCart} label="Kasir" />
        <NavItem tab="inventory" icon={Package} label="Stok" />
      </nav>

      {/* Global CSS for some simple animations */}
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.4s ease-out forwards;
        }
        .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}

export default App;