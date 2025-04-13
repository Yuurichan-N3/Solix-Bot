# 🌟 Solix Bot - Automated Tasks

**Solix Bot** adalah skrip otomatisasi berbasis Node.js untuk mengelola tugas di akun SolixDePin. Bot ini dirancang untuk membantu pengguna menyelesaikan tugas harian, mengklaim poin, dan memantau kualitas koneksi serta total poin dengan cara yang efisien dan user-friendly. Dengan fitur seperti progress bar, tabel ringkasan, dan output berwarna, bot ini cocok untuk pengguna yang ingin mengotomatisasi aktivitas mereka di SolixDePin.

## 🎯 Fitur Utama
- **Otomatisasi Tugas**: Menyelesaikan dan mengklaim tugas pending di SolixDePin secara otomatis.
- **Pemantauan Poin**: Menampilkan ringkasan poin (total poin, poin harian, bonus, dll.) dalam format tabel.
- **Pengecekan Koneksi**: Memantau kualitas koneksi secara berkala.
- **Tampilan Interaktif**:
  - Banner dengan efek gradasi warna menggunakan `gradient-string`.
  - Progress bar untuk login dan eksekusi tugas menggunakan `cli-progress`.
  - Output berwarna dengan `colors` untuk memudahkan debugging.
- **Error Handling**: Otomatis mencoba ulang login jika token kadaluarsa, dengan pesan error yang jelas.
- **Looping**: Bot berjalan terus-menerus dengan jeda waktu untuk memantau dan menjalankan tugas.

## 🛠️ Prasyarat
Sebelum menggunakan Solix Bot, pastikan kamu memiliki:
- **Node.js** (versi 14 atau lebih baru) dan **npm** terinstall. Download dari [nodejs.org](https://nodejs.org).
- Akun SolixDePin dengan kredensial (email dan password).
- Koneksi internet stabil.
- Terminal (seperti Termux, PowerShell, atau Git Bash).

## 📦 Instalasi
Ikuti langkah-langkah berikut untuk mengatur dan menjalankan Solix Bot:

1. **Clone atau Download Repository**:
   Clone repository ini ke komputer kamu:
   ```bash
   git clone https://github.com/Yuurichan-N3/Solix-bot.git
   cd solix-bot
   ```

2. **Install Dependensi**:
   Jalankan perintah berikut untuk menginstall semua module yang dibutuhkan:
   ```bash
   npm i
   ```
   Module yang akan diinstall:
   - `axios`: Untuk membuat request HTTP ke API SolixDePin.
   - `colors`: Untuk output berwarna di console.
   - `cli-progress`: Untuk menampilkan progress bar.
   - `cli-table3`: Dependensi tambahan (meskipun tidak digunakan di kode terbaru).
   - `gradient-string`: Untuk efek gradasi pada banner.

3. **Siapkan File Kredensial**:
   Buat file bernama `data.txt` di folder proyek dengan format berikut:
   ```
   email|password
   ```
   Contoh:
   ```
   user@example.com|mypassword123
   ```
   Pastikan tidak ada spasi tambahan di sekitar tanda `|`.

## 🚀 Cara Menggunakan
1. **Jalankan Bot**:
   Setelah semua dependensi terinstall dan file `data.txt` siap, jalankan bot dengan perintah:
   ```bash
   node bot.js
   ```

2. **Apa yang Akan Terjadi**:
   - Bot akan menampilkan banner dengan gradasi warna.
   - Bot akan mencoba login menggunakan kredensial dari `data.txt`. Progress bar akan muncul selama proses login.
   - Jika ada tugas pending, bot akan menjalankan dan mengklaim tugas tersebut dengan progress bar.
   - Bot akan memantau kualitas koneksi dan menampilkan ringkasan poin secara berkala.
   - Jika terjadi error (misalnya token kadaluarsa), bot akan mencoba login ulang otomatis.

3. **Hentikan Bot**:
   Untuk menghentikan bot, tekan `Ctrl + C` di terminal.

## 📊 Contoh Output
Berikut adalah contoh output yang akan kamu lihat saat menjalankan bot:

```
╔══════════════════════════════════════════════╗
║       🌟 SOLIX BOT - Automated Tasks         ║
║   Automate your SolixDePin account tasks!    ║
║  Developed by: https://t.me/sentineldiscus   ║
╚══════════════════════════════════════════════╝

Logging in |██████████| 100%
Successfully logged in with user@example.com
Executing pending tasks...
Processing Tasks |██████████| 100%
Successfully completed task: Daily Check-in (50 points)
Successfully claimed task: Daily Check-in

Connection Quality: good

=== Points Summary ===
┌─────────────┬──────────────┐
│ Metric      │ Value        │
├─────────────┼──────────────┤
│ Total Points│ 1000.00      │
│ Total Earned│ 950.00       │
│ Bonus Points│ 50.00        │
│ ...         │ ...          │
└─────────────┴──────────────┘
=====================
```

## ⚠️ Catatan Penting
- **Lebar Terminal**: Jika banner atau tabel terlihat berantakan, pastikan terminal kamu cukup lebar (minimal 50 karakter). Di Termux, coba putar layar ke mode landscape.
- **Encoding**: Pastikan terminal mendukung UTF-8 untuk menampilkan karakter ASCII art dengan baik.
- **Koneksi Internet**: Bot membutuhkan koneksi stabil untuk mengakses API SolixDePin.
- **Debugging**: Jika bot gagal, cek pesan error di console (ditampilkan dengan warna merah) untuk petunjuk.

## 🐛 Debugging
Jika bot tidak berjalan seperti yang diharapkan:
- **Error "File data.txt not found"**: Pastikan file `data.txt` ada di folder proyek.
- **Error "Invalid data.txt format"**: Cek format file `data.txt` (harus `email|password`).
- **Gagal Login**: Pastikan email dan password di `data.txt` benar, atau cek apakah server SolixDePin sedang down.
- **Banner Berantakan**: Coba jalankan di terminal lain (seperti PowerShell atau Git Bash) atau nonaktifkan efek `gradient-string` dengan mengganti `gradient.pastel.multiline(banner)` menjadi `banner`.

## 📜 Lisensi
Script ini didistribusikan untuk keperluan pembelajaran dan pengujian. Penggunaan di luar tanggung jawab pengembang.

Untuk update terbaru, bergabunglah di grup **Telegram**: [Klik di sini](https://t.me/sentineldiscus).

## 💡 Disclaimer
Penggunaan bot ini sepenuhnya tanggung jawab pengguna. Kami tidak bertanggung jawab atas penyalahgunaan skrip ini.
