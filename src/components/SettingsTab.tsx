import React, { useState } from 'react';
import { StoreProfile } from '../types';
import { Save, Store, User, GraduationCap, RotateCcw, Download, Check } from 'lucide-react';

interface Props {
  storeProfile: StoreProfile;
  onUpdateStoreProfile: (profile: StoreProfile) => void;
  onResetData: () => void;
}

export const SettingsTab: React.FC<Props> = ({
  storeProfile,
  onUpdateStoreProfile,
  onResetData,
}) => {
  const [storeName, setStoreName] = useState(storeProfile.storeName);
  const [address, setAddress] = useState(storeProfile.address);
  const [phone, setPhone] = useState(storeProfile.phone);
  const [receiptFooter, setReceiptFooter] = useState(storeProfile.receiptFooter);
  const [activeCashier, setActiveCashier] = useState(storeProfile.activeCashier);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreProfile({
      storeName: storeName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      receiptFooter: receiptFooter.trim(),
      activeCashier: activeCashier.trim(),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleExportJson = () => {
    const data = {
      profile: storeProfile,
      products: localStorage.getItem('kasirpintar_products'),
      transactions: localStorage.getItem('kasirpintar_transactions'),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KasirPintar_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Pengaturan & Profil Toko
          </h2>
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            Setup
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">
          Atur nama usaha, kasir aktif bertugas, dan template cetak struk belanja
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Store Profile Card */}
        <div className="bg-white dark:bg-[#121215] p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3.5">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <Store className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Identitas Usaha / Toko</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Dicetak di bagian kepala setiap struk thermal</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Nama Toko:
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Alamat Lengkap Toko:
            </label>
            <textarea
              rows={2}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Nomor WhatsApp / Kontak Toko:
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Catatan Kaki Struk (Receipt Footer):
            </label>
            <textarea
              rows={2}
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-normal"
            />
          </div>
        </div>

        {/* Cashier Info Card */}
        <div className="bg-white dark:bg-[#121215] p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3.5">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <User className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Petugas Kasir Bertugas</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Identitas kasir yang melayani antrean transaksi</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Nama Kasir Aktif:
            </label>
            <input
              type="text"
              required
              value={activeCashier}
              onChange={(e) => setActiveCashier(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
            />
          </div>
        </div>

        {/* Save CTA */}
        <button
          type="submit"
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs shadow-xs flex items-center justify-center space-x-2 transition-colors active:scale-[0.99]"
        >
          <Save className="w-4 h-4 stroke-[2]" />
          <span>Simpan Perubahan Pengaturan</span>
        </button>

        {isSaved && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Pengaturan profil toko & kasir berhasil disimpan!</span>
          </div>
        )}
      </form>

      {/* Developer Profile Banner */}
      <div className="bg-white dark:bg-[#121215] rounded-xl p-5 shadow-xs border border-zinc-200/80 dark:border-zinc-800/80 flex items-start space-x-3.5">
        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 stroke-[2]" />
        </div>
        <div className="space-y-1">
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            Pengembang Sistem Kasir Pintar
          </span>
          <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
            Muhammad Daffa
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
            S1 Sistem Informasi — Universitas Islam Indragiri (UNISI)
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 pt-1 leading-relaxed">
            Kasir Pintar dirancang sebagai solusi kasir modern & kontrol inventaris cerdas untuk toko kelontong, kios pasar, dan pelaku UMKM ritel dengan kapabilitas Offline-First tanpa ketergantungan sinyal internet.
          </p>
        </div>
      </div>

      {/* Maintenance & Data Management */}
      <div className="bg-white dark:bg-[#121215] p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
        <h4 className="font-semibold text-xs text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          Penyimpanan & Pencadangan Data
        </h4>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            type="button"
            onClick={handleExportJson}
            className="flex-1 py-2.5 px-3.5 border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center justify-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4 text-zinc-500" />
            <span>Cadangkan Data (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  'Yakin ingin me-reset seluruh data kembali ke katalog sembako awal dan membersihkan riwayat transaksi?'
                )
              ) {
                onResetData();
              }
            }}
            className="flex-1 py-2.5 px-3.5 border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg text-xs font-medium text-rose-700 dark:text-rose-400 flex items-center justify-center space-x-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-rose-500" />
            <span>Reset Data ke Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
