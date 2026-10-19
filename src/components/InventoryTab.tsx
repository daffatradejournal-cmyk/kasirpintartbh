import React, { useState } from 'react';
import { Product } from '../types';
import { formatRupiah } from '../utils/formatters';
import {
  Plus,
  Edit3,
  Trash2,
  TrendingUp,
  AlertTriangle,
  PackagePlus,
  QrCode,
  Boxes,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';

interface Props {
  products: Product[];
  categories: string[];
  onAddProduct: (product: Omit<Product, 'id' | 'updatedAt'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAdjustStock: (id: string, additionalQty: number) => void;
  onOpenScannerForCode: (callback: (code: string) => void) => void;
}

export const InventoryTab: React.FC<Props> = ({
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAdjustStock,
  onOpenScannerForCode,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('Semua');
  const [filterLowStock, setFilterLowStock] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<string>('10');

  // Form state
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Sembako & Beras');
  const [formUnit, setFormUnit] = useState('Pcs');
  const [formBuyPrice, setFormBuyPrice] = useState('');
  const [formSellPrice, setFormSellPrice] = useState('');
  const [formStock, setFormStock] = useState('10');
  const [formMinStock, setFormMinStock] = useState('5');
  const [formEmoji, setFormEmoji] = useState('📦');

  const filtered = products.filter((p) => {
    if (filterCategory !== 'Semua' && p.category !== filterCategory) return false;
    if (filterLowStock && p.stock > p.minStock) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    }
    return true;
  });

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const totalAssetValue = products.reduce((acc, p) => acc + p.buyPrice * p.stock, 0);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormCode(Date.now().toString().slice(-8));
    setFormName('');
    setFormCategory('Sembako & Beras');
    setFormUnit('Pcs');
    setFormBuyPrice('');
    setFormSellPrice('');
    setFormStock('10');
    setFormMinStock('5');
    setFormEmoji('📦');
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormCode(p.code);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormUnit(p.unit);
    setFormBuyPrice(p.buyPrice.toString());
    setFormSellPrice(p.sellPrice.toString());
    setFormStock(p.stock.toString());
    setFormMinStock(p.minStock.toString());
    setFormEmoji(p.emoji || '📦');
    setIsAddEditOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const buy = parseFloat(formBuyPrice) || 0;
    const sell = parseFloat(formSellPrice) || 0;
    const stock = parseFloat(formStock) || 0;
    const minStock = parseFloat(formMinStock) || 5;

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        code: formCode.trim(),
        name: formName.trim(),
        category: formCategory,
        unit: formUnit,
        buyPrice: buy,
        sellPrice: sell,
        stock,
        minStock,
        emoji: formEmoji,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onAddProduct({
        code: formCode.trim(),
        name: formName.trim(),
        category: formCategory,
        unit: formUnit,
        buyPrice: buy,
        sellPrice: sell,
        stock,
        minStock,
        emoji: formEmoji,
      });
    }
    setIsAddEditOpen(false);
  };

  const handleScanForForm = () => {
    onOpenScannerForCode((code) => {
      setFormCode(code);
    });
  };

  const buyNum = parseFloat(formBuyPrice) || 0;
  const sellNum = parseFloat(formSellPrice) || 0;
  const profitMargin = sellNum - buyNum;
  const profitPercent = buyNum > 0 ? ((sellNum - buyNum) / buyNum) * 100 : 0;

  return (
    <div className="space-y-6 pb-24">
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Katalog & Kontrol Stok
            </h2>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              {products.length} SKU
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">
            Manajemen master data, kontrol kulakan, dan deteksi peringatan stok menipis
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs shadow-xs transition-colors active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Produk</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#121215] p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Item
            </p>
            <p className="text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {products.length} <span className="text-xs font-normal text-zinc-500">SKU</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 flex items-center justify-center">
            <Boxes className="w-5 h-5 stroke-[1.75]" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#121215] p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Nilai Modal Stok
            </p>
            <p className="text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {formatRupiah(totalAssetValue)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5 stroke-[1.75]" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#121215] p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Perlu Kulakan
            </p>
            <p className="text-xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
              {lowStockCount} <span className="text-xs font-normal text-zinc-500">Barang</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 stroke-[1.75]" />
          </div>
        </div>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="bg-white dark:bg-[#121215] p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari nama barang atau barcode SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 rounded-lg outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-900 transition-colors font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700/80 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/60 font-medium text-zinc-700 dark:text-zinc-200 outline-none focus:border-emerald-500 transition-colors"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setFilterLowStock(!filterLowStock)}
              className={`px-3 py-2 text-xs rounded-lg font-medium flex items-center space-x-1.5 border transition-all ${
                filterLowStock
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Stok Menipis ({lowStockCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product List Cards */}
      <div className="bg-white dark:bg-[#121215] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 dark:text-zinc-500 text-xs font-medium">
              Tidak ada produk yang sesuai dengan filter pencarian.
            </div>
          ) : (
            filtered.map((product) => {
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= product.minStock;
              const profit = product.sellPrice - product.buyPrice;

              return (
                <div
                  key={product.id}
                  className="p-4 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  {/* Left: Info */}
                  <div className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 flex items-center justify-center border border-zinc-200/60 dark:border-zinc-700/60 shrink-0 mt-0.5">
                      <Package className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm leading-snug">
                          {product.name}
                        </h4>
                        <span
                          className={`text-[10px] font-medium font-mono px-2 py-0.5 rounded-md inline-flex items-center gap-1.5 border ${
                            isOutOfStock
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
                              : isLowStock
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          />
                          {isOutOfStock
                            ? 'Stok Habis'
                            : `Stok: ${product.stock} ${product.unit}`}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono mt-1">
                        <span>SKU: {product.code}</span>
                        <span>•</span>
                        <span>{product.category}</span>
                        <span>•</span>
                        <span>Min: {product.minStock} {product.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & Quick Actions */}
                  <div className="flex items-center justify-between sm:justify-end space-x-5 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-zinc-100 dark:border-zinc-800">
                    <div className="text-left sm:text-right">
                      <p className="text-sm sm:text-base font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                        {formatRupiah(product.sellPrice)}
                      </p>
                      <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                        Beli: {formatRupiah(product.buyPrice)} • Laba: +{formatRupiah(profit)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setRestockProduct(product);
                          setRestockQty('10');
                        }}
                        className="p-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors border border-emerald-200/50 dark:border-emerald-900/50"
                        title="Kulakan / Tambah Stok"
                      >
                        <PackagePlus className="w-4 h-4 stroke-[2]" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="p-2 text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-200/60 dark:border-zinc-700/60"
                        title="Edit Produk"
                      >
                        <Edit3 className="w-4 h-4 stroke-[2]" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus ${product.name} dari katalog?`)) {
                            onDeleteProduct(product.id);
                          }
                        }}
                        className="p-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg transition-colors border border-rose-200/50 dark:border-rose-900/50"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-4 h-4 stroke-[2]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Restock Modal */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#121215] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95">
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">Kulakan / Tambah Stok Masuk</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Input jumlah barang baru yang masuk ke gudang</p>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/60 dark:border-zinc-800 text-xs space-y-1">
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">{restockProduct.name}</p>
              <p className="font-mono text-zinc-500 dark:text-zinc-400">
                Stok saat ini: {restockProduct.stock} {restockProduct.unit}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Jumlah Stok Masuk ({restockProduct.unit}):
              </label>
              <input
                type="number"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                autoFocus
                className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-xl font-mono font-bold text-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRestockProduct(null)}
                className="flex-1 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const add = parseFloat(restockQty) || 0;
                  if (add > 0) {
                    onAdjustStock(restockProduct.id, add);
                    setRestockProduct(null);
                  }
                }}
                className="flex-1 py-2.5 text-xs font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 shadow-xs transition-colors"
              >
                Simpan Stok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#121215] rounded-2xl max-w-md w-full p-6 shadow-2xl my-4 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base mb-4">
              {editingProduct ? 'Edit Master Data Produk' : 'Tambah Produk Baru'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Nama Produk:
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Beras Ramos 5kg"
                  className="w-full px-3.5 py-2 text-xs border border-zinc-300 dark:border-zinc-700/80 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                />
              </div>

              {/* Barcode */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Barcode / SKU:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="8999999000101"
                    className="flex-1 px-3.5 py-2 text-xs border border-zinc-300 dark:border-zinc-700/80 rounded-xl font-mono outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  />
                  <button
                    type="button"
                    onClick={handleScanForForm}
                    className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-medium flex items-center space-x-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Scan</span>
                  </button>
                </div>
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Kategori:
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700/80 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500 font-medium"
                  >
                    {categories.filter((c) => c !== 'Semua').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Satuan:
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700/80 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Kg">Kg</option>
                    <option value="Sak">Sak</option>
                    <option value="Bungkus">Bungkus</option>
                    <option value="Renteng">Renteng</option>
                    <option value="Pouch">Pouch</option>
                    <option value="Papan">Papan</option>
                    <option value="Dus">Dus</option>
                    <option value="Pack">Pack</option>
                    <option value="Kaleng">Kaleng</option>
                  </select>
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Harga Modal (Beli):
                  </label>
                  <input
                    type="number"
                    required
                    value={formBuyPrice}
                    onChange={(e) => setFormBuyPrice(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2 text-xs border border-zinc-300 dark:border-zinc-700/80 rounded-xl font-mono font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Harga Jual:
                  </label>
                  <input
                    type="number"
                    required
                    value={formSellPrice}
                    onChange={(e) => setFormSellPrice(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2 text-xs border border-zinc-300 dark:border-zinc-700/80 rounded-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-zinc-900"
                  />
                </div>
              </div>

              {/* Realtime Profit Margin Indicator */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-xl text-xs flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>Estimasi Margin Laba:</span>
                </div>
                <span className="font-mono font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {formatRupiah(profitMargin)} ({profitPercent.toFixed(1)}%)
                </span>
              </div>

              {/* Stock & Min Stock */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Stok Saat Ini:
                  </label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-zinc-300 dark:border-zinc-700/80 rounded-xl font-mono font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Batas Minimum:
                  </label>
                  <input
                    type="number"
                    required
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-zinc-300 dark:border-zinc-700/80 rounded-xl font-mono font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs shadow-xs transition-colors"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
