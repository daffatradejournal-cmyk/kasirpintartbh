# ⚡ Kasir Pintar (Smart Stock & Point of Sale UMKM)

> **Aplikasi Kasir Pintar & Manajemen Inventaris Cerdas Berbasis Web & Mobile (Offline-First)**  
> Didesain khusus untuk menggantikan pembukuan manual buku nota menjadi sistem kasir digital modern, cepat, interaktif, dan handal tanpa bergantung pada kestabilan sinyal internet.

---

## 👨‍💻 Profil Pengembang & Proyek
- **Nama Aplikasi**: **Kasir Pintar**
- **Pengembang**: **Muhammad Daffa**
- **Program Studi**: S1 Sistem Informasi
- **Institusi**: Universitas Islam Indragiri (UNISI)
- **Tujuan Sistem**: Digitalisasi operasional kios pasar, toko sembako, dan warung ritel UMKM melalui sistem kasir pintar berbasis web dan smartphone dengan scan barcode kamera, kontrol stok otomatis, cetak struk thermal 58mm/80mm, serta laporan finansial (omzet & laba bersih) harian.

---

## 🚀 Akses & Uji Coba Cepat (Local Dev Server)

Aplikasi web saat ini berjalan secara lokal di komputer Anda:
👉 **[http://localhost:3000](http://localhost:3000)**

Untuk menjalankan ulang sewaktu-waktu:
```bash
npm run dev
```

---

## 🎨 Tampilan UI/UX Modern & Hidup (UI/UX Pro Max)
- **Palet Warna Segar & Berenergi**: Emerald Teal (`#059669`), Mint Cyan (`#14B8A6`), dan Warm Cream (`#FEFDF9`).
- **Ikon Visual Dinamis**: Setiap produk memiliki identitas visual ramah (🍚 Beras Ramos, 🛢️ Minyak Kita, 🥚 Telur Ayam, 🍜 Indomie, ☕ Kopi Kapal Api, 🥛 Susu, dll.).
- **Animasi Perayaan (Confetti)**: Setiap kali transaksi kasir berhasil, sistem menampilkan efek selebrasi kembang api konfeti interaktif.
- **Kertas Struk Kasir Realistis**: Dilengkapi efek gerigi tepi kertas potong (*sawtooth paper edge*).
- **Kalkulator Kasir Tactile Pad**: Tombol cepat pecahan uang pas (Rp 50.000, Rp 100.000, +10.000, dll.) dengan kalkulasi kembalian otomatis.

---

## ✨ Fitur-Fitur Utama

1. **🛒 Quick POS & Transaksi Cepat**:
   - Filter kategori berikon & live search nama / barcode barang.
   - Scan barcode langsung menggunakan kamera webcam / HP.
   - Troli belanja fleksibel dengan penyesuaian kuantitas, diskon per item, diskon nota, dan catatan pesanan.
2. **💵 Pembayaran Fleksibel**:
   - Tunai (Cash): Otomatis menghitung uang diterima dan nominal kembalian.
   - Non-Tunai (QRIS): QRIS dinamis berstandar Bank Indonesia.
3. **🧾 Cetak Struk & E-Receipt WhatsApp**:
   - Cetak struk langsung ke printer thermal mini portabel (ukuran 58mm / 80mm).
   - Kirim struk resmi berformat teks rapi langsung ke nomor WhatsApp pembeli dalam 1 klik.
4. **📦 Kontrol Stok & Alert Stok Menipis**:
   - Peringatan warna visual dinamis (Merah: Habis, Kuning: Menipis, Hijau: Aman).
   - Tombol cepat **Kulakan / Tambah Stok** tanpa perlu masuk menu edit.
   - Tambah & edit barang dengan kalkulator estimasi margin laba bersih live.
5. **📊 Analitik Penjualan & Pembatalan Nota (Void)**:
   - Rekap Omzet Kotor & Laba Bersih transparan.
   - Podium peringkat **Top 5 Best Seller**.
   - Riwayat transaksi dengan fitur **Void (Batal Nota)** yang **secara otomatis mengembalikan stok barang ke katalog**.
6. **📶 100% Offline-First**:
   - Seluruh data tersimpan di local browser storage (`localStorage`), transaksi tetap lancar meskipun internet terputus.

---

## 🌐 Cara Deploy ke Internet (Gratis)

Berkas produksi website sudah dikompilasi di folder [`dist/`](file:///c:/Users/Asus/Music/Pictures/studi%20kasus%20kedua/dist).

### Opsi A: Netlify Drop (1 Menit — Tanpa Koding)
1. Buka [https://app.netlify.com/drop](https://app.netlify.com/drop).
2. Tarik (*drag & drop*) folder **`dist`** ke halaman tersebut.
3. Website langsung aktif dan memiliki link publik gratis (contoh: `https://kasirpintar-daffa.netlify.app`).

### Opsi B: Vercel
Jalankan di terminal:
```bash
npx vercel
```
Ikuti instruksi singkat di layar untuk langsung online.
