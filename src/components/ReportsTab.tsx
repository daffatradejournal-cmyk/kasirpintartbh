import React, { useState } from 'react';
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
  Calendar,
  Banknote,
  QrCode,
  ArrowUpRight,
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
  const filteredByDate = transactions.filter((t) => {
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

  const validTransactions = filteredByDate.filter((t) => !t.isVoid);
  const grossRevenue = validTransactions.reduce((acc, t) => acc + t.finalAmount, 0);

  let netProfit = 0;
  validTransactions.forEach((t) => {
    let txProfit = 0;
    t.items.forEach((item) => {
      txProfit += (item.sellPrice - item.buyPrice) * item.quantity - item.discount;
    });
    txProfit -= t.discountAmount;
    netProfit += Math.max(0, txProfit);
  });

  const profitMarginPercent = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  const cashTotal = validTransactions
    .filter((t) => t.paymentMethod === 'CASH')
    .reduce((acc, t) => acc + t.finalAmount, 0);

  const qrisTotal = validTransactions
    .filter((t) => t.paymentMethod === 'QRIS')
    .reduce((acc, t) => acc + t.finalAmount, 0);

  const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  validTransactions.forEach((t) => {
    t.items.forEach((it) => {
      if (!productSalesMap[it.productName]) {
        productSalesMap[it.productName] = { name: it.productName, qty: 0, revenue: 0 };
      }
      productSalesMap[it.productName].qty += it.quantity;
      productSalesMap[it.productName].revenue += it.subtotal;
    });
  });

  const bestSellers = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const highestBestSellerQty = bestSellers.length > 0 ? bestSellers[0].qty : 1;

  const displayedHistory = filteredByDate.filter((t) => {
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

  return (
    <div className="space-y-6 pb-24">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Laporan Finansial & Omzet
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Live
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">
            Analisis laba bersih transparan, omzet penjualan, dan riwayat nota transaksi
          </p>
        </div>

        {/* Period Segmented Buttons */}
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

      {/* Main Financial Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Omzet Kotor */}
        <div className="bg-white dark:bg-[#121215] p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Omzet Kotor
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <DollarSign className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold font-mono tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
              {formatRupiah(grossRevenue)}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Total kotor nota belanja</p>
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="bg-white dark:bg-[#121215] p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Laba Bersih
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatRupiah(netProfit)}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1 font-mono">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                +{profitMarginPercent.toFixed(1)}%
              </span>
              <span>margin keuntungan</span>
            </p>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white dark:bg-[#121215] p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Transaksi
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <Receipt className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {validTransactions.length}{' '}
              <span className="text-sm font-normal text-zinc-500">Nota</span>
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Transaksi lunas berhasil</p>
          </div>
        </div>

        {/* Metode Pembayaran */}
        <div className="bg-white dark:bg-[#121215] p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Metode Bayar
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <CreditCard className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-4 space-y-1 text-xs">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-zinc-400" />
                Tunai
              </span>
              <span className="font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                {formatRupiah(cashTotal)}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
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

      {/* Top 5 Best Sellers */}
      <div className="bg-white dark:bg-[#121215] p-5 sm:p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <Trophy className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                Top 5 Produk Terlaris
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal">
                Berdasarkan volume kuantitas penjualan tertinggi
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/50 px-2.5 py-0.5 rounded-md">
            Paling Cepat Laku
          </span>
        </div>

        {bestSellers.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 py-6 text-center font-medium">
            Belum ada penjualan produk pada periode ini.
          </p>
        ) : (
          <div className="space-y-3">
            {bestSellers.map((item, idx) => {
              const progress = (item.qty / highestBestSellerQty) * 100;

              return (
                <div
                  key={item.name}
                  className="space-y-1.5 p-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] font-mono font-bold flex items-center justify-center border border-zinc-200/60 dark:border-zinc-700/60">
                        {idx + 1}
                      </span>
                      <span>{item.name}</span>
                    </span>
                    <span className="font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                      {item.qty} pcs • {formatRupiah(item.revenue)}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction History Section */}
      <div className="bg-white dark:bg-[#121215] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
              Riwayat Nota Belanja
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
              Cetak ulang struk digital atau batalkan nota salah input (void)
            </p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari nota / pembeli..."
                value={searchInvoice}
                onChange={(e) => setSearchInvoice(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 rounded-lg outline-none focus:border-emerald-500 font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700/80 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/60 font-medium text-zinc-700 dark:text-zinc-200 outline-none"
            >
              <option value="ALL">Semua</option>
              <option value="SUCCESS">Berhasil</option>
              <option value="VOID">Batal (Void)</option>
            </select>
          </div>
        </div>

        {/* Transaction Rows */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {displayedHistory.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 dark:text-zinc-500 text-xs font-medium">
              Tidak ada data riwayat nota transaksi.
            </div>
          ) : (
            displayedHistory.map((tx) => (
              <div
                key={tx.id}
                className={`p-4 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  tx.isVoid ? 'bg-zinc-50/60 dark:bg-zinc-900/30 opacity-60' : 'hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30'
                }`}
              >
                {/* Left Info */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                      {tx.invoiceNumber}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border ${
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
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal">
                    {formatDateTime(tx.createdAt)} • Kasir: {tx.cashierName}
                    {tx.customerName && ` • Pelanggan: ${tx.customerName}`}
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-1 font-normal">
                    {tx.items.map((i) => `${i.productName} (${i.quantity}x)`).join(', ')}
                  </p>
                </div>

                {/* Right Price & Actions */}
                <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p
                      className={`font-bold font-mono tabular-nums text-sm sm:text-base ${
                        tx.isVoid
                          ? 'line-through text-zinc-400 dark:text-zinc-600'
                          : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {formatRupiah(tx.finalAmount)}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                      {tx.items.length} item
                    </p>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onViewReceipt(tx)}
                      className="px-3 py-1.5 text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors text-xs font-medium flex items-center space-x-1 border border-zinc-200/60 dark:border-zinc-700/60"
                      title="Lihat & Cetak Ulang Struk"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Struk</span>
                    </button>

                    {!tx.isVoid && (
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Batalkan nota ${tx.invoiceNumber}?\nSemua stok barang pada nota ini akan otomatis dikembalikan ke inventaris toko.`
                            )
                          ) {
                            onVoidTransaction(tx.id);
                          }
                        }}
                        className="px-3 py-1.5 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg transition-colors text-xs font-medium flex items-center space-x-1 border border-rose-200/50 dark:border-rose-900/50"
                        title="Batalkan Transaksi (Void)"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Void</span>
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
  );
};
