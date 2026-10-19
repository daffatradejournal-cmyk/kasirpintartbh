import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Transaction, StoreProfile } from '../types';
import { formatRupiah, formatDateTime } from '../utils/formatters';
import { X, Printer, Share2, PlusCircle, Sparkles } from 'lucide-react';

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
      // Trigger joyful celebration confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
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
    let msg = `🧾 *STRUK PEMBELIAN - ${storeProfile.storeName.toUpperCase()}*\n`;
    msg += `📍 ${storeProfile.address}\n`;
    if (storeProfile.phone) msg += `📞 ${storeProfile.phone}\n`;
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
    msg += `💰 *TOTAL BAYAR : ${formatRupiah(transaction.finalAmount)}*\n`;
    msg += `Metode     : ${transaction.paymentMethod}\n`;
    msg += `Diterima   : ${formatRupiah(transaction.paidAmount)}\n`;
    msg += `Kembalian  : *${formatRupiah(transaction.changeAmount)}*\n`;
    msg += `================================\n`;
    msg += `${storeProfile.receiptFooter}\n`;
    msg += `\n_Struk digital resmi diterbitkan oleh Kasir Pintar Mobile._`;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#131B2E] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col my-4 border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200 transition-colors">
        {/* Modal Celebration Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 dark:border-gray-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40">
          <div className="flex items-center space-x-2 text-emerald-900 dark:text-emerald-300">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <span className="font-extrabold text-sm block">Transaksi Berhasil!</span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Stok barang otomatis terpotong</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Realistic Thermal Paper with Jagged Sawtooth Edge */}
        <div className="p-6 bg-gray-100/80 dark:bg-gray-900/80 flex justify-center">
          <div
            id="printable-receipt"
            className="receipt-paper w-full max-w-[340px] p-6 rounded-sm font-mono text-xs text-gray-950 leading-relaxed border-t-2 border-b-2 border-dashed border-gray-300"
          >
            {/* Store Header */}
            <div className="text-center pb-2">
              <h2 className="font-black text-sm tracking-wide uppercase">
                {storeProfile.storeName}
              </h2>
              <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{storeProfile.address}</p>
              {storeProfile.phone && (
                <p className="text-[11px] text-gray-600">Telp: {storeProfile.phone}</p>
              )}
            </div>

            <div className="border-t border-dashed border-gray-400 my-2.5"></div>

            {/* Meta */}
            <div className="space-y-1 text-[11px]">
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

            <div className="border-t border-dashed border-gray-400 my-2.5"></div>

            {/* Items */}
            <div className="space-y-2 py-1">
              {transaction.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <p className="font-extrabold">{item.productName}</p>
                  <div className="flex justify-between text-gray-700">
                    <span>
                      {item.quantity} x {formatRupiah(item.sellPrice)}
                    </span>
                    <span className="font-extrabold text-gray-950">{formatRupiah(item.subtotal)}</span>
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

            <div className="border-t border-dashed border-gray-400 my-2.5"></div>

            {/* Totals */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatRupiah(transaction.totalAmount)}</span>
              </div>
              {transaction.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Diskon Nota:</span>
                  <span>-{formatRupiah(transaction.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-gray-950 pt-1 border-t border-dotted border-gray-400">
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
              <div className="flex justify-between font-extrabold">
                <span>Kembalian:</span>
                <span>{formatRupiah(transaction.changeAmount)}</span>
              </div>
            </div>

            <div className="border-t-2 border-double border-gray-500 my-3"></div>

            {/* Receipt Footer */}
            <p className="text-center text-[10px] text-gray-600 whitespace-pre-line leading-normal">
              {storeProfile.receiptFooter}
            </p>
            <p className="text-center text-[9px] text-gray-400 mt-2 font-bold tracking-wider">
              KASIR PINTAR • DAFFA (UNISI)
            </p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-white dark:bg-[#131B2E] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 py-3 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-2xl font-black text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition-transform active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Kirim WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl font-black text-xs shadow-md shadow-emerald-950/20 flex items-center justify-center space-x-1.5 transition-transform active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Thermal</span>
          </button>
          <button
            type="button"
            onClick={onNewTransaction}
            className="py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl font-black text-xs flex items-center justify-center space-x-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
