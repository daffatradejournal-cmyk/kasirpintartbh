import React, { useState } from 'react';
import { StoreProfile } from '../types';
import { Save, Store, User, GraduationCap, RotateCcw, Download, Sparkles } from 'lucide-react';

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
    <div className="space-y-6 pb-24 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <span>Pengaturan & Profil Toko</span>
          <span className="p-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black">
            ⚙️ Setup
          </span>
        </h2>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Atur nama usaha, kasir aktif bertugas, dan template cetak struk belanja
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Store Profile Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-gray-100 text-emerald-900">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">Identitas Usaha / Toko</h3>
              <p className="text-[11px] text-gray-400">Dicetak di bagian atas setiap struk thermal</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-700 mb-1">Nama Toko:</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-700 mb-1">Alamat Lengkap Toko:</label>
            <textarea
              rows={2}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-700 mb-1">
              Nomor WhatsApp / Kontak Toko:
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-700 mb-1">
              Catatan Kaki Struk (Receipt Footer):
            </label>
            <textarea
              rows={2}
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-xs"
            />
          </div>
        </div>

        {/* Cashier Info Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-gray-100 text-emerald-900">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">Petugas Kasir Bertugas</h3>
              <p className="text-[11px] text-gray-400">Identitas kasir yang melayani transaksi</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-700 mb-1">Nama Kasir Aktif:</label>
            <input
              type="text"
              required
              value={activeCashier}
              onChange={(e) => setActiveCashier(e.target.value)}
              className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-bold"
            />
          </div>
        </div>

        {/* Save CTA */}
        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/30 text-sm flex items-center justify-center space-x-2 transition-transform active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>SIMPAN PENGATURAN TOKO</span>
        </button>

        {isSaved && (
          <div className="p-4 bg-emerald-100 text-emerald-900 rounded-2xl text-xs font-black text-center shadow-xs animate-in fade-in">
            ✓ Pengaturan profil toko & kasir berhasil disimpan!
          </div>
        )}
      </form>

      {/* Developer Profile Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl shadow-emerald-950/20 border border-emerald-500/30 flex items-start space-x-4">
        <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-2xl shadow-md shrink-0">
          <GraduationCap className="w-7 h-7" />
        </div>
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 mb-1">
            Pengembang Sistem Kasir Pintar
          </span>
          <h4 className="font-black text-base sm:text-lg text-white">Muhammad Daffa</h4>
          <p className="text-xs text-emerald-300 font-semibold mt-0.5">
            S1 Sistem Informasi — Universitas Islam Indragiri (UNISI)
          </p>
          <p className="text-[11px] text-gray-300 mt-2 leading-relaxed">
            Kasir Pintar dikembangkan sebagai solusi digitalisasi UMKM ritel modern, toko kelontong, dan kios pasar untuk menghadirkan sistem kasir pintar cepat berbasis web dan mobile dengan kemampuan Offline-First tanpa tergantung sinyal internet.
          </p>
        </div>
      </div>

      {/* Maintenance & Data Management */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
        <h4 className="font-black text-xs text-gray-700 uppercase tracking-wider">
          Pencadangan & Pemulihan Data (Offline Storage)
        </h4>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleExportJson}
            className="flex-1 py-3 px-4 border border-gray-200 hover:bg-gray-50 rounded-2xl text-xs font-black text-gray-700 flex items-center justify-center space-x-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-gray-500" />
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
            className="flex-1 py-3 px-4 border border-rose-200 hover:bg-rose-50 rounded-2xl text-xs font-black text-rose-700 flex items-center justify-center space-x-2 shadow-xs transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset ke Data Demo Awal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
