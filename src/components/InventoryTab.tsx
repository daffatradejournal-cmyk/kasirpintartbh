import React, { useState, useMemo } from 'react';
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
  Search,
  CheckCircle2,
  AlertCircle,
  X,
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

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filterCategory !== 'Semua' && p.category !== filterCategory) return false;
      if (filterLowStock && p.stock > p.minStock) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, filterCategory, filterLowStock, search]);

  const lowStockCount = useMemo(() => products.filter((p) => p.stock <= p.minStock).length, [products]);
  const totalAssetValue = useMemo(() => products.reduce((acc, p) => acc + p.buyPrice * p.stock, 0), [products]);

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
    <div className="space-y-4 pb-20">
      {/* Top Header & Fast KPI Cards */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Manajemen Stok & Master Data
            </h2>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              {products.length} SKU
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">
            Kontrol stok gudang, modal kulakan, dan peringatan restock barang kritis
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#121215] p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Variasi Barang
            </p>
            <p className="text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {products.length} <span className="text-xs font-normal text-zinc-500">SKU</span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
            <Boxes className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#121215] p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Nilai Modal Inventaris
            </p>
            <p className="text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {formatRupiah(totalAssetValue)}
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#121215] p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Perlu Kulakan Segera
            </p>
            <p className="text-xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
              {lowStockCount} <span className="text-xs font-normal text-zinc-500">Barang</span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-[#121215] p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari nama barang atau barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 rounded-lg outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 text-xs border border-zinc-200 dark:border-zinc-700/80 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 outline-none"
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
            className={`px-3 py-1.5 text-xs rounded-lg font-medium flex items-center space-x-1.5 border transition-all ${
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

      {/* Main Inventory Data Table (High Density & Beautiful) */}
      <div className="bg-white dark:bg-[#121215] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 dark:text-zinc-500 text-xs font-medium">
            Tidak ada produk yang cocok dengan pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 text-zinc-500 dark:text-zinc-400 font-mono text-[11px] uppercase">
                  <th className="py-3 px-4 font-semibold">Produk & SKU</th>
                  <th className="py-3 px-4 font-semibold">Kategori</th>
                  <th className="py-3 px-4 font-semibold">Stok Tersedia</th>
                  <th className="py-3 px-4 font-semibold text-right">Modal (Beli)</th>
                  <th className="py-3 px-4 font-semibold text-right">Harga Jual</th>
                  <th className="py-3 px-4 font-semibold text-right">Margin Laba</th>
                  <th className="py-3 px-4 font-semibold text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                {filtered.map((product) => {
                  const isOutOfStock = product.stock <= 0;
                  const isLowStock = product.stock > 0 && product.stock <= product.minStock;
                  const profit = product.sellPrice - product.buyPrice;
                  const profitPct = product.buyPrice > 0 ? (profit / product.buyPrice) * 100 : 0;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 stroke-[1.75]" />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
                              {product.name}
                            </p>
                            <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                              SKU: {product.code}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-300 font-medium">
                        {product.category}
                      </td>

                      {/* Stock & Status Pill */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[11px] font-medium border ${
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
                            {isOutOfStock ? 'Habis (0)' : `${product.stock} ${product.unit}`}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            Min: {product.minStock}
                          </span>
                        </div>
                      </td>

                      {/* Buy Price */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-zinc-600 dark:text-zinc-300">
                        {formatRupiah(product.buyPrice)}
                      </td>

                      {/* Sell Price */}
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                        {formatRupiah(product.sellPrice)}
                      </td>

                      {/* Profit */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          +{formatRupiah(profit)}
                        </span>
                        <span className="text-[10px] text-zinc-400 block">
                          ({profitPct.toFixed(0)}%)
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => {
                              setRestockProduct(product);
                              setRestockQty('10');
                            }}
                            className="p-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-md transition-colors"
                            title="Kulakan / Tambah Stok"
                          >
                            <PackagePlus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
                            title="Edit Data Produk"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus "${product.name}" dari katalog?`)) {
                                onDeleteProduct(product.id);
                              }
                            }}
                            className="p-1.5 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-md transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Restock Modal */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#121215] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95">
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                Kulakan / Tambah Stok Masuk
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">Input jumlah barang baru yang masuk ke toko</p>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800 text-xs">
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">{restockProduct.name}</p>
              <p className="font-mono text-zinc-500 mt-0.5">
                Stok saat ini: {restockProduct.stock} {restockProduct.unit}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Jumlah Tambahan ({restockProduct.unit}):
              </label>
              <input
                type="number"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl font-mono font-bold text-lg outline-none focus:border-emerald-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {['5', '10', '20', '50'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setRestockQty(q)}
                    className="py-1 text-xs font-mono bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300"
                  >
                    +{q}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRestockProduct(null)}
                className="flex-1 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl"
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
                className="flex-1 py-2 text-xs font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-500"
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
          <div className="bg-white dark:bg-[#121215] rounded-2xl max-w-md w-full p-5 shadow-2xl my-4 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-3">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                {editingProduct ? 'Edit Master Data Produk' : 'Tambah Produk Baru'}
              </h3>
              <button
                onClick={() => setIsAddEditOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
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
                  className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none focus:border-emerald-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium"
                />
              </div>

              {/* Barcode SKU */}
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
                    className="flex-1 px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg font-mono outline-none focus:border-emerald-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  />
                  <button
                    type="button"
                    onClick={handleScanForForm}
                    className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium flex items-center space-x-1"
                  >
                    <QrCode className="w-3.5 h-3.5" />
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
                    className="w-full px-2.5 py-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none"
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
                    className="w-full px-2.5 py-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none"
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
                    Harga Modal:
                  </label>
                  <input
                    type="number"
                    required
                    value={formBuyPrice}
                    onChange={(e) => setFormBuyPrice(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg font-mono outline-none focus:border-emerald-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
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
                    className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 outline-none focus:border-emerald-500 bg-white dark:bg-zinc-900"
                  />
                </div>
              </div>

              {/* Realtime Margin Indicator */}
              <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs flex justify-between items-center font-mono">
                <span className="text-zinc-500">Estimasi Laba per Satuan:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {formatRupiah(profitMargin)} ({profitPercent.toFixed(1)}%)
                </span>
              </div>

              {/* Stock and Min Stock */}
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
                    className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg font-mono outline-none focus:border-emerald-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
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
                    className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg font-mono outline-none focus:border-emerald-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs"
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
