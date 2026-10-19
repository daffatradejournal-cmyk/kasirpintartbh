import React from 'react';
import { StoreProfile } from '../types';
import {
  Sparkles,
  QrCode,
  AlertTriangle,
  ShieldCheck,
  Sun,
  Moon,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
} from 'lucide-react';

interface Props {
  storeProfile: StoreProfile;
  lowStockCount: number;
  onOpenScanner: () => void;
  onGoToLowStock: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  activeTab: 'pos' | 'inventory' | 'reports' | 'settings';
  onSelectTab: (tab: 'pos' | 'inventory' | 'reports' | 'settings') => void;
}

export const Navbar: React.FC<Props> = ({
  storeProfile,
  lowStockCount,
  onOpenScanner,
  onGoToLowStock,
  isDarkMode,
  onToggleDarkMode,
  activeTab,
  onSelectTab,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#09090B]/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand & Store Info */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-emerald-100" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base tracking-tight">
                Kasir Pintar
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="truncate max-w-[120px] sm:max-w-none font-medium">
                {storeProfile.storeName}
              </span>
              <span className="hidden sm:inline text-zinc-300 dark:text-zinc-600">•</span>
              <span className="hidden sm:inline-flex items-center text-zinc-600 dark:text-zinc-300 font-medium text-[11px]">
                {storeProfile.activeCashier}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Main Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-900/90 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
          <button
            onClick={() => onSelectTab('pos')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pos'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Kasir</span>
          </button>

          <button
            onClick={() => onSelectTab('inventory')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
              activeTab === 'inventory'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Katalog & Stok</span>
            {lowStockCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {lowStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('reports')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'reports'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Laporan</span>
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Pengaturan</span>
          </button>
        </nav>

        {/* Action Controls & Badges */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors flex items-center space-x-1.5 text-xs font-semibold"
            title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden lg:inline text-zinc-200">Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-zinc-600" />
                <span className="hidden lg:inline">Gelap</span>
              </>
            )}
          </button>

          {/* Low Stock Warning */}
          {lowStockCount > 0 && (
            <button
              onClick={onGoToLowStock}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20 transition-colors text-xs font-semibold"
              title={`${lowStockCount} barang stok menipis`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xl:inline">Stok Menipis</span>
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {lowStockCount}
              </span>
            </button>
          )}

          {/* Offline-Ready */}
          <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Offline-Ready</span>
          </div>

          {/* Barcode Quick Scanner */}
          <button
            onClick={onOpenScanner}
            className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition-colors text-xs font-semibold"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">Scan Barcode</span>
          </button>
        </div>
      </div>
    </header>
  );
};
