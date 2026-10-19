import React from 'react';
import { StoreProfile } from '../types';
import {
  QrCode,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface Props {
  storeProfile: StoreProfile;
  lowStockCount: number;
  onOpenScanner: () => void;
  onGoToLowStock: () => void;
  activeTab: 'pos' | 'inventory' | 'reports' | 'settings';
}

export const Navbar: React.FC<Props> = ({
  storeProfile,
  lowStockCount,
  onOpenScanner,
  onGoToLowStock,
  activeTab,
}) => {
  const titles = {
    pos: {
      title: 'Terminal Kasir',
      subtitle: 'Katalog cepat, scan barcode, dan cetak nota belanja',
    },
    inventory: {
      title: 'Katalog & Kontrol Stok',
      subtitle: 'Manajemen master barang, modal kulakan, dan deteksi restock',
    },
    reports: {
      title: 'Laporan Finansial & Omzet',
      subtitle: 'Omzet kotor, laba bersih, top seller, dan arsip nota transaksi',
    },
    settings: {
      title: 'Pengaturan & Tampilan',
      subtitle: 'Profil toko, template struk, tema gelap/terang, dan backup data',
    },
  };

  const current = titles[activeTab];

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#09090B]/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Left: Mobile Brand & Desktop Breadcrumb */}
        <div className="flex items-center space-x-3">
          {/* Mobile only brand */}
          <div className="flex items-center space-x-2 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-emerald-100" />
            </div>
            <div>
              <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Kasir Pintar</span>
              <p className="text-[10px] text-zinc-400 truncate max-w-[140px]">{storeProfile.storeName}</p>
            </div>
          </div>

          {/* Desktop Title & Subtitle */}
          <div className="hidden md:block">
            <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">
              {current.title}
            </h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-none">
              {current.subtitle}
            </p>
          </div>
        </div>

        {/* Right Action Icons (Clean & Uncluttered) */}
        <div className="flex items-center space-x-2">
          {lowStockCount > 0 && (
            <button
              onClick={onGoToLowStock}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50 hover:bg-amber-100 transition-colors text-xs font-mono font-medium"
              title="Lihat barang yang perlu kulakan"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{lowStockCount} Menipis</span>
            </button>
          )}

          <button
            onClick={onOpenScanner}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-medium border border-zinc-200/60 dark:border-zinc-700/60 transition-colors shadow-xs"
            title="Scan Barcode Kamera Cepat"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Kamera Barcode</span>
          </button>
        </div>
      </div>
    </header>
  );
};
