import React, { useState, useEffect } from 'react';
import { Product, CartItem, Transaction, StoreProfile } from './types';
import {
  getStoredProducts,
  saveStoredProducts,
  getStoredTransactions,
  getStoredStoreProfile,
  saveStoredStoreProfile,
  executeCheckout,
  executeVoidTransaction,
  INITIAL_PRODUCTS,
  DEFAULT_STORE_PROFILE,
} from './utils/storage';
import { generateInvoiceNumber } from './utils/formatters';
import { Navbar } from './components/Navbar';
import { CashierTab } from './components/CashierTab';
import { InventoryTab } from './components/InventoryTab';
import { ReportsTab } from './components/ReportsTab';
import { SettingsTab } from './components/SettingsTab';
import { ReceiptModal } from './components/ReceiptModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { ShoppingCart, Package, BarChart3, Settings, CheckCircle2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'pos' | 'inventory' | 'reports' | 'settings'>('pos');
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(DEFAULT_STORE_PROFILE);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartDiscount, setCartDiscount] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [orderNote, setOrderNote] = useState<string>('');

  // Modals
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerCallback, setScannerCallback] = useState<((code: string) => void) | null>(null);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);

  // Theme State (Dark / Light Mode)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('kasirpintar_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kasirpintar_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kasirpintar_theme', 'light');
    }
  }, [isDarkMode]);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setProducts(getStoredProducts());
    setTransactions(getStoredTransactions());
    setStoreProfile(getStoredStoreProfile());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const categories = [
    'Semua',
    'Sembako & Beras',
    'Bumbu & Dapur',
    'Makanan Ringan',
    'Minuman',
    'Kebutuhan Mandi',
    'Perlengkapan Rumah',
  ];

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  // Cart Handlers
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      showToast(`Stok ${product.name} telah habis!`);
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((it) => it.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast(`Maksimum stok ${product.name} hanya ${product.stock} ${product.unit}`);
          return prev;
        }
        return prev.map((it) =>
          it.product.id === product.id
            ? {
                ...it,
                quantity: it.quantity + 1,
                subtotal: (it.quantity + 1) * it.product.sellPrice - it.discount,
              }
            : it
        );
      } else {
        return [
          ...prev,
          {
            product,
            quantity: 1,
            discount: 0,
            subtotal: product.sellPrice,
          },
        ];
      }
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((it) => it.product.id !== productId);
      }
      return prev.map((it) => {
        if (it.product.id === productId) {
          const clampedQty = Math.min(quantity, it.product.stock);
          return {
            ...it,
            quantity: clampedQty,
            subtotal: clampedQty * it.product.sellPrice - it.discount,
          };
        }
        return it;
      });
    });
  };

  const handleUpdateItemDiscount = (productId: string, discount: number) => {
    setCartItems((prev) =>
      prev.map((it) =>
        it.product.id === productId
          ? {
              ...it,
              discount,
              subtotal: Math.max(0, it.quantity * it.product.sellPrice - discount),
            }
          : it
      )
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
    setCartDiscount(0);
    setCustomerName('');
    setCustomerPhone('');
    setOrderNote('');
  };

  // Payment Execution
  const cartGross = cartItems.reduce((acc, it) => acc + it.product.sellPrice * it.quantity, 0);
  const cartItemDiscounts = cartItems.reduce((acc, it) => acc + it.discount, 0);
  const cartFinalTotal = Math.max(0, cartGross - cartItemDiscounts - cartDiscount);

  const handleConfirmPayment = (
    method: 'CASH' | 'QRIS',
    paidAmount: number,
    changeAmount: number
  ) => {
    const seq = transactions.length + 1;
    const invoiceNumber = generateInvoiceNumber(seq);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      invoiceNumber,
      createdAt: new Date().toISOString(),
      totalAmount: cartGross,
      discountAmount: cartItemDiscounts + cartDiscount,
      finalAmount: cartFinalTotal,
      paidAmount,
      changeAmount,
      paymentMethod: method,
      cashierName: storeProfile.activeCashier,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      note: orderNote.trim() || undefined,
      isVoid: false,
      items: cartItems.map((it) => ({
        productId: it.product.id,
        productCode: it.product.code,
        productName: it.product.name,
        unit: it.product.unit,
        buyPrice: it.product.buyPrice,
        sellPrice: it.product.sellPrice,
        quantity: it.quantity,
        discount: it.discount,
        subtotal: it.subtotal,
      })),
    };

    const res = executeCheckout(newTx);
    if (res.success) {
      setProducts(getStoredProducts());
      setTransactions(getStoredTransactions());
      setCompletedTransaction(newTx);
      setIsReceiptOpen(true);
      handleClearCart();
    } else {
      showToast('Gagal memproses transaksi: ' + res.error);
    }
  };

  // Void Handler
  const handleVoidTransaction = (transactionId: string) => {
    const res = executeVoidTransaction(transactionId);
    if (res.success) {
      setProducts(getStoredProducts());
      setTransactions(getStoredTransactions());
      showToast('Nota dibatalkan & stok otomatis dikembalikan ke katalog!');
    } else {
      showToast('Gagal membatalkan nota: ' + res.error);
    }
  };

  // Inventory CRUD
  const handleAddProduct = (newP: Omit<Product, 'id' | 'updatedAt'>) => {
    const p: Product = {
      ...newP,
      id: `prod-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    const updated = [p, ...products];
    setProducts(updated);
    saveStoredProducts(updated);
    showToast(`Produk "${p.name}" berhasil ditambahkan!`);
  };

  const handleUpdateProduct = (updatedP: Product) => {
    const updated = products.map((p) => (p.id === updatedP.id ? updatedP : p));
    setProducts(updated);
    saveStoredProducts(updated);
    showToast(`Produk "${updatedP.name}" berhasil diperbarui!`);
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    saveStoredProducts(updated);
    showToast('Produk berhasil dihapus dari inventaris');
  };

  const handleAdjustStock = (id: string, additional: number) => {
    const updated = products.map((p) =>
      p.id === id ? { ...p, stock: p.stock + additional, updatedAt: new Date().toISOString() } : p
    );
    setProducts(updated);
    saveStoredProducts(updated);
    showToast(`Stok berhasil ditambah +${additional}!`);
  };

  // Barcode Scanner Handler
  const handleScanSuccess = (code: string) => {
    if (scannerCallback) {
      scannerCallback(code);
      setScannerCallback(null);
      return;
    }

    const found = products.find(
      (p) => p.code.toLowerCase().trim() === code.toLowerCase().trim()
    );

    if (found) {
      handleAddToCart(found);
      showToast(`+1 ${found.name} ditambahkan ke tiket kasir`);
    } else {
      showToast(`Barcode "${code}" belum terdaftar di katalog produk.`);
    }
  };

  const handleResetData = () => {
    saveStoredProducts(INITIAL_PRODUCTS);
    saveStoredStoreProfile(DEFAULT_STORE_PROFILE);
    localStorage.removeItem('kasirpintar_transactions');
    setProducts(INITIAL_PRODUCTS);
    setTransactions([]);
    setStoreProfile(DEFAULT_STORE_PROFILE);
    handleClearCart();
    showToast('Data berhasil di-reset ke katalog demo!');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#09090B] flex flex-col font-sans text-zinc-900 dark:text-zinc-100 selection:bg-emerald-100 selection:text-emerald-950 transition-colors duration-150">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/95 dark:bg-zinc-800/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 border border-zinc-700/60 dark:border-zinc-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar with Integrated Desktop Navigation */}
      <Navbar
        storeProfile={storeProfile}
        lowStockCount={lowStockCount}
        onOpenScanner={() => {
          setScannerCallback(null);
          setIsScannerOpen(true);
        }}
        onGoToLowStock={() => setActiveTab('inventory')}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Tab View */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6 py-3 sm:py-4">
        {activeTab === 'pos' && (
          <CashierTab
            products={products}
            categories={categories}
            cartItems={cartItems}
            cartDiscount={cartDiscount}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onUpdateItemDiscount={handleUpdateItemDiscount}
            onUpdateCartDiscount={(d) => setCartDiscount(d)}
            onClearCart={handleClearCart}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            orderNote={orderNote}
            setOrderNote={setOrderNote}
            onConfirmPayment={handleConfirmPayment}
            onOpenScanner={() => {
              setScannerCallback(null);
              setIsScannerOpen(true);
            }}
            storeProfile={storeProfile}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab
            products={products}
            categories={categories}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onAdjustStock={handleAdjustStock}
            onOpenScannerForCode={(cb) => {
              setScannerCallback(() => cb);
              setIsScannerOpen(true);
            }}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab
            transactions={transactions}
            onVoidTransaction={handleVoidTransaction}
            onViewReceipt={(tx) => {
              setCompletedTransaction(tx);
              setIsReceiptOpen(true);
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            storeProfile={storeProfile}
            onUpdateStoreProfile={(p) => {
              setStoreProfile(p);
              saveStoredStoreProfile(p);
            }}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation (Only visible on mobile screens < md) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 shadow-xl md:hidden transition-colors">
        <div className="grid grid-cols-4 h-14">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex flex-col items-center justify-center space-y-0.5 transition-colors ${
              activeTab === 'pos' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="text-[10px]">Kasir</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center justify-center space-y-0.5 relative transition-colors ${
              activeTab === 'inventory' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Package className="w-4 h-4" />
            <span className="text-[10px]">Stok</span>
            {lowStockCount > 0 && (
              <span className="absolute top-1.5 right-6 w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center justify-center space-y-0.5 transition-colors ${
              activeTab === 'reports' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-[10px]">Laporan</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center space-y-0.5 transition-colors ${
              activeTab === 'settings' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-[10px]">Toko</span>
          </button>
        </div>
      </nav>

      {/* Receipt Modal (Shown on Successful Checkout or Re-print) */}
      {completedTransaction && (
        <ReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          transaction={completedTransaction}
          storeProfile={storeProfile}
          onNewTransaction={() => {
            setIsReceiptOpen(false);
            setCompletedTransaction(null);
            setActiveTab('pos');
          }}
        />
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => {
          setIsScannerOpen(false);
          setScannerCallback(null);
        }}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}
