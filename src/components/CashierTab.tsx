import React, { useState } from 'react';
import { Product, CartItem } from '../types';
import { formatRupiah } from '../utils/formatters';
import { Search, QrCode, ShoppingBag, Plus, ArrowRight, Check } from 'lucide-react';

interface Props {
  products: Product[];
  cartItems: CartItem[];
  onAddToCart: (product: Product) => void;
  onOpenCart: () => void;
  onOpenScanner: () => void;
  categories: string[];
}

export const CashierTab: React.FC<Props> = ({
  products,
  cartItems,
  onAddToCart,
  onOpenCart,
  onOpenScanner,
  categories,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

  const cartTotalQty = cartItems.reduce((acc, it) => acc + it.quantity, 0);
  const cartTotalPrice = cartItems.reduce((acc, it) => acc + it.subtotal, 0);

  return (
    <div className="space-y-4 pb-36">
      {/* POS Toolbar: Quick Search & Scanner */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama barang atau scan barcode..."
            className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 rounded-full w-5 h-5 flex items-center justify-center font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={onOpenScanner}
          className="px-4 py-2.5 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 shrink-0 transition-colors"
        >
          <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Kamera Barcode</span>
        </button>
      </div>

      {/* Clean Category Chips (No cartoon emojis) */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all select-none ${
                isSelected
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs'
                  : 'bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/90 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Product Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#121215] rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Produk tidak ditemukan</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Tidak ada produk yang cocok dengan kata kunci pencarian. Coba kata kunci lain atau periksa filter kategori.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredProducts.map((product) => {
            const inCart = cartItems.find((it) => it.product.id === product.id);
            const inCartQty = inCart ? inCart.quantity : 0;
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= product.minStock;

            return (
              <div
                key={product.id}
                onClick={() => !isOutOfStock && onAddToCart(product)}
                className={`group relative bg-white dark:bg-[#121215] border rounded-xl p-3.5 flex flex-col justify-between transition-all select-none ${
                  isOutOfStock
                    ? 'opacity-50 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-not-allowed'
                    : 'border-zinc-200/90 dark:border-zinc-800/90 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 cursor-pointer active:scale-[0.99] shadow-xs hover:shadow-sm'
                }`}
              >
                {/* Top Meta: Category Tag & Stock Status */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate">
                    {product.category.replace(' & ', ' • ')}
                  </span>

                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums shrink-0 ${
                      isOutOfStock
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : isLowStock
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {isOutOfStock ? 'Habis' : `Stok ${product.stock}`}
                  </span>
                </div>

                {/* Body: Product Name & SKU */}
                <div className="my-1 flex-1">
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {product.name}
                  </h4>
                  <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                    {product.code} • {product.unit}
                  </p>
                </div>

                {/* Bottom Row: Price & Quantity Action */}
                <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between mt-2">
                  <div>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block leading-none">Harga</span>
                    <span className="font-bold text-zinc-950 dark:text-zinc-100 font-mono text-sm leading-tight tabular-nums mt-0.5 block">
                      {formatRupiah(product.sellPrice)}
                    </span>
                  </div>

                  {inCartQty > 0 ? (
                    <div className="flex items-center space-x-1 bg-emerald-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>{inCartQty}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        isOutOfStock
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group-hover:bg-emerald-600 group-hover:text-white'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Cart Bar (Clean Unobstructed POS Checkout Pill) */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-3xl mx-auto z-30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            onClick={onOpenCart}
            className="bg-zinc-950 dark:bg-[#18181b] text-white rounded-2xl p-3 sm:p-3.5 shadow-2xl shadow-black/30 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all border border-zinc-800/90"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {cartTotalQty}
              </div>
              <div>
                <p className="text-[11px] text-zinc-400 font-medium leading-none">
                  {cartItems.length} Produk ({cartTotalQty} item)
                </p>
                <p className="text-lg font-bold font-mono leading-tight tabular-nums text-white mt-1">
                  {formatRupiah(cartTotalPrice)}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="px-4 sm:px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs sm:text-sm transition-colors flex items-center space-x-1.5 shadow-xs"
            >
              <span>Bayar Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
