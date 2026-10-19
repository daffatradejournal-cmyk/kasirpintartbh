import React, { useState } from 'react';
import { StoreProfile } from '../types';
import {
  Save,
  Store,
  User,
  GraduationCap,
  RotateCcw,
  Download,
  Check,
  ShieldCheck,
  Sun,
  Moon,
  Palette,
} from 'lucide-react';

interface Props {
  storeProfile: StoreProfile;
  onUpdateStoreProfile: (profile: StoreProfile) => void;
  onResetData: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsTab: React.FC<Props> = ({
  storeProfile,
  onUpdateStoreProfile,
  onResetData,
  isDarkMode,
  onToggleDarkMode,
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
    <div className="space-y-4 pb-20">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Pengaturan & Konfigurasi Sistem
          </h2>
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            Setup
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal mt-0.5">
          Atur tema tampilan gelap/terang, identitas toko, kasir bertugas, dan pencadangan database
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Form Toko & Kasir (col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* THEME & APPEARANCE SETTING (MOVED HERE AS REQUESTED) */}
          <div className="bg-white dark:bg-[#121215] p-4 sm:p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
            <div className="flex items-center space-x-2.5 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                  Tema Tampilan Aplikasi
                </h3>
                <p className="text-[11px] text-zinc-400">Pilih mode tampilan layar antarmuka kasir</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Light Mode Option */}
              <button
                type="button"
                onClick={() => isDarkMode && onToggleDarkMode()}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between space-y-2.5 transition-all ${
                  !isDarkMode
                    ? 'border-emerald-500 bg-emerald-50/20 text-zinc-900 shadow-xs ring-1 ring-emerald-500/30'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                    <Sun className="w-4 h-4" />
                  </div>
                  {!isDarkMode && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ✓ Aktif
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-xs block text-zinc-900 dark:text-zinc-100">
                    Mode Terang (Light)
                  </span>
                  <span className="text-[11px] text-zinc-500 mt-0.5 block">
                    Latar putih bersih dengan kontras sejuk untuk operasional siang hari
                  </span>
                </div>
              </button>

              {/* Dark Mode Option */}
              <button
                type="button"
                onClick={() => !isDarkMode && onToggleDarkMode()}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between space-y-2.5 transition-all ${
                  isDarkMode
                    ? 'border-emerald-500 bg-emerald-950/20 text-zinc-100 shadow-xs ring-1 ring-emerald-500/30'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 text-emerald-400 flex items-center justify-center border border-zinc-700">
                    <Moon className="w-4 h-4" />
                  </div>
                  {isDarkMode && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                      ✓ Aktif
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-xs block text-zinc-900 dark:text-zinc-100">
                    Mode Gelap (Dark)
                  </span>
                  <span className="text-[11px] text-zinc-400 mt-0.5 block">
                    True neutral zinc hitam elegan, nyaman di mata tanpa silau
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Form Toko */}
          <form onSubmit={handleSave} className="space-y-3.5">
            {/* Toko Identity */}
            <div className="bg-white dark:bg-[#121215] p-4 sm:p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
              <div className="flex items-center space-x-2.5 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                    Identitas Toko & Kepala Struk
                  </h3>
                  <p className="text-[11px] text-zinc-400">Dicetak di bagian atas kertas struk thermal</p>
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
                  className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-lg outline-none focus:border-emerald-500 font-medium"
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
                  className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-lg outline-none focus:border-emerald-500 font-normal"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Nomor Telepon / WhatsApp:
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-lg outline-none focus:border-emerald-500 font-mono"
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
                  className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-lg outline-none focus:border-emerald-500 font-normal text-xs"
                />
              </div>
            </div>

            {/* Cashier Duty */}
            <div className="bg-white dark:bg-[#121215] p-4 sm:p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
              <div className="flex items-center space-x-2.5 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                    Petugas Kasir Bertugas
                  </h3>
                  <p className="text-[11px] text-zinc-400">Identitas kasir yang tercetak di setiap nota</p>
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
                  className="w-full px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-lg outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs shadow-xs flex items-center justify-center space-x-2 transition-colors active:scale-[0.99]"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Pengaturan</span>
            </button>

            {isSaved && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Pengaturan berhasil diperbarui dan tersimpan di browser!</span>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Developer Profile & Database Maintenance (col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Developer Card */}
          <div className="bg-white dark:bg-[#121215] rounded-xl p-5 shadow-xs border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  Pengembang Sistem
                </span>
                <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mt-0.5">
                  Muhammad Daffa
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  S1 Sistem Informasi — Universitas Islam Indragiri (UNISI)
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-1.5">
              <p>
                <strong>Kasir Pintar</strong> merupakan platform kasir cerdas dan kontrol stok inventaris ritel UMKM dengan arsitektur <em>Offline-First</em>, memungkinkan transaksi tetap berjalan cepat dan stabil meski tanpa sambungan internet.
              </p>
            </div>
          </div>

          {/* Database & Offline Storage Maintenance */}
          <div className="bg-white dark:bg-[#121215] p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Pencadangan Database Offline
              </h4>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">
              Seluruh data katalog dan transaksi tersimpan aman di browser Anda. Lakukan pencadangan berkala file JSON untuk keamanan data.
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportJson}
                className="w-full py-2.5 px-3 border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center justify-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4 text-zinc-500" />
                <span>Cadangkan Data (Backup JSON)</span>
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
                className="w-full py-2.5 px-3 border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 rounded-lg text-xs font-medium text-rose-700 dark:text-rose-400 flex items-center justify-center space-x-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-rose-500" />
                <span>Reset ke Data Demo Awal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
