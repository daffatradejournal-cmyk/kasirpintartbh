import React, { useState } from 'react';
import { formatRupiah } from '../utils/formatters';
import { X, CheckCircle2, Banknote, QrCode, ArrowRight, Coins } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cartTotal: number;
  onConfirmPayment: (method: 'CASH' | 'QRIS', paidAmount: number, changeAmount: number) => void;
}

export const PaymentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  cartTotal,
  onConfirmPayment,
}) => {
  const [method, setMethod] = useState<'CASH' | 'QRIS'>('CASH');
  const [paidInput, setPaidInput] = useState<string>(cartTotal.toString());

  if (!isOpen) return null;

  const paidAmount = parseFloat(paidInput) || 0;
  const changeAmount = paidAmount - cartTotal;
  const isSufficient = paidAmount >= cartTotal;

  const handleQuickAdd = (amount: number) => {
    const next = paidAmount + amount;
    setPaidInput(next.toString());
  };

  const handleSetDirect = (amount: number) => {
    setPaidInput(amount.toString());
  };

  const handleSubmit = () => {
    if (method === 'CASH') {
      if (!isSufficient) return;
      onConfirmPayment('CASH', paidAmount, changeAmount);
    } else {
      onConfirmPayment('QRIS', cartTotal, 0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-[#131B2E] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[94vh] border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200 transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/30">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Kasir Pintar Checkout</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Pilih metode pembayaran pelanggan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method Selector Tabs */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100/80 dark:bg-gray-800 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setMethod('CASH');
                setPaidInput(cartTotal.toString());
              }}
              className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-black transition-all ${
                method === 'CASH'
                  ? 'bg-white dark:bg-[#131B2E] text-emerald-800 dark:text-emerald-300 shadow-md shadow-black/5 dark:shadow-black/20 scale-[1.01]'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>TUNAI (CASH)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod('QRIS');
                setPaidInput(cartTotal.toString());
              }}
              className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-black transition-all ${
                method === 'QRIS'
                  ? 'bg-white dark:bg-[#131B2E] text-teal-800 dark:text-teal-300 shadow-md shadow-black/5 dark:shadow-black/20 scale-[1.01]'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>NON-TUNAI (QRIS)</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Bill Display Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg flex items-center justify-between border border-emerald-500/20">
            <div>
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                Total Tagihan Belanja
              </span>
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white mt-0.5 block">
                {formatRupiah(cartTotal)}
              </span>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-white/10 rounded-full text-[10px] font-bold text-emerald-200">
                Pajak 0% (UMKM)
              </span>
            </div>
          </div>

          {method === 'CASH' ? (
            <div className="space-y-4">
              {/* Cash Input */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                  Uang Diterima dari Pembeli:
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-emerald-800 dark:text-emerald-400 font-extrabold text-xl">Rp</span>
                  <input
                    type="number"
                    value={paidInput}
                    onChange={(e) => setPaidInput(e.target.value)}
                    className="w-full pl-14 pr-4 py-3 text-2xl font-black font-mono border-2 border-emerald-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 bg-emerald-50/20 dark:bg-gray-800/80 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Quick Tactile Keypad */}
              <div>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">
                  PILIHAN CEPAT NOMINAL (TACTILE PAD):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaidInput(cartTotal.toString())}
                    className="py-2.5 px-3 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 text-xs font-black rounded-xl border border-emerald-300 dark:border-emerald-800 shadow-xs transition-transform active:scale-95"
                  >
                    ⚡ Uang Pas
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetDirect(50000)}
                    className="py-2.5 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs transition-transform active:scale-95"
                  >
                    Rp 50.000
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetDirect(100000)}
                    className="py-2.5 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs transition-transform active:scale-95"
                  >
                    Rp 100.000
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(10000)}
                    className="py-2.5 px-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs transition-transform active:scale-95"
                  >
                    +10.000
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(20000)}
                    className="py-2.5 px-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs transition-transform active:scale-95"
                  >
                    +20.000
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(50000)}
                    className="py-2.5 px-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs transition-transform active:scale-95"
                  >
                    +50.000
                  </button>
                </div>
              </div>

              {/* Kembalian / Kurang Card */}
              <div
                className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  isSufficient
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 text-emerald-950 dark:text-emerald-200'
                    : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-400 dark:border-rose-600 text-rose-950 dark:text-rose-200'
                }`}
              >
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                    {isSufficient ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Kembalian Pembeli</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                        <span>Uang Kurang</span>
                      </>
                    )}
                  </p>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
                    {isSufficient ? 'Serahkan nominal ini ke pembeli' : 'Minta tambahan uang ke pembeli'}
                  </p>
                </div>
                <span className="text-2xl sm:text-3xl font-black font-mono">
                  {formatRupiah(Math.abs(changeAmount))}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="inline-block p-4 bg-white border-2 border-emerald-100 dark:border-emerald-800 rounded-3xl shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=00020101021226680016ID.CO.QRIS.WWW0118936009990000000000520458125303360540${cartTotal}5802ID5919KasirPintar%20Merchant6011TEMBILAHAN6304`}
                  alt="QRIS Code"
                  className="w-44 h-44 mx-auto rounded-xl"
                />
              </div>
              <p className="text-sm font-extrabold text-gray-900 dark:text-white">QRIS Standar Bank Indonesia</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                Bisa di-scan menggunakan GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, BRI, dll.
              </p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-5 bg-gray-50 dark:bg-[#0E1524] border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={method === 'CASH' && !isSufficient}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/30 transition-all active:scale-[0.99] disabled:opacity-40 flex items-center justify-center space-x-2 text-sm sm:text-base tracking-wide"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>KONFIRMASI BAYAR ({formatRupiah(cartTotal)})</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
