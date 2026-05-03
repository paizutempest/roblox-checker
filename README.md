# 🌊 Deep Ocean: Roblox Account Checker (Playwright Edition)
> **Automated Identity Verification & Security Auditing for Roblox Accounts.**
> Built for performance, stealth, and deep-sea reliability.

---

## 💎 Overview
**Deep Ocean Roblox Checker** adalah alat audit keamanan tingkat tinggi yang dirancang untuk melakukan pengecekan akun Roblox secara massal menggunakan engine **Playwright**. Dilengkapi dengan plugin **Stealth**, bot ini mampu melewati deteksi otomatis dan memberikan hasil yang akurat dengan tampilan antarmuka terminal yang mewah.

## 🚀 Main Features
*   **Humanoid Interaction**: Menggunakan sidik jari browser acak untuk menghindari deteksi bot[cite: 1].
*   **Stealth Integration**: Terintegrasi dengan `playwright-extra` dan `puppeteer-extra-plugin-stealth`[cite: 1].
*   **Resource Management**: Memblokir aset berat (gambar, media, font) untuk kecepatan maksimal di VPS[cite: 1].
*   **Deep Identity Generator**: Menggunakan profil perangkat acak (Windows, Mac, Android, iOS)[cite: 1].
*   **Luxury Debugging**: Tampilan log mewah menggunakan `chalk`, `gradient-string`, dan `table`[cite: 1].

---

## 🛠️ Tech Stack
*   **Language**: JavaScript (Node.js v24+)[cite: 1]
*   **Engine**: Playwright[cite: 1]
*   **Styling**: Chalk & Gradient-String[cite: 1]
*   **Formatting**: DayJS & Table[cite: 1]

---

## 📥 Installation

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/Paizutempest/roblox-checker.git](https://github.com/Paizutempest/roblox-checker.git)
    cd roblox-checker
    ```

2.  **Install Dependencies**
    ```bash
    npm install playwright-extra puppeteer-extra-plugin-stealth chalk gradient-string dayjs table
    ```

3.  **Setup Accounts**
    Buat file `accounts.txt` dengan format:
    ```text
    username:password
    username:password
    ```

---

## ⚙️ How to Use

### Jalankan di Lokal (Headful)
Jika ingin melihat prosesnya secara langsung:
```bash
node checker.js
