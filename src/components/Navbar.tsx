import React from 'react';
import { StoreProfile } from '../types';
import { Sparkles, QrCode, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  storeProfile: StoreProfile;
  lowStockCount: number;
  onOpenScanner: () => void;
  onGoToLowStock: () => void;
}

export const Navbar: React.FC<Props> = ({
  storeProfile,
  lowStockCount,
  onOpenScanner,
  onGoToLowStock,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Store Info */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 transform transition-transform hover:scale-105">
              <Sparkles className="w-5 h-5 animate-pulse text-amber-200" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-gray-900 text-base sm:text-lg leading-tight tracking-tight flex items-center gap-1.5">
                <span>Kasir Pintar</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs">
                  PRO
                </span>
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="font-semibold text-gray-800 truncate max-w-[150px] sm:max-w-none">
                {storeProfile.storeName}
              </span>
              <span className="hidden sm:inline text-gray-300">•</span>
              <span className="hidden sm:inline-flex items-center text-emerald-600 font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-ping"></span>
                {storeProfile.activeCashier}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Low Stock Warning Pill */}
          {lowStockCount > 0 && (
            <button
              onClick={onGoToLowStock}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl border border-amber-200/80 transition-all text-xs font-bold shadow-xs active:scale-95"
              title={`${lowStockCount} barang stok menipis`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Stok Menipis</span>
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                {lowStockCount}
              </span>
            </button>
          )}

          {/* 100% Offline-Ready Pill */}
          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50/80 text-emerald-800 rounded-xl border border-emerald-200/60 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Offline-First (Tanpa Internet)</span>
          </div>

          {/* Barcode Quick Scanner */}
          <button
            onClick={onOpenScanner}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all text-xs font-bold"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">Scan Barcode</span>
          </button>
        </div>
      </div>
    </header>
  );
};
