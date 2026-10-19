import React from 'react';
import { StoreProfile } from '../types';
import {
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  Sparkles,
  ShieldCheck,
  User,
} from 'lucide-react';

interface Props {
  activeTab: 'pos' | 'inventory' | 'reports' | 'settings';
  onSelectTab: (tab: 'pos' | 'inventory' | 'reports' | 'settings') => void;
  lowStockCount: number;
  storeProfile: StoreProfile;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  lowStockCount,
  storeProfile,
}) => {
  const navItems = [
    {
      id: 'pos' as const,
      label: 'Kasir (POS)',
      icon: ShoppingCart,
      badge: null,
    },
    {
      id: 'inventory' as const,
      label: 'Katalog & Stok',
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'reports' as const,
      label: 'Laporan & Omzet',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'settings' as const,
      label: 'Pengaturan',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="hidden md:flex w-60 lg:w-64 h-screen sticky top-0 bg-white dark:bg-[#121215] border-r border-zinc-200/80 dark:border-zinc-800/80 flex-col justify-between shrink-0 transition-colors z-30 select-none">
      {/* Top: Brand & Store Header */}
      <div>
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-100" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base tracking-tight truncate">
                  Kasir Pintar
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate mt-0.5">
                {storeProfile.storeName}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="p-3 space-y-1.5">
          <p className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
            Menu Utama
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono ${
                      isActive ? 'bg-amber-400 text-zinc-950' : 'bg-amber-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Active Cashier & Offline Status */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="p-2.5 rounded-xl bg-white dark:bg-[#18181b] border border-zinc-200/60 dark:border-zinc-800 flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 stroke-[2]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-zinc-400 leading-none">Kasir Bertugas</p>
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
              {storeProfile.activeCashier}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Offline-First</span>
          </span>
          <span className="text-zinc-400">v2.0</span>
        </div>
      </div>
    </aside>
  );
};
