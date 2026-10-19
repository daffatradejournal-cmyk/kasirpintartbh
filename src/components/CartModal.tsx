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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#131B2E] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-gray-100 dark:border-gray-800 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Keranjang Belanja</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{totalQty} item produk</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                Kosongkan
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 divide-y divide-gray-100 dark:divide-gray-800">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 dark:text-gray-500 text-sm font-semibold">Keranjang belanja kosong</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="pt-3 first:pt-0 flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-3">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.product.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {formatRupiah(item.product.sellPrice)} / {item.product.unit}
                  </p>
                  {item.discount > 0 && (
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded">
                      Diskon: -{formatRupiah(item.discount)}
                    </span>
                  )}
                </div>

                {/* Tactile Quantity Stepper */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 overflow-hidden shadow-inner">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                    >
                      {item.quantity <= 1 ? <Trash2 className="w-3.5 h-3.5 text-rose-500" /> : <Minus className="w-3.5 h-3.5" />}
                    </button>
                    <span className="px-3 font-mono font-bold text-xs text-gray-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="w-20 text-right font-mono font-extrabold text-sm text-gray-900 dark:text-white">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Customer & Discount Controls */}
        <div className="p-5 bg-gray-50 dark:bg-[#0E1524] border-t border-gray-100 dark:border-gray-800 space-y-3">
          {/* Customer inputs */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Nama Pembeli (opsional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-emerald-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="No WA (0812xxx)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-emerald-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="relative">
            <StickyNote className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Catatan pesanan..."
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-emerald-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Discount Global Toggle */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowDiscountInput(!showDiscountInput)}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 hover:underline"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{cartDiscount > 0 ? `Diskon Nota: -${formatRupiah(cartDiscount)}` : '+ Tambah Diskon Nota'}</span>
            </button>
            {cartDiscount > 0 && (
              <button
                type="button"
                onClick={() => onUpdateCartDiscount(0)}
                className="text-[11px] text-rose-600 hover:underline"
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
                className="flex-1 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  onUpdateCartDiscount(parseFloat(discountVal) || 0);
                  setShowDiscountInput(false);
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-xl"
              >
                Terapkan
              </button>
            </div>
          )}

          {/* Breakdown */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-1 text-xs">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal:</span>
              <span className="font-mono">{formatRupiah(grossTotal)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-rose-600 dark:text-rose-400 font-semibold">
                <span>Total Diskon:</span>
                <span className="font-mono">-{formatRupiah(totalDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-gray-900 dark:text-white pt-1">
              <span>Total Akhir:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">{formatRupiah(finalTotal)}</span>
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
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/25 transition-all disabled:opacity-40 text-sm"
          >
            LANJUT PEMBAYARAN ({formatRupiah(finalTotal)})
          </button>
        </div>
      </div>
    </div>
  );
};
