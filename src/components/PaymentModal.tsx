import React, { useState } from 'react';
import { formatRupiah } from '../utils/formatters';
import { X, CheckCircle2, Banknote, QrCode, ArrowRight, Coins, AlertCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#121215] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200 transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <Coins className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                Pembayaran Kasir
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Pilih metode pembayaran pelanggan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Method Selector Tabs */}
        <div className="px-5 pt-3.5">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
            <button
              type="button"
              onClick={() => {
                setMethod('CASH');
                setPaidInput(cartTotal.toString());
              }}
              className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-medium transition-all ${
                method === 'CASH'
                  ? 'bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Banknote className="w-4 h-4 stroke-[2]" />
              <span>Tunai (Cash)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod('QRIS');
                setPaidInput(cartTotal.toString());
              }}
              className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-medium transition-all ${
                method === 'QRIS'
                  ? 'bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <QrCode className="w-4 h-4 stroke-[2]" />
              <span>Non-Tunai (QRIS)</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Bill Display Banner */}
          <div className="bg-zinc-900 text-zinc-100 rounded-xl p-4 shadow-xs flex items-center justify-between border border-zinc-800">
            <div>
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                Total Tagihan Belanja
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white mt-0.5 block">
                {formatRupiah(cartTotal)}
              </span>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 bg-zinc-800 rounded text-[10px] font-mono text-zinc-300 border border-zinc-700">
                Pajak 0% (UMKM)
              </span>
            </div>
          </div>

          {method === 'CASH' ? (
            <div className="space-y-3.5">
              {/* Cash Input */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Uang Diterima dari Pembeli:
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-zinc-400 font-mono text-base">Rp</span>
                  <input
                    type="number"
                    value={paidInput}
                    onChange={(e) => setPaidInput(e.target.value)}
                    className="w-full pl-11 pr-3.5 py-2 text-xl font-bold font-mono tabular-nums border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Quick Tactile Keypad */}
              <div>
                <span className="text-[10px] font-mono font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
                  Nominal Cepat:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaidInput(cartTotal.toString())}
                    className="py-2 px-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-semibold rounded-lg border border-emerald-200/60 dark:border-emerald-900/50 transition-colors"
                  >
                    Uang Pas
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetDirect(50000)}
                    className="py-2 px-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-mono font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 transition-colors"
                  >
                    Rp 50.000
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetDirect(100000)}
                    className="py-2 px-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-mono font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 transition-colors"
                  >
                    Rp 100.000
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(10000)}
                    className="py-1.5 px-2.5 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-mono font-medium rounded-lg border border-zinc-200/80 dark:border-zinc-700/80 transition-colors"
                  >
                    +10.000
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(20000)}
                    className="py-1.5 px-2.5 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-mono font-medium rounded-lg border border-zinc-200/80 dark:border-zinc-700/80 transition-colors"
                  >
                    +20.000
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(50000)}
                    className="py-1.5 px-2.5 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-mono font-medium rounded-lg border border-zinc-200/80 dark:border-zinc-700/80 transition-colors"
                  >
                    +50.000
                  </button>
                </div>
              </div>

              {/* Kembalian / Kurang Card */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                  isSufficient
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
                }`}
              >
                <div>
                  <p className="text-xs font-medium flex items-center gap-1.5">
                    {isSufficient ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2]" />
                        <span>Kembalian Pembeli</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 stroke-[2]" />
                        <span>Uang Kurang</span>
                      </>
                    )}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {isSufficient ? 'Serahkan nominal ini ke pembeli' : 'Minta tambahan uang ke pembeli'}
                  </p>
                </div>
                <span className="text-lg sm:text-xl font-bold font-mono tabular-nums">
                  {formatRupiah(Math.abs(changeAmount))}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="inline-block p-4 bg-white border border-zinc-200 rounded-2xl shadow-xs">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=00020101021226680016ID.CO.QRIS.WWW0118936009990000000000520458125303360540${cartTotal}5802ID5919KasirPintar%20Merchant6011TEMBILAHAN6304`}
                  alt="QRIS Code"
                  className="w-40 h-40 mx-auto rounded-lg"
                />
              </div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">QRIS Standar Bank Indonesia</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                Dapat di-scan dengan GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, BRI, dll.
              </p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={method === 'CASH' && !isSufficient}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-xs transition-colors active:scale-[0.99] disabled:opacity-40 flex items-center justify-center space-x-2 text-xs sm:text-sm"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2]" />
            <span>Konfirmasi Bayar ({formatRupiah(cartTotal)})</span>
            <ArrowRight className="w-4 h-4 ml-1 stroke-[2]" />
          </button>
        </div>
      </div>
    </div>
  );
};
