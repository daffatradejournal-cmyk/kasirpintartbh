import React, { useState, useMemo } from 'react';
import { Product, CartItem, StoreProfile } from '../types';
import { formatRupiah } from '../utils/formatters';
import {
  Search,
  QrCode,
  Plus,
  Minus,
  Trash2,
  Check,
  ShoppingBag,
  User,
  Phone,
  Tag,
  Banknote,
  Coins,
  ArrowRight,
  RotateCcw,
  Receipt,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

interface Props {
  products: Product[];
  categories: string[];
  cartItems: CartItem[];
  cartDiscount: number;
  onAddToCart: (product: Product) => void;
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
  onConfirmPayment: (method: 'CASH' | 'QRIS', paidAmount: number, changeAmount: number) => void;
  onOpenScanner: () => void;
  storeProfile: StoreProfile;
}

export const CashierTab: React.FC<Props> = ({
  products,
  categories,
  cartItems,
  cartDiscount,
  onAddToCart,
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
  onConfirmPayment,
  onOpenScanner,
  storeProfile,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileTicketOpen, setIsMobileTicketOpen] = useState<boolean>(false);

  // In-Ticket Payment State
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS'>('CASH');
  const [paidInput, setPaidInput] = useState<string>('');
  const [showDiscountInput, setShowDiscountInput] = useState<boolean>(false);
  const [discountVal, setDiscountVal] = useState<string>('');

  // Calculations
  const cartGross = useMemo(
    () => cartItems.reduce((acc, it) => acc + it.product.sellPrice * it.quantity, 0),
    [cartItems]
  );
  const cartItemDiscounts = useMemo(
    () => cartItems.reduce((acc, it) => acc + it.discount, 0),
    [cartItems]
  );
  const cartTotalQty = useMemo(
    () => cartItems.reduce((acc, it) => acc + it.quantity, 0),
    [cartItems]
  );
  const cartFinalTotal = useMemo(
    () => Math.max(0, cartGross - cartItemDiscounts - cartDiscount),
    [cartGross, cartItemDiscounts, cartDiscount]
  );

  // Cash calculations
  const effectivePaidAmount = paidInput ? parseFloat(paidInput) || 0 : cartFinalTotal;
  const changeAmount = effectivePaidAmount - cartFinalTotal;
  const isCashSufficient = effectivePaidAmount >= cartFinalTotal;

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleQuickAddCash = (amount: number) => {
    const current = parseFloat(paidInput) || cartFinalTotal;
    setPaidInput((current + amount).toString());
  };

  const handleSetDirectCash = (amount: number) => {
    setPaidInput(amount.toString());
  };

  const handleProcessPayment = () => {
    if (cartItems.length === 0) return;
    if (paymentMethod === 'CASH') {
      if (!isCashSufficient) return;
      onConfirmPayment('CASH', effectivePaidAmount, changeAmount);
    } else {
      onConfirmPayment('QRIS', cartFinalTotal, 0);
    }
    setPaidInput('');
    setIsMobileTicketOpen(false);
  };

  return (
    <div className="lg:h-[calc(100vh-85px)] flex flex-col lg:flex-row gap-5 pb-20 lg:pb-0">
      {/* ======================================================== */}
      {/* LEFT COLUMN: CATALOG & FAST PRODUCT SELECTION (60-65%) */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Control Bar */}
        <div className="bg-white dark:bg-[#121215] p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3 mb-3">
          <div className="flex gap-2.5 items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama barang atau barcode kemasan..."
                className="w-full pl-9 pr-9 py-2.5 bg-zinc-50/60 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-900 font-medium transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 bg-zinc-200/60 dark:bg-zinc-800 rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Camera Barcode Button */}
            <button
              onClick={onOpenScanner}
              className="px-3.5 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-colors shadow-xs"
              title="Buka Kamera Barcode Scanner"
            >
              <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Scan Barcode</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all select-none ${
                    isSelected
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs'
                      : 'bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Catalog Grid (Scrollable Container) */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-[#121215] rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                Produk tidak ditemukan
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                Coba gunakan kata kunci pencarian lain atau pilih tab kategori berbeda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {filteredProducts.map((product) => {
                const inCart = cartItems.find((it) => it.product.id === product.id);
                const inCartQty = inCart ? inCart.quantity : 0;
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= product.minStock;

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && onAddToCart(product)}
                    className={`group relative bg-white dark:bg-[#121215] border rounded-xl p-3 flex flex-col justify-between transition-all select-none ${
                      isOutOfStock
                        ? 'opacity-40 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-not-allowed'
                        : inCartQty > 0
                        ? 'border-emerald-500/80 dark:border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs cursor-pointer active:scale-[0.98]'
                        : 'border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer active:scale-[0.98] shadow-xs'
                    }`}
                  >
                    {/* Top Row: Category & Stock Status */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 truncate uppercase">
                        {product.category.split('&')[0].trim()}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium shrink-0 ${
                          isOutOfStock
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                            : isLowStock
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${
                            isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                        />
                        {isOutOfStock ? 'Habis' : `${product.stock} ${product.unit}`}
                      </span>
                    </div>

                    {/* Middle: Product Name & SKU */}
                    <div className="my-1 flex-1">
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {product.name}
                      </h4>
                      <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                        {product.code}
                      </p>
                    </div>

                    {/* Bottom Row: Price & Quantity Action */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between mt-2">
                      <div>
                        <span className="font-bold text-zinc-950 dark:text-zinc-100 font-mono text-xs sm:text-sm tabular-nums block">
                          {formatRupiah(product.sellPrice)}
                        </span>
                      </div>

                      {inCartQty > 0 ? (
                        <div className="flex items-center space-x-1 bg-emerald-600 text-white px-2 py-0.5 rounded-lg text-xs font-mono font-bold shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>{inCartQty}</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
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
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT COLUMN: PERMANENT LIVE CASHIER TICKET (DESKTOP)     */}
      {/* ======================================================== */}
      <div className="hidden lg:flex w-96 xl:w-[420px] bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm flex-col h-full overflow-hidden shrink-0">
        {/* Ticket Header */}
        <div className="px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/40">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Receipt className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-none">
                Tiket Transaksi Kasir
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono mt-1">
                {cartTotalQty} item • Kasir: {storeProfile.activeCashier.split(' ')[0]}
              </p>
            </div>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-[11px] text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium px-2 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center space-x-1"
              title="Kosongkan tiket pesanan"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Batal</span>
            </button>
          )}
        </div>

        {/* Customer Inline Fields */}
        <div className="p-3 bg-zinc-50/30 dark:bg-zinc-900/20 border-b border-zinc-100 dark:border-zinc-800/80 grid grid-cols-2 gap-2 text-xs">
          <div className="relative">
            <User className="w-3 h-3 absolute left-2.5 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Nama pembeli..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full pl-7 pr-2 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:border-emerald-500"
            />
          </div>
          <div className="relative">
            <Phone className="w-3 h-3 absolute left-2.5 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="No WA (0812...)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full pl-7 pr-2 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Scrollable Order Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400 dark:text-zinc-500">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 flex items-center justify-center mb-3 text-zinc-400">
                <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Tiket Belanja Kosong
              </p>
              <p className="text-[11px] text-zinc-400 max-w-xs mt-1">
                Klik produk di katalog sebelah kiri untuk langsung menambahkan ke antrean belanja pelanggan.
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.product.id} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-xs text-zinc-900 dark:text-zinc-100 truncate">
                    {item.product.name}
                  </h5>
                  <p className="font-mono text-[11px] text-zinc-400">
                    {formatRupiah(item.product.sellPrice)} / {item.product.unit}
                  </p>
                </div>

                {/* Stepper */}
                <div className="flex items-center space-x-1.5 shrink-0">
                  <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                    >
                      {item.quantity <= 1 ? (
                        <Trash2 className="w-3 h-3 text-rose-500" />
                      ) : (
                        <Minus className="w-3 h-3" />
                      )}
                    </button>
                    <span className="px-2 font-mono font-bold text-xs tabular-nums text-zinc-900 dark:text-zinc-100">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 disabled:opacity-30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="w-16 text-right font-mono font-bold text-xs tabular-nums text-zinc-900 dark:text-zinc-100">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pinned Pricing & Payment Panel */}
        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/70 border-t border-zinc-200/80 dark:border-zinc-800 space-y-2.5">
          {/* Subtotal & Discount row */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">{formatRupiah(cartGross)}</span>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowDiscountInput(!showDiscountInput)}
                className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-1 hover:underline text-[11px]"
              >
                <Tag className="w-3 h-3" />
                <span>{cartDiscount > 0 ? `Diskon: -${formatRupiah(cartDiscount)}` : '+ Diskon Nota'}</span>
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
              <div className="flex gap-1.5 pt-1">
                <input
                  type="number"
                  placeholder="Rp Diskon"
                  value={discountVal}
                  onChange={(e) => setDiscountVal(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 font-mono outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    onUpdateCartDiscount(parseFloat(discountVal) || 0);
                    setShowDiscountInput(false);
                  }}
                  className="px-3 py-1 bg-zinc-800 text-white text-xs rounded-lg"
                >
                  OK
                </button>
              </div>
            )}

            {/* Total Display */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-baseline">
              <span className="text-xs uppercase font-bold text-zinc-700 dark:text-zinc-300">
                Total Tagihan
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {formatRupiah(cartFinalTotal)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-200/60 dark:bg-zinc-800 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => {
                setPaymentMethod('CASH');
                setPaidInput('');
              }}
              className={`py-1.5 rounded-lg font-medium flex items-center justify-center space-x-1.5 transition-all ${
                paymentMethod === 'CASH'
                  ? 'bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Tunai</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentMethod('QRIS');
                setPaidInput(cartFinalTotal.toString());
              }}
              className={`py-1.5 rounded-lg font-medium flex items-center justify-center space-x-1.5 transition-all ${
                paymentMethod === 'QRIS'
                  ? 'bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QRIS</span>
            </button>
          </div>

          {/* If Cash: Quick tactile shortcuts */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-1.5">
              <div className="grid grid-cols-3 gap-1 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setPaidInput(cartFinalTotal.toString())}
                  className="py-1 px-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 font-medium"
                >
                  Uang Pas
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDirectCash(50000)}
                  className="py-1 px-1 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
                >
                  50.000
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDirectCash(100000)}
                  className="py-1 px-1 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
                >
                  100.000
                </button>
              </div>

              {/* Cash input + Kembalian line */}
              <div className="flex gap-2 items-center text-xs">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1.5 text-zinc-400 font-mono text-xs">Rp</span>
                  <input
                    type="number"
                    value={paidInput}
                    onChange={(e) => setPaidInput(e.target.value)}
                    placeholder={cartFinalTotal.toString()}
                    className="w-full pl-8 pr-2 py-1.5 text-xs font-mono font-bold border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block leading-none">Kembalian</span>
                  <span
                    className={`font-mono font-bold text-xs tabular-nums ${
                      isCashSufficient ? 'text-zinc-900 dark:text-zinc-100' : 'text-rose-500'
                    }`}
                  >
                    {formatRupiah(Math.max(0, changeAmount))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Primary Process Button */}
          <button
            type="button"
            disabled={cartItems.length === 0 || (paymentMethod === 'CASH' && !isCashSufficient)}
            onClick={handleProcessPayment}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-40 active:scale-[0.99]"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Selesaikan & Cetak Struk</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE STICKY FLOATING BOTTOM BAR (< LG SCREENS)         */}
      {/* ======================================================== */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-16 left-3 right-3 z-30">
          <div
            onClick={() => setIsMobileTicketOpen(true)}
            className="bg-zinc-950 text-white p-3 rounded-2xl shadow-xl border border-zinc-800 flex items-center justify-between cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center justify-center">
                {cartTotalQty}
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 font-mono leading-none">
                  {cartItems.length} Produk
                </p>
                <p className="text-sm font-bold font-mono text-white mt-0.5">
                  {formatRupiah(cartFinalTotal)}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="px-3.5 py-1.5 bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs flex items-center space-x-1"
            >
              <span>Buka Tiket</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MOBILE TICKET DRAWER MODAL (< LG SCREENS)                */}
      {/* ======================================================== */}
      {isMobileTicketOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white dark:bg-[#121215] w-full sm:max-w-md max-h-[88vh] rounded-t-3xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Drawer Header */}
            <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-emerald-500" />
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Tiket Transaksi ({cartTotalQty} item)
                </h4>
              </div>
              <button
                onClick={() => setIsMobileTicketOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Item list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-zinc-100 dark:divide-zinc-800">
              {cartItems.map((item) => (
                <div key={item.product.id} className="pt-2 first:pt-0 flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-medium text-xs text-zinc-900 dark:text-zinc-100 truncate">
                      {item.product.name}
                    </p>
                    <p className="font-mono text-[10px] text-zinc-400">
                      {formatRupiah(item.product.sellPrice)} / {item.product.unit}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 text-zinc-600 dark:text-zinc-300"
                      >
                        {item.quantity <= 1 ? (
                          <Trash2 className="w-3 h-3 text-rose-500" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                      </button>
                      <span className="px-2 font-mono font-bold text-xs">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 text-zinc-600 dark:text-zinc-300"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="w-16 text-right font-mono font-bold text-xs">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Payment Drawer Footer */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase font-bold text-zinc-600 dark:text-zinc-400">
                  Total Bayar
                </span>
                <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(cartFinalTotal)}
                </span>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-200/60 dark:bg-zinc-800 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2 rounded-lg font-medium ${
                    paymentMethod === 'CASH'
                      ? 'bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Tunai (Cash)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`py-2 rounded-lg font-medium ${
                    paymentMethod === 'QRIS'
                      ? 'bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  QRIS
                </button>
              </div>

              <button
                type="button"
                onClick={handleProcessPayment}
                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs"
              >
                Konfirmasi & Cetak Struk ({formatRupiah(cartFinalTotal)})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
