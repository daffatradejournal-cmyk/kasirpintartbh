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
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-teal-50 text-primary rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Keranjang Belanja</h3>
              <p className="text-xs text-gray-500 font-medium">{totalQty} item produk</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
              >
                Kosongkan
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm font-semibold">Keranjang belanja kosong</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="pt-3 first:pt-0 flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-3">
                  <h4 className="font-bold text-sm text-gray-900 truncate">{item.product.name}</h4>
                  <p className="text-xs text-gray-500 font-medium">
                    {formatRupiah(item.product.sellPrice)} / {item.product.unit}
                  </p>
                  {item.discount > 0 && (
                    <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                      Diskon: -{formatRupiah(item.discount)}
                    </span>
                  )}
                </div>

                {/* Tactile Quantity Stepper */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden shadow-inner">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-200 text-gray-600 transition-colors"
                    >
                      {item.quantity <= 1 ? <Trash2 className="w-3.5 h-3.5 text-rose-500" /> : <Minus className="w-3.5 h-3.5" />}
                    </button>
                    <span className="px-3 font-mono font-bold text-xs text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="p-2 hover:bg-gray-200 text-gray-600 disabled:opacity-30 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="w-20 text-right font-mono font-extrabold text-sm text-gray-900">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Customer & Discount Controls */}
        <div className="p-5 bg-gray-50 border-t border-gray-100 space-y-3">
          {/* Customer inputs */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Nama Pembeli (opsional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-white outline-none focus:border-primary"
              />
            </div>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="No WA (0812xxx)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-white outline-none focus:border-primary"
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
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-white outline-none focus:border-primary"
            />
          </div>

          {/* Discount Global Toggle */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowDiscountInput(!showDiscountInput)}
              className="text-xs font-bold text-primary flex items-center space-x-1 hover:underline"
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
                className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  onUpdateCartDiscount(parseFloat(discountVal) || 0);
                  setShowDiscountInput(false);
                }}
                className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg"
              >
                Terapkan
              </button>
            </div>
          )}

          {/* Breakdown */}
          <div className="pt-2 border-t border-gray-200 space-y-1 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>{formatRupiah(grossTotal)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Total Diskon:</span>
                <span>-{formatRupiah(totalDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-gray-900 pt-1">
              <span>Total Akhir:</span>
              <span className="text-primary font-mono">{formatRupiah(finalTotal)}</span>
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
            className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white font-extrabold rounded-xl shadow-md transition-all disabled:opacity-50 text-sm"
          >
            LANJUT PEMBAYARAN ({formatRupiah(finalTotal)})
          </button>
        </div>
      </div>
    </div>
  );
};
