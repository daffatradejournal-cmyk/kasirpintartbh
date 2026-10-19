import React, { useState } from 'react';
import { Product } from '../types';
import { formatRupiah } from '../utils/formatters';
import { Plus, Edit3, Trash2, TrendingUp, AlertTriangle, PackagePlus, QrCode, Boxes, DollarSign } from 'lucide-react';

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
    <div className="space-y-5 pb-24">
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Katalog & Kontrol Stok</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
              {products.length} Macam Barang
            </span>
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manajemen master data, kontrol kulakan, dan deteksi peringatan stok menipis
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/20 text-xs transition-transform active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>TAMBAH PRODUK BARU</span>
        </button>
      </div>

      {/* Mini Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Item</p>
            <p className="text-lg font-black text-gray-900 font-mono">{products.length} SKU</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nilai Modal Stok</p>
            <p className="text-lg font-black text-emerald-700 font-mono">{formatRupiah(totalAssetValue)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs col-span-2 sm:col-span-1 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Perlu Kulakan</p>
            <p className="text-lg font-black text-amber-700 font-mono">{lowStockCount} Barang</p>
          </div>
        </div>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            placeholder="Cari nama barang atau barcode kemasan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-medium"
          />

          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white font-bold text-gray-700 outline-none"
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
              className={`px-3.5 py-2 text-xs rounded-xl font-black flex items-center space-x-1.5 border transition-all ${
                filterLowStock
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Stok Menipis ({lowStockCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product List Cards */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-xs font-bold">
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
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/60 transition-colors"
                >
                  {/* Left: Avatar & Info */}
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50 text-2xl flex items-center justify-center border border-emerald-100 shadow-xs shrink-0 mt-0.5">
                      {product.emoji || '📦'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug">
                          {product.name}
                        </h4>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-800'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100/70 text-emerald-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1 ${
                              isOutOfStock
                                ? 'bg-rose-500'
                                : isLowStock
                                ? 'bg-amber-500 animate-pulse'
                                : 'bg-emerald-500'
                            }`}
                          ></span>
                          {isOutOfStock
                            ? 'Stok Habis'
                            : `Stok: ${product.stock} ${product.unit}`}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 font-mono mt-1">
                        <span>SKU: {product.code}</span>
                        <span>•</span>
                        <span>Kategori: {product.category}</span>
                        <span>•</span>
                        <span>Min Threshold: {product.minStock}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & Quick Actions */}
                  <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-2.5 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-base font-black font-mono text-gray-900">
                        {formatRupiah(product.sellPrice)}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Modal: {formatRupiah(product.buyPrice)} (Laba: +{formatRupiah(profit)})
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setRestockProduct(product);
                          setRestockQty('10');
                        }}
                        className="p-2.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all shadow-xs"
                        title="Kulakan / Tambah Stok"
                      >
                        <PackagePlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="p-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all shadow-xs"
                        title="Edit Produk"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus ${product.name} dari katalog?`)) {
                            onDeleteProduct(product.id);
                          }
                        }}
                        className="p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all shadow-xs"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <h3 className="font-extrabold text-gray-900 text-base">Kulakan / Tambah Stok Masuk</h3>
            <div className="p-3 bg-gray-50 rounded-2xl text-xs space-y-1">
              <p className="font-bold text-gray-800">{restockProduct.name}</p>
              <p className="text-gray-500">Stok saat ini: {restockProduct.stock} {restockProduct.unit}</p>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1.5">
                Jumlah Stok Masuk ({restockProduct.unit}):
              </label>
              <input
                type="number"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 border-2 border-emerald-500 rounded-2xl font-black font-mono text-xl outline-none focus:ring-4 focus:ring-emerald-500/20"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRestockProduct(null)}
                className="flex-1 py-3 text-xs font-extrabold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
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
                className="flex-1 py-3 text-xs font-black text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-600/30 transition-transform active:scale-95"
              >
                Simpan Stok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl my-4 border border-gray-100 animate-in fade-in zoom-in-95">
            <h3 className="font-extrabold text-gray-900 text-lg mb-4">
              {editingProduct ? 'Edit Master Data Produk' : 'Tambah Produk Baru'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              {/* Emoji & Name */}
              <div className="flex gap-2">
                <div className="w-16">
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Ikon:</label>
                  <input
                    type="text"
                    value={formEmoji}
                    onChange={(e) => setFormEmoji(e.target.value)}
                    className="w-full text-center py-2.5 text-lg border border-gray-300 rounded-xl outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Nama Produk:</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Beras Ramos 5kg"
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Barcode */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Barcode / SKU:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="8999999000101"
                    className="flex-1 px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl font-mono outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleScanForForm}
                    className="px-3.5 py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-extrabold flex items-center space-x-1 hover:bg-emerald-100"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Scan</span>
                  </button>
                </div>
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Kategori:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded-xl bg-white outline-none focus:border-emerald-500 font-medium"
                  >
                    {categories.filter((c) => c !== 'Semua').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Satuan:</label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded-xl bg-white outline-none focus:border-emerald-500 font-medium"
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
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Harga Beli (Modal):</label>
                  <input
                    type="number"
                    required
                    value={formBuyPrice}
                    onChange={(e) => setFormBuyPrice(e.target.value)}
                    placeholder="Rp 0"
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl font-mono font-bold outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Harga Jual:</label>
                  <input
                    type="number"
                    required
                    value={formSellPrice}
                    onChange={(e) => setFormSellPrice(e.target.value)}
                    placeholder="Rp 0"
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl font-mono font-black text-emerald-800 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Realtime Profit Margin Indicator */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl text-xs flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-emerald-900 font-bold">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Estimasi Laba Bersih:</span>
                </div>
                <span className="font-black text-emerald-950 font-mono">
                  {formatRupiah(profitMargin)} ({profitPercent.toFixed(1)}%)
                </span>
              </div>

              {/* Stock & Min Stock */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Stok Saat Ini:</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl font-mono font-bold outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Batas Minimum (Alert):</label>
                  <input
                    type="number"
                    required
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl font-mono font-bold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold rounded-xl text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-transform active:scale-95"
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
