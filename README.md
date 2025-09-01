# 🚀 Invoice Generator — Bikin Invoice Bukan Drama!

Hai! 👋
Lo pernah males bikin invoice manual di Word terus copy–paste data berkali-kali? Sama, gue juga. Makanya project ini lahir — biar bikin invoice jadi gampang, otomatis, dan ga bikin lo stress.

## ✨ Fitur-fitur yang (lumayan) kece

* 📝 Input data via form React (jadi ga perlu ribet-ribet lagi ngetik satu-satu di Word)
* 🧩 Template `.docx` custom — lo bisa pake template invoice lo sendiri
* 📄 Export ke **PDF** langsung sekali klik
* ⚡ Backend Express + Docxtemplater — biar semua proses jalan mulus
* 🛠️ Bisa ditweak sesuai kebutuhan lo

## 🎮 Cara Maininnya

1. Clone dulu repo ini ke laptop lo:

   ```bash
   git clone https://github.com/zydnn/web-invoice
   cd web-invoice
   ```
2. Install dependency (jangan lupa Node.js udah kepasang ya):

   ```bash
   npm install
   ```
3. Jalanin backend:

   ```bash
   cd src/backend
   npm run dev
   ```
4. Jalanin frontend:

   ```bash
   npm run dev
   ```
5. Buka di browser: [http://localhost:3000](http://localhost:3000)
   🎉 Done! Lo udah bisa generate invoice.

## 🛑 Catatan Penting

* Pastikan lo udah install **LibreOffice** kalau mau auto-convert `.docx` ke PDF.
* Kalau ada error aneh-aneh, coba cek dulu path LibreOffice-nya.

## 💡 Roadmap (alias “to-do list yang belum gue garap”)

* [ ] Tambahin pilihan multi-template
* [ ] Support lebih banyak format export
* [ ] Tambahin dark mode biar makin aesthetic ✨

## 👾 Kontribusi?

Mau ikutan ngoprek? Gas aja! PR welcome banget.