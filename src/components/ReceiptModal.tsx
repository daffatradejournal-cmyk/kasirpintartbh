import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Transaction, StoreProfile } from '../types';
import { formatRupiah, formatDateTime } from '../utils/formatters';
import { X, Printer, Share2, PlusCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  storeProfile: StoreProfile;
  onNewTransaction: () => void;
}

export const ReceiptModal: React.FC<Props> = ({
  isOpen,
  onClose,
  transaction,
  storeProfile,
  onNewTransaction,
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#059669', '#10B981', '#14B8A6', '#F59E0B'],
        });
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    let msg = `*STRUK PEMBELIAN - ${storeProfile.storeName.toUpperCase()}*\n`;
    msg += `Alamat: ${storeProfile.address}\n`;
    if (storeProfile.phone) msg += `Telp/WA: ${storeProfile.phone}\n`;
    msg += `--------------------------------\n`;
    msg += `No. Nota : *${transaction.invoiceNumber}*\n`;
    msg += `Tanggal  : ${formatDateTime(transaction.createdAt)}\n`;
    msg += `Kasir    : ${transaction.cashierName}\n`;
    if (transaction.customerName) msg += `Pelanggan: ${transaction.customerName}\n`;
    msg += `--------------------------------\n`;

    for (const item of transaction.items) {
      msg += `*${item.productName}*\n`;
      msg += `  ${item.quantity} x ${formatRupiah(item.sellPrice)} = *${formatRupiah(item.subtotal)}*\n`;
      if (item.discount > 0) msg += `  Diskon: -${formatRupiah(item.discount)}\n`;
    }

    msg += `--------------------------------\n`;
    msg += `Subtotal   : ${formatRupiah(transaction.totalAmount)}\n`;
    if (transaction.discountAmount > 0) {
      msg += `Diskon Nota: -${formatRupiah(transaction.discountAmount)}\n`;
    }
    msg += `*TOTAL BAYAR : ${formatRupiah(transaction.finalAmount)}*\n`;
    msg += `Metode     : ${transaction.paymentMethod}\n`;
    msg += `Diterima   : ${formatRupiah(transaction.paidAmount)}\n`;
    msg += `Kembalian  : *${formatRupiah(transaction.changeAmount)}*\n`;
    msg += `================================\n`;
    msg += `${storeProfile.receiptFooter}\n`;
    msg += `\n_Struk digital resmi diterbitkan oleh Kasir Pintar._`;

    let phone = transaction.customerPhone?.replace(/[^0-9]/g, '') || '';
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }

    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#121215] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col my-4 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200 transition-colors">
        {/* Modal Celebration Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm block">Transaksi Berhasil</span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal">Stok inventaris otomatis terpotong</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Realistic Thermal Paper */}
        <div className="p-5 bg-zinc-100 dark:bg-zinc-900/60 flex justify-center">
          <div
            id="printable-receipt"
            className="receipt-paper w-full max-w-[340px] p-5 rounded-sm font-mono text-xs text-zinc-950 leading-relaxed border-t-2 border-b-2 border-dashed border-zinc-300"
          >
            {/* Store Header */}
            <div className="text-center pb-2">
              <h2 className="font-bold text-sm tracking-wide uppercase">
                {storeProfile.storeName}
              </h2>
              <p className="text-[11px] text-zinc-600 mt-0.5 leading-snug">{storeProfile.address}</p>
              {storeProfile.phone && (
                <p className="text-[11px] text-zinc-600">Telp: {storeProfile.phone}</p>
              )}
            </div>

            <div className="border-t border-dashed border-zinc-400 my-2"></div>

            {/* Meta */}
            <div className="space-y-0.5 text-[11px]">
              <div className="flex justify-between">
                <span>No. Nota:</span>
                <span className="font-bold">{transaction.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span>{formatDateTime(transaction.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{transaction.cashierName}</span>
              </div>
              {transaction.customerName && (
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span>{transaction.customerName}</span>
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-zinc-400 my-2"></div>

            {/* Items */}
            <div className="space-y-1.5 py-0.5">
              {transaction.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <p className="font-semibold">{item.productName}</p>
                  <div className="flex justify-between text-zinc-700">
                    <span>
                      {item.quantity} x {formatRupiah(item.sellPrice)}
                    </span>
                    <span className="font-bold text-zinc-950">{formatRupiah(item.subtotal)}</span>
                  </div>
                  {item.discount > 0 && (
                    <div className="flex justify-between text-rose-600 text-[10px]">
                      <span>Diskon</span>
                      <span>-{formatRupiah(item.discount)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-zinc-400 my-2"></div>

            {/* Totals */}
            <div className="space-y-0.5 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatRupiah(transaction.totalAmount)}</span>
              </div>
              {transaction.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Diskon Nota:</span>
                  <span>-{formatRupiah(transaction.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-zinc-950 pt-1 border-t border-dotted border-zinc-400">
                <span>TOTAL:</span>
                <span>{formatRupiah(transaction.finalAmount)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Metode Bayar:</span>
                <span>{transaction.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Tunai Diterima:</span>
                <span>{formatRupiah(transaction.paidAmount)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Kembalian:</span>
                <span>{formatRupiah(transaction.changeAmount)}</span>
              </div>
            </div>

            <div className="border-t-2 border-double border-zinc-500 my-2.5"></div>

            {/* Receipt Footer */}
            <p className="text-center text-[10px] text-zinc-600 whitespace-pre-line leading-normal">
              {storeProfile.receiptFooter}
            </p>
            <p className="text-center text-[9px] text-zinc-400 mt-2 font-mono tracking-wider">
              KASIR PINTAR • DAFFA (UNISI)
            </p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-3.5 bg-white dark:bg-[#121215] border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 py-2.5 px-3 bg-[#128C7E] hover:bg-[#075E54] text-white rounded-xl font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Kirim WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-xl font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors border border-zinc-800 dark:border-zinc-700"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Thermal</span>
          </button>
          <button
            type="button"
            onClick={onNewTransaction}
            className="py-2.5 px-3.5 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors border border-zinc-200/60 dark:border-zinc-700/60"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Transaksi Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
