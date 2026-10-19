import React, { useState } from 'react';
import { CartItem } from '../types';
import { formatRupiah } from '../utils/formatters';
import { X, Plus, Minus, Trash2, Tag, ShoppingCart, User, Phone, StickyNote } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  cartDiscount: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdateItemDiscount: (productId: string, discount: number) => void;
  onUpdateCartDiscount: (discount: number) => void;
  onClearCart: () => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  orderNote: string;
  setOrderNote: (note: string) => void;
  onProceedToPayment: () => void;
}

export const CartModal: React.FC<Props> = ({
  isOpen,
  onClose,
  items,
  cartDiscount,
  onUpdateQuantity,
  onUpdateItemDiscount,
  onUpdateCartDiscount,
  onClearCart,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  orderNote,
  setOrderNote,
  onProceedToPayment,
}) => {
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountVal, setDiscountVal] = useState(cartDiscount.toString());

  if (!isOpen) return null;

  const grossTotal = items.reduce((acc, it) => acc + it.product.sellPrice * it.quantity, 0);
  const itemDiscounts = items.reduce((acc, it) => acc + it.discount, 0);
  const totalDiscount = itemDiscounts + cartDiscount;
  const finalTotal = Math.max(0, grossTotal - totalDiscount);
  const totalQty = items.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#121215] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-zinc-200 dark:border-zinc-800 transition-colors animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                Keranjang Belanja
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                {totalQty} item produk
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            {items.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                Kosongkan
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-400 dark:text-zinc-500 text-xs font-medium">Keranjang belanja kosong</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="pt-2.5 first:pt-0 flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-3">
                  <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                    {formatRupiah(item.product.sellPrice)} / {item.product.unit}
                  </p>
                  {item.discount > 0 && (
                    <span className="text-[10px] font-mono font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200/50 dark:border-rose-900/40">
                      Diskon: -{formatRupiah(item.discount)}
                    </span>
                  )}
                </div>

                {/* Tactile Quantity Stepper */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                    >
                      {item.quantity <= 1 ? (
                        <Trash2 className="w-3.5 h-3.5 text-rose-500 stroke-[2]" />
                      ) : (
                        <Minus className="w-3.5 h-3.5 stroke-[2]" />
                      )}
                    </button>
                    <span className="px-2.5 font-mono font-bold text-xs tabular-nums text-zinc-900 dark:text-zinc-100">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 disabled:opacity-30 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                  </div>

                  <span className="w-20 text-right font-mono font-bold text-xs sm:text-sm tabular-nums text-zinc-900 dark:text-zinc-100">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Customer & Discount Controls */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
          {/* Customer inputs */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Nama Pembeli (opsional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-medium"
              />
            </div>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder="No WA (0812xxx)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-mono"
              />
            </div>
          </div>

          <div className="relative">
            <StickyNote className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Catatan pesanan..."
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-normal"
            />
          </div>

          {/* Discount Global Toggle */}
          <div className="flex items-center justify-between pt-0.5">
            <button
              type="button"
              onClick={() => setShowDiscountInput(!showDiscountInput)}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 hover:underline"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{cartDiscount > 0 ? `Diskon Nota: -${formatRupiah(cartDiscount)}` : '+ Tambah Diskon Nota'}</span>
            </button>
            {cartDiscount > 0 && (
              <button
                type="button"
                onClick={() => onUpdateCartDiscount(0)}
                className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline"
              >
                Hapus
              </button>
            )}
          </div>

          {showDiscountInput && (
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Nominal Diskon (Rp)"
                value={discountVal}
                onChange={(e) => setDiscountVal(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  onUpdateCartDiscount(parseFloat(discountVal) || 0);
                  setShowDiscountInput(false);
                }}
                className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-lg"
              >
                Terapkan
              </button>
            </div>
          )}

          {/* Breakdown */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1 text-xs">
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">{formatRupiah(grossTotal)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-rose-600 dark:text-rose-400 font-medium">
                <span>Diskon Nota</span>
                <span className="font-mono tabular-nums">-{formatRupiah(totalDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 pt-1">
              <span>Total Akhir</span>
              <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {formatRupiah(finalTotal)}
              </span>
            </div>
          </div>

          {/* Proceed CTA */}
          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => {
              onClose();
              onProceedToPayment();
            }}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-xs transition-colors disabled:opacity-40 text-xs sm:text-sm active:scale-[0.99]"
          >
            Lanjut Pembayaran ({formatRupiah(finalTotal)})
          </button>
        </div>
      </div>
    </div>
  );
};
