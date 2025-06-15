# Panduan Konfigurasi OAuth untuk Aplikasi Lokal

Dokumen ini menjelaskan cara mengatur OAuth (Google, Facebook, Twitter) untuk aplikasi yang berjalan di server lokal.

## Langkah-langkah Umum

1. Daftar aplikasi di konsol developer masing-masing platform
2. Dapatkan Client ID dan Client Secret
3. Konfigurasi Callback URL
4. Tambahkan kredensial ke file `.env`

## Google OAuth

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Buka "APIs & Services" > "Credentials"
4. Klik "Create Credentials" > "OAuth client ID"
5. Pilih "Web application" sebagai Application type
6. Tambahkan "http://uas.sekai.id:3000/api/auth/google/callback" sebagai Authorized redirect URI
7. Klik "Create"
8. Salin Client ID dan Client Secret ke file `.env`:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

## Facebook OAuth

1. Buka [Facebook Developers](https://developers.facebook.com/)
2. Buat aplikasi baru atau pilih aplikasi yang sudah ada
3. Buka "Settings" > "Basic"
4. Salin App ID dan App Secret
5. Buka "Facebook Login" > "Settings"
6. Tambahkan "http://uas.sekai.id:3000/api/auth/facebook/callback" sebagai Valid OAuth Redirect URI
7. Simpan perubahan
8. Salin App ID dan App Secret ke file `.env`:
   ```
   FACEBOOK_APP_ID=your-app-id
   FACEBOOK_APP_SECRET=your-app-secret
   ```

## Twitter OAuth

1. Buka [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Buat project dan aplikasi baru atau pilih yang sudah ada
3. Buka "Settings" > "Edit" di bagian "User authentication settings"
4. Aktifkan "OAuth 1.0a"
5. Tambahkan "http://uas.sekai.id:3000/api/auth/twitter/callback" sebagai Callback URI
6. Simpan perubahan
7. Salin API Key (Consumer Key) dan API Secret (Consumer Secret) ke file `.env`:
   ```
   TWITTER_CONSUMER_KEY=your-consumer-key
   TWITTER_CONSUMER_SECRET=your-consumer-secret
   ```

## Catatan Penting

- Untuk pengembangan lokal, Anda perlu menggunakan URL dengan domain `localhost` sebagai callback URL.
- Beberapa platform OAuth mungkin memerlukan verifikasi domain untuk fitur tertentu, tetapi biasanya fitur dasar tetap berfungsi untuk pengembangan lokal.
- Jika menggunakan port selain 3000, sesuaikan callback URL di konsol developer dan di kode aplikasi.

## Troubleshooting

1. **Error "redirect_uri_mismatch"**: Pastikan callback URL di konsol developer persis sama dengan yang digunakan di aplikasi.
2. **Error "invalid_client"**: Pastikan Client ID dan Client Secret sudah benar.
3. **Error "access_denied"**: Pengguna mungkin menolak izin atau ada masalah dengan scope yang diminta.

## Pengujian

Untuk menguji login sosial:

1. Jalankan server backend: `cd server && npm run dev`
2. Jalankan aplikasi frontend: `npm run dev`
3. Buka aplikasi di browser dan klik tombol login sosial
4. Anda akan diarahkan ke halaman login platform yang dipilih
5. Setelah login berhasil, Anda akan diarahkan kembali ke aplikasi
