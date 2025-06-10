# SPORTAFIT Project Startup Guide

## Backend (Node.js/Express)

1. Buka terminal di folder `server/`:
   ```sh
   cd server
   npm install
   npm start
   ```
   - Pastikan backend berjalan di port **3000** (default).
   - Jika port 3000 sudah dipakai, ubah di `server/index.js` dan di `vite.config.js` (proxy target).

2. Jika menggunakan XAMPP/Apache, pastikan tidak ada konflik port dengan backend Node.js.

## Frontend (Vite + React)

1. Buka terminal di root project:
   ```sh
   npm install
   npm run dev
   ```
   - Frontend akan berjalan di port **5173** (default).

2. Semua request ke `/api` akan otomatis diteruskan ke backend (port 3000) melalui proxy Vite.

## Troubleshooting

- Jika fitur real-time (SSE) gagal, pastikan backend Node.js aktif di port 3000.
- Jika ingin mengubah port backend, update juga `vite.config.js` proxy.
- Pastikan token JWT valid dan user sudah login.

---

**Catatan:**
- Untuk pengembangan, gunakan path relatif `/api/events` di frontend agar proxy bekerja.
- Jangan gunakan URL absolut ke port 5173 untuk SSE.

---

Jika ada error, cek log terminal backend dan frontend untuk detailnya.
