import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { formatRupiah, formatDateTime } from '../utils/formatters';
import {
  TrendingUp,
  Receipt,
  CreditCard,
  DollarSign,
  Search,
  Eye,
  Ban,
  Trophy,
  Banknote,
  QrCode,
  Calendar,
} from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onVoidTransaction: (transactionId: string) => void;
  onViewReceipt: (transaction: Transaction) => void;
}

export const ReportsTab: React.FC<Props> = ({
  transactions,
  onVoidTransaction,
  onViewReceipt,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('TODAY');
  const [searchInvoice, setSearchInvoice] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'VOID'>('ALL');

  const now = new Date();
  const filteredByDate = useMemo(() => {
    return transactions.filter((t) => {
      const txDate = new Date(t.createdAt);
      if (filterPeriod === 'TODAY') {
        return (
          txDate.getDate() === now.getDate() &&
          txDate.getMonth() === now.getMonth() &&
          txDate.getFullYear() === now.getFullYear()
        );
      }
      if (filterPeriod === 'WEEK') {
        const diffTime = Math.abs(now.getTime() - txDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }
      if (filterPeriod === 'MONTH') {
        return (
          txDate.getMonth() === now.getMonth() &&
          txDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [transactions, filterPeriod]);

  const validTransactions = useMemo(() => filteredByDate.filter((t) => !t.isVoid), [filteredByDate]);
  const grossRevenue = useMemo(() => validTransactions.reduce((acc, t) => acc + t.finalAmount, 0), [validTransactions]);

  const netProfit = useMemo(() => {
    let profit = 0;
    validTransactions.forEach((t) => {
      let txProfit = 0;
      t.items.forEach((item) => {
        txProfit += (item.sellPrice - item.buyPrice) * item.quantity - item.discount;
      });
      txProfit -= t.discountAmount;
      profit += Math.max(0, txProfit);
    });
    return profit;
  }, [validTransactions]);

  const profitMarginPercent = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  const cashTotal = useMemo(
    () =>
      validTransactions
        .filter((t) => t.paymentMethod === 'CASH')
        .reduce((acc, t) => acc + t.finalAmount, 0),
    [validTransactions]
  );

  const qrisTotal = useMemo(
    () =>
      validTransactions
        .filter((t) => t.paymentMethod === 'QRIS')
        .reduce((acc, t) => acc + t.finalAmount, 0),
    [validTransactions]
  );

  const bestSellers = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    validTransactions.forEach((t) => {
      t.items.forEach((it) => {
        if (!map[it.productName]) {
          map[it.productName] = { name: it.productName, qty: 0, revenue: 0 };
        }
        map[it.productName].qty += it.quantity;
        map[it.productName].revenue += it.subtotal;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [validTransactions]);

  const highestBestSellerQty = bestSellers.length > 0 ? bestSellers[0].qty : 1;

  const displayedHistory = useMemo(() => {
    return filteredByDate.filter((t) => {
      if (statusFilter === 'SUCCESS' && t.isVoid) return false;
      if (statusFilter === 'VOID' && !t.isVoid) return false;
      if (searchInvoice.trim()) {
        const q = searchInvoice.toLowerCase();
        const matchInvoice = t.invoiceNumber.toLowerCase().includes(q);
        const matchCustomer = t.customerName?.toLowerCase().includes(q);
        return matchInvoice || matchCustomer;
      }
      return true;
    });
  }, [filteredByDate, statusFilter, searchInvoice]);

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Laporan Finansial & Omzet
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">
            Analisis laba bersih, volume penjualan toko, dan arsip nota belanja
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-medium">
          {(['TODAY', 'WEEK', 'MONTH', 'ALL'] as const).map((period) => {
            const labels = { TODAY: 'Hari Ini', WEEK: '7 Hari', MONTH: 'Bulan Ini', ALL: 'Semua' };
            const active = filterPeriod === period;
            return (
              <button
                key={period}
                onClick={() => setFilterPeriod(period)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  active
                    ? 'bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {labels[period]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Omzet Kotor */}
        <div className="bg-white dark:bg-[#121215] p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Omzet Kotor
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <DollarSign className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {formatRupiah(grossRevenue)}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Penjualan kotor kasir</p>
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="bg-white dark:bg-[#121215] p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Estimasi Laba Bersih
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatRupiah(netProfit)}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1 font-mono">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                +{profitMarginPercent.toFixed(1)}%
              </span>
              <span>margin keuntungan</span>
            </p>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white dark:bg-[#121215] p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Nota Berhasil
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <Receipt className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {validTransactions.length}{' '}
              <span className="text-xs font-normal text-zinc-500">Nota</span>
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Transaksi lunas tuntas</p>
          </div>
        </div>

        {/* Metode Bayar */}
        <div className="bg-white dark:bg-[#121215] p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Rincian Metode Bayar
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <CreditCard className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-3 space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-zinc-400" />
                Tunai
              </span>
              <span className="font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                {formatRupiah(cashTotal)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-zinc-400" />
                QRIS
              </span>
              <span className="font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                {formatRupiah(qrisTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Best Sellers (Left) & Transaction History Table (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Top 5 Best Sellers (col-span-5) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#121215] p-4 sm:p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                Top 5 Produk Terlaris
              </h3>
            </div>
            <span className="text-[10px] font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-900/50">
              Volume
            </span>
          </div>

          {bestSellers.length === 0 ? (
            <p className="text-xs text-zinc-400 py-10 text-center font-medium">
              Belum ada penjualan pada periode ini.
            </p>
          ) : (
            <div className="space-y-2.5 pt-1">
              {bestSellers.map((item, idx) => {
                const progress = (item.qty / highestBestSellerQty) * 100;
                return (
                  <div
                    key={item.name}
                    className="p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] font-mono font-bold flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                          {idx + 1}
                        </span>
                        <span className="truncate max-w-[170px] sm:max-w-xs">{item.name}</span>
                      </span>
                      <span className="font-mono font-bold tabular-nums text-zinc-900 dark:text-zinc-100 shrink-0">
                        {item.qty} pcs • {formatRupiah(item.revenue)}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Transaction History Section (col-span-7) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#121215] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
          {/* Header & Search */}
          <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-2.5 justify-between items-stretch sm:items-center">
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                Riwayat Nota Belanja
              </h3>
              <p className="text-[11px] text-zinc-400">Cetak ulang struk thermal atau pembatalan (void)</p>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-44">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari nota..."
                  value={searchInvoice}
                  onChange={(e) => setSearchInvoice(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900/60 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs border border-zinc-200 dark:border-zinc-700/80 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/60 font-medium text-zinc-700 dark:text-zinc-300 outline-none"
              >
                <option value="ALL">Semua</option>
                <option value="SUCCESS">Berhasil</option>
                <option value="VOID">Batal (Void)</option>
              </select>
            </div>
          </div>

          {/* History List */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-[460px] overflow-y-auto">
            {displayedHistory.length === 0 ? (
              <div className="text-center py-16 text-zinc-400 text-xs font-medium">
                Tidak ada data nota transaksi.
              </div>
            ) : (
              displayedHistory.map((tx) => (
                <div
                  key={tx.id}
                  className={`p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors ${
                    tx.isVoid ? 'bg-zinc-50/60 dark:bg-zinc-900/30 opacity-60' : 'hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30'
                  }`}
                >
                  {/* Left */}
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {tx.invoiceNumber}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-medium px-1.5 py-0.5 rounded border ${
                          tx.isVoid
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
                            : tx.paymentMethod === 'CASH'
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50'
                        }`}
                      >
                        {tx.isVoid ? 'VOID' : tx.paymentMethod}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      {formatDateTime(tx.createdAt)} • {tx.items.length} macam barang
                      {tx.customerName && ` • Pelanggan: ${tx.customerName}`}
                    </p>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0">
                    <div className="text-left sm:text-right">
                      <p
                        className={`font-mono font-bold text-xs sm:text-sm tabular-nums ${
                          tx.isVoid ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'
                        }`}
                      >
                        {formatRupiah(tx.finalAmount)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onViewReceipt(tx)}
                        className="p-1.5 text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
                        title="Lihat Struk"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {!tx.isVoid && (
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Batalkan nota ${tx.invoiceNumber}?\nStok barang akan otomatis dikembalikan ke inventaris.`
                              )
                            ) {
                              onVoidTransaction(tx.id);
                            }
                          }}
                          className="p-1.5 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-md transition-colors"
                          title="Batalkan Nota (Void)"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
