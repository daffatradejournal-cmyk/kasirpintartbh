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
  Sparkles,
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
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Laporan Finansial & Omzet</span>
            <span className="p-1.5 bg-amber-100 text-amber-800 rounded-xl text-xs font-black">
              📊 Live
            </span>
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Analisis laba bersih transparan, omzet penjualan, dan riwayat nota transaksi
          </p>
        </div>

        {/* Period Segmented Buttons */}
        <div className="flex bg-gray-100/90 p-1.5 rounded-2xl text-xs font-black">
          {(['TODAY', 'WEEK', 'MONTH', 'ALL'] as const).map((period) => {
            const labels = { TODAY: 'Hari Ini', WEEK: '7 Hari', MONTH: 'Bulan Ini', ALL: 'Semua' };
            const active = filterPeriod === period;
            return (
              <button
                key={period}
                onClick={() => setFilterPeriod(period)}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  active
                    ? 'bg-white text-emerald-800 shadow-md shadow-black/5 scale-[1.02]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {labels[period]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Financial Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Omzet Kotor */}
        <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-5 rounded-3xl shadow-xl shadow-emerald-950/20 flex flex-col justify-between border border-emerald-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-300">
            <span className="text-xs font-black uppercase tracking-wider">Omzet Kotor</span>
            <div className="p-2.5 bg-white/10 rounded-2xl">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
              {formatRupiah(grossRevenue)}
            </p>
            <p className="text-[11px] text-emerald-200 mt-1">Total kotor nota belanja</p>
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-black uppercase tracking-wider">Laba Bersih</span>
            <div className="p-2.5 bg-emerald-50 rounded-2xl">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-700">
              {formatRupiah(netProfit)}
            </p>
            <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-extrabold">+{profitMarginPercent.toFixed(1)}%</span>
              <span>margin keuntungan</span>
            </p>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-teal-500/50 transition-colors">
          <div className="flex items-center justify-between text-teal-800">
            <span className="text-xs font-black uppercase tracking-wider">Total Nota</span>
            <div className="p-2.5 bg-teal-50 rounded-2xl">
              <Receipt className="w-5 h-5 text-teal-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-black font-mono text-gray-900">
              {validTransactions.length}{' '}
              <span className="text-sm font-semibold text-gray-400">Transaksi</span>
            </p>
            <p className="text-[11px] text-gray-500 mt-1">Nota lunas berhasil</p>
          </div>
        </div>

        {/* Metode Pembayaran */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-800">
            <span className="text-xs font-black uppercase tracking-wider">Metode Bayar</span>
            <div className="p-2.5 bg-purple-50 rounded-2xl">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-3 space-y-1 text-xs">
            <div className="flex justify-between font-mono font-medium py-0.5">
              <span className="text-gray-500">💵 Tunai:</span>
              <span className="font-black text-gray-900">{formatRupiah(cashTotal)}</span>
            </div>
            <div className="flex justify-between font-mono font-medium py-0.5">
              <span className="text-gray-500">📱 QRIS:</span>
              <span className="font-black text-teal-700">{formatRupiah(qrisTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Best Sellers Podium */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-base">Top 5 Produk Terlaris (Best Seller)</h3>
              <p className="text-[11px] text-gray-400 font-medium">Berdasarkan kuantitas penjualan tertinggi</p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            🔥 Paling Cepat Laku
          </span>
        </div>

        {bestSellers.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center font-bold">
            Belum ada penjualan produk pada periode ini.
          </p>
        ) : (
          <div className="space-y-3.5">
            {bestSellers.map((item, idx) => {
              const progress = (item.qty / highestBestSellerQty) * 100;
              const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

              return (
                <div key={item.name} className="space-y-1.5 p-3 rounded-2xl hover:bg-gray-50/80 transition-colors">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-gray-900 flex items-center gap-2">
                      <span className="text-base">{medals[idx]}</span>
                      <span>{item.name}</span>
                    </span>
                    <span className="font-black font-mono text-emerald-800">
                      {item.qty} pcs • {formatRupiah(item.revenue)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500 shadow-xs"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction History Section */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div>
            <h3 className="font-black text-gray-900 text-lg">Riwayat Nota Belanja</h3>
            <p className="text-xs text-gray-500 font-medium">
              Cetak ulang struk digital atau batalkan nota salah input (*void*)
            </p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nomor nota / pembeli..."
                value={searchInvoice}
                onChange={(e) => setSearchInvoice(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3.5 py-2 text-xs border border-gray-200 rounded-xl bg-white font-extrabold text-gray-700 outline-none"
            >
              <option value="ALL">Semua</option>
              <option value="SUCCESS">Berhasil</option>
              <option value="VOID">Batal (Void)</option>
            </select>
          </div>
        </div>

        {/* Transaction Rows */}
        <div className="divide-y divide-gray-100">
          {displayedHistory.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-xs font-bold">
              Tidak ada data riwayat nota transaksi.
            </div>
          ) : (
            displayedHistory.map((tx) => (
              <div
                key={tx.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  tx.isVoid ? 'bg-gray-50/80 opacity-70' : 'hover:bg-gray-50/50'
                }`}
              >
                {/* Left Info */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-sm text-gray-900">
                      {tx.invoiceNumber}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        tx.isVoid
                          ? 'bg-rose-100 text-rose-800'
                          : tx.paymentMethod === 'CASH'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-teal-100 text-teal-900'
                      }`}
                    >
                      {tx.isVoid ? 'VOID (BATAL)' : tx.paymentMethod}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {formatDateTime(tx.createdAt)} • Kasir: {tx.cashierName}
                    {tx.customerName && ` • Pelanggan: ${tx.customerName}`}
                  </p>
                  <p className="text-xs text-gray-700 line-clamp-1 font-medium">
                    {tx.items.map((i) => `${i.productName} (${i.quantity}x)`).join(', ')}
                  </p>
                </div>

                {/* Right Price & Actions */}
                <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p
                      className={`font-black font-mono text-base sm:text-lg ${
                        tx.isVoid ? 'line-through text-gray-400' : 'text-emerald-800'
                      }`}
                    >
                      {formatRupiah(tx.finalAmount)}
                    </p>
                    <p className="text-[10px] text-gray-400">{tx.items.length} macam barang</p>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onViewReceipt(tx)}
                      className="px-3 py-2 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all text-xs font-black flex items-center space-x-1"
                      title="Lihat & Cetak Ulang Struk"
                    >
                      <Eye className="w-4 h-4" />
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
                        className="px-3 py-2 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all text-xs font-black flex items-center space-x-1"
                        title="Batalkan Transaksi (Void)"
                      >
                        <Ban className="w-4 h-4" />
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
