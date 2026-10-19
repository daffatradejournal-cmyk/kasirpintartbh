import React, { useState } from 'react';
import { Product, CartItem } from '../types';
import { formatRupiah } from '../utils/formatters';
import { Search, QrCode, ShoppingBag, Plus, ArrowRight } from 'lucide-react';

interface Props {
  products: Product[];
  cartItems: CartItem[];
  onAddToCart: (product: Product) => void;
  onOpenCart: () => void;
  onOpenScanner: () => void;
  categories: string[];
}

const CATEGORY_ICONS: Record<string, string> = {
  'Semua': '✨',
  'Sembako & Beras': '🍚',
  'Bumbu & Dapur': '🍳',
  'Makanan Ringan': '🍜',
  'Minuman': '☕',
  'Kebutuhan Mandi': '🧼',
  'Perlengkapan Rumah': '🏠',
};

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
      {/* Sapaan Ramah Kasir */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-800 dark:via-teal-800 dark:to-cyan-900 rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-emerald-900/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">👋</span>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
              Selamat Melayani Pelanggan!
            </h2>
          </div>
          <p className="text-xs text-emerald-100 dark:text-emerald-200 mt-1 max-w-xl">
            Pilih produk dari katalog atau scan barcode barang dengan kamera untuk transaksi cepat tanpa antrean.
          </p>
        </div>

        <button
          onClick={onOpenScanner}
          className="px-4 py-2 bg-white dark:bg-gray-900 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 rounded-xl font-extrabold text-xs shadow-md flex items-center space-x-2 transition-transform active:scale-95 shrink-0"
        >
          <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Scan Kamera Kasir</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-3.5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama barang cepat atau ketik barcode..."
          className="w-full pl-11 pr-10 py-3 bg-white dark:bg-[#131B2E] border border-gray-200/90 dark:border-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition-all font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-3.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold bg-gray-100 dark:bg-gray-800 rounded-full w-5 h-5 flex items-center justify-center"
          >
            ✕
          </button>
        )}
      </div>

      {/* Horizontal Category Selector with Emojis */}
      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const icon = CATEGORY_ICONS[cat] || '📦';

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 select-none ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                  : 'bg-white dark:bg-[#131B2E] border border-gray-200/80 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50/80 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-sm">{icon}</span>
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Product Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#131B2E] rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 p-8 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="font-extrabold text-gray-800 dark:text-white text-base">Produk Tidak Ditemukan</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            Barang dengan kata kunci tersebut tidak ada di katalog. Coba cari kata kunci lain atau tambahkan di menu Stok Barang.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredProducts.map((product) => {
            const inCart = cartItems.find((it) => it.product.id === product.id);
            const inCartQty = inCart ? inCart.quantity : 0;
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= product.minStock;

            return (
              <div
                key={product.id}
                onClick={() => !isOutOfStock && onAddToCart(product)}
                className={`group relative bg-white dark:bg-[#131B2E] border rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-200 select-none ${
                  isOutOfStock
                    ? 'opacity-60 border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900 cursor-not-allowed'
                    : 'border-gray-200/90 dark:border-gray-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 cursor-pointer active:scale-[0.98]'
                }`}
              >
                {/* Header Card: Emoji Avatar & Stock Badge */}
                <div className="flex items-start justify-between gap-1 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-100/80 dark:border-emerald-800/40 flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform">
                    {product.emoji || '📦'}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-tight ${
                        isOutOfStock
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                          : isLowStock
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400'
                          : 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {isOutOfStock ? (
                        'Habis'
                      ) : (
                        <>
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1 ${
                              isLowStock ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                            }`}
                          ></span>
                          Stok: {product.stock}
                        </>
                      )}
                    </span>

                    {inCartQty > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-black shadow-xs animate-bounce">
                        {inCartQty} di troli
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Card: Name & Code */}
                <div className="my-1.5 flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {product.name}
                  </h4>
                  <p className="font-mono text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                    {product.code} • {product.unit}
                  </p>
                </div>

                {/* Footer Card: Price & Add Button */}
                <div className="pt-2.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between mt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Harga</span>
                    <span className="font-extrabold text-emerald-800 dark:text-emerald-400 font-mono text-sm sm:text-base leading-tight">
                      {formatRupiah(product.sellPrice)}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isOutOfStock}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      isOutOfStock
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600'
                        : inCartQty > 0
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white'
                    }`}
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-4xl mx-auto z-30 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div
            onClick={onOpenCart}
            className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 hover:from-emerald-950 hover:to-slate-950 text-white rounded-2xl p-4 shadow-2xl shadow-emerald-950/40 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all border border-emerald-500/30 backdrop-blur-lg"
          >
            <div className="flex items-center space-x-3.5">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-black text-base shadow-md">
                  {cartTotalQty}
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-emerald-950 animate-ping"></span>
              </div>
              <div>
                <p className="text-xs text-emerald-200 font-semibold">
                  {cartItems.length} Produk ({cartTotalQty} pcs dalam keranjang)
                </p>
                <p className="text-xl font-black font-mono leading-none tracking-tight text-white mt-0.5">
                  {formatRupiah(cartTotalPrice)}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="px-5 py-3 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-emerald-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center space-x-1.5"
            >
              <span>BAYAR SEKARANG</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
