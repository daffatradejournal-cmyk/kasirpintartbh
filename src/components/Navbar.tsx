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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand & Store Info */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 transform transition-transform hover:scale-105">
              <Sparkles className="w-5 h-5 animate-pulse text-amber-200" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#111827] rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-gray-900 dark:text-white text-base sm:text-lg leading-tight tracking-tight flex items-center gap-1.5">
                <span>Kasir Pintar</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs">
                  PRO
                </span>
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[120px] sm:max-w-none">
                {storeProfile.storeName}
              </span>
              <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
              <span className="hidden sm:inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-ping"></span>
                {storeProfile.activeCashier}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Main Navigation Tabs (Clean Header Positioning) */}
        <nav className="hidden md:flex items-center space-x-1 bg-gray-100/90 dark:bg-gray-800/90 p-1.5 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-xs">
          <button
            onClick={() => onSelectTab('pos')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'pos'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-gray-700/70'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Kasir</span>
          </button>

          <button
            onClick={() => onSelectTab('inventory')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all relative ${
              activeTab === 'inventory'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-gray-700/70'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Katalog & Stok</span>
            {lowStockCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                {lowStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('reports')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'reports'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-gray-700/70'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Laporan</span>
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-gray-700/70'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan</span>
          </button>
        </nav>

        {/* Action Controls & Badges */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all flex items-center space-x-1.5 text-xs font-bold active:scale-95"
            title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden lg:inline text-amber-300">Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span className="hidden lg:inline">Gelap</span>
              </>
            )}
          </button>

          {/* Low Stock Warning Pill */}
          {lowStockCount > 0 && (
            <button
              onClick={onGoToLowStock}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-200/80 dark:border-amber-800/60 transition-all text-xs font-bold shadow-xs active:scale-95"
              title={`${lowStockCount} barang stok menipis`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xl:inline">Stok Menipis</span>
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                {lowStockCount}
              </span>
            </button>
          )}

          {/* 100% Offline-Ready Pill */}
          <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Offline-Ready</span>
          </div>

          {/* Barcode Quick Scanner */}
          <button
            onClick={onOpenScanner}
            className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all text-xs font-bold"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">Scan Barcode</span>
          </button>
        </div>
      </div>
    </header>
  );
};
