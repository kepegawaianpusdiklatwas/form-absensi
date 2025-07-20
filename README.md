# Aplikasi Rekap Cuti Pegawai PNS

**Sistem Rekap dan Analisis Cuti Komprehensif untuk Pegawai Negeri Sipil (PNS) Pusdiklatwas BPKP**

Aplikasi ini berfungsi untuk **MEREKAP, MENGANALISIS, dan MELAPORKAN** data cuti pegawai yang sudah ada, bukan untuk input data baru. Data cuti diimport dari file Excel yang sudah berisi riwayat pengambilan cuti.
## Fitur Utama

### **FUNGSI UTAMA: REKAP DATA CUTI**
Aplikasi ini menganalisis data cuti yang sudah ada dalam file Excel dan memberikan:
- **Rekap statistik** penggunaan cuti per pegawai dan per jenis cuti
- **Analisis pelanggaran** seperti cuti sakit berlebihan yang perlu potongan gaji
- **Monitoring kelayakan** cuti besar berdasarkan masa kerja
- **Laporan komprehensif** dalam berbagai format (PDF, Excel, CSV)
- **Visualisasi data** melalui grafik dan dashboard interaktif
### 1. **Dashboard Komprehensif**
- **Rekap statistik** total pegawai dan penggunaan cuti dari data Excel
- **Grafik analisis** tren penggunaan cuti per bulan
- **Visualisasi distribusi** jenis cuti yang sudah diambil
- **Alert pegawai** yang perlu perhatian khusus (cuti berlebihan, dll.)

### 2. **Manajemen Cuti Tahunan**
- **Rekap hak cuti** berdasarkan masa kerja dari data pegawai
- **Analisis penggunaan** saldo awal, hak cuti, dan sisa cuti
- **Tampilan riwayat** pengambilan cuti yang sudah ada
- **Status monitoring** (Normal, Hampir Habis, Habis) berdasarkan data

### 3. **Monitoring Cuti Sakit**
- **Rekap total** hari cuti sakit per pegawai dari data Excel
- **Perhitungan otomatis** potongan gaji untuk cuti berlebihan
- **Identifikasi pelanggaran** batas normal 14 hari
- **Kalkulasi potongan** bertingkat (50% dan 100%) sesuai aturan PNS

### 4. **Kelayakan Cuti Besar**
- **Analisis kelayakan** berdasarkan masa kerja (setiap 6 tahun)
- **Rekap riwayat** pengambilan cuti besar yang sudah ada
- **Prediksi kelayakan** tahun berikutnya
- **Monitoring durasi** standar 3 bulan (90 hari)

### 5. **Cuti Melahirkan**
- **Rekap khusus** untuk pegawai wanita dari data Excel
- **Analisis durasi** standar 3 bulan (90 hari)
- **Monitoring periode** cuti dan status yang sudah ada
- **Validasi distribusi** waktu sebelum dan sesudah melahirkan

### 6. **Cuti Alasan Penting**
- **Rekap penggunaan** dengan batas maksimal 30 hari per tahun
- **Monitoring sisa hak** berdasarkan data yang sudah ada
- **Analisis alasan** pengambilan cuti dari riwayat
- **Alert peringatan** jika mendekati batas maksimal

### 7. **Import Data Excel untuk Rekap**
- **Import data cuti** dari file Excel (.xlsx/.xls) yang sudah ada
- **Template Excel** untuk menyiapkan data yang akan direkap
- **Validasi format** dan ukuran file saat import
- **Progress indicator** saat memproses data untuk rekap
- **Analisis otomatis** setelah data berhasil diimport

### 8. **Sistem Pelaporan dan Analisis**
- **Export rekap** ke berbagai format (Excel, PDF, CSV)
- **Laporan analisis** per jenis cuti atau komprehensif
- **Template laporan** yang dapat disesuaikan untuk keperluan rekap
- **Timestamp otomatis** pada setiap laporan rekap

## Aturan Cuti Sesuai Peraturan PNS

### Cuti Tahunan
- **< 5 tahun masa kerja**: 12 hari
- **5-10 tahun masa kerja**: 15 hari  
- **10-20 tahun masa kerja**: 18 hari
- **> 20 tahun masa kerja**: 21 hari

### Cuti Sakit
- **0-14 hari**: Tanpa potongan gaji
- **15-44 hari**: Potongan 50% gaji
- **45+ hari**: Potongan 100% gaji

### Cuti Besar
- **Kelayakan**: Setiap 6 tahun masa kerja
- **Durasi**: 3 bulan (90 hari)
- **Gaji**: Tetap penuh selama cuti

### Cuti Melahirkan
- **Durasi**: 3 bulan (90 hari)
- **Distribusi**: Maksimal 1,5 bulan sebelum dan 1,5 bulan sesudah melahirkan
- **Gaji**: Tetap penuh selama cuti

### Cuti Alasan Penting
- **Batas**: Maksimal 30 hari per tahun
- **Syarat**: Persetujuan atasan dan bukti pendukung
- **Tidak dapat**: Ditunda atau diakumulasi ke tahun berikutnya

## Teknologi yang Digunakan

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Charts**: Chart.js untuk visualisasi data
- **Excel Processing**: SheetJS (xlsx) untuk import/export
- **PDF Generation**: jsPDF untuk laporan PDF
- **Icons**: Font Awesome
- **Animations**: Animate.css

## Struktur File

```
├── index.html              # Halaman utama aplikasi
├── styles/
│   └── main.css           # Stylesheet utama
├── js/
│   ├── app.js             # Aplikasi utama dan logika bisnis
│   ├── upload.js          # Manajemen upload dan import Excel
│   ├── cuti-calculator.js # Kalkulator aturan cuti PNS
│   ├── reports.js         # Generator laporan multi-format
│   └── charts.js          # Manajemen visualisasi data
├── package.json           # Konfigurasi proyek
└── README.md             # Dokumentasi
```

## Cara Penggunaan

### 1. Import Data untuk Rekap
1. Klik tab **"Import Data Excel"**
2. Siapkan file Excel yang berisi data cuti pegawai yang sudah ada
3. Import file Excel ke aplikasi
4. Sistem akan memproses dan menganalisis data untuk rekap
5. Dashboard akan menampilkan hasil rekap dan analisis

### 2. Melihat Hasil Rekap
1. Gunakan tab **"Rekap Cuti [Jenis]"** untuk melihat analisis per jenis cuti
2. Gunakan fitur pencarian untuk menemukan pegawai tertentu dalam rekap
3. Klik **"Detail"** untuk melihat riwayat lengkap dan analisis mendalam
4. Lihat status dan alert untuk pegawai yang perlu perhatian

### 3. Generate Laporan Rekap
1. Klik tab **"Laporan & Analisis"**
2. Pilih jenis laporan rekap (semua atau spesifik)
3. Pilih format output laporan (PDF, Excel, CSV)
4. Klik **"Generate Laporan"** untuk membuat laporan rekap
5. File laporan akan otomatis terunduh

## Format Template Excel

Template Excel terdiri dari 6 sheet untuk data cuti yang akan direkap:

1. **Pegawai** (atau Sheet1/Data): Data dasar pegawai untuk rekap
   - Kolom wajib: Nama, NIP, Golongan, Jabatan, Tanggal_Masuk, Jenis_Kelamin
   - Format fleksibel: NAMA/nama, nip/NIP, golongan/GOLONGAN, dll.

2. **Cuti_Tahunan** (atau CutiTahunan/Sheet2): Data cuti tahunan yang sudah diambil
   - Kolom: NIP, Tahun, Saldo_Awal, Hak_Cuti, Diambil, Sisa, Riwayat
   - Berisi data cuti tahunan yang sudah diambil pegawai untuk direkap

3. **Cuti_Sakit** (atau CutiSakit/Sheet3): Riwayat cuti sakit yang sudah diambil
   - Kolom: NIP, Tahun, Total_Hari, Riwayat
   - Sistem akan merekap dan menghitung potongan jika > 14 hari

4. **Cuti_Besar** (atau CutiBesar/Sheet4): Riwayat cuti besar yang sudah diambil
   - Kolom: NIP, Terakhir_Diambil
   - Sistem akan merekap dan menganalisis kelayakan berdasarkan masa kerja

5. **Cuti_Melahirkan** (atau CutiMelahirkan/Sheet5): Data cuti melahirkan yang sudah diambil
   - Kolom: NIP, Tahun, Tanggal_Mulai, Tanggal_Selesai, Lama_Hari, Status
   - Khusus untuk pegawai wanita yang sudah mengambil cuti melahirkan

6. **Cuti_Penting** (atau CutiPenting/Sheet6): Riwayat cuti alasan penting yang sudah diambil
   - Kolom: NIP, Tahun, Total_Hari, Alasan_Terakhir, Riwayat
   - Sistem akan merekap dan memantau batas maksimal 30 hari per tahun

## Fleksibilitas Format

Aplikasi rekap dapat membaca berbagai format nama kolom dan sheet:
- **Nama kolom:** Case-insensitive (Nama/NAMA/nama)
- **Nama sheet:** Pegawai/Data/Sheet1, Cuti_Tahunan/CutiTahunan/Sheet2, dst.
- **Data kosong:** Jika sheet tidak ada atau kosong, sistem akan membuat rekap kosong
- **Analisis otomatis:** Data dari Excel akan dianalisis dan direkap secara otomatis

## Fitur Keamanan dan Validasi

- Validasi format file upload (hanya Excel)
- Batas ukuran file maksimal 10MB
- Validasi data sesuai aturan PNS
- Pengecekan overlap periode cuti
- Validasi NIP dan data pegawai

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Kontribusi

Aplikasi ini dikembangkan untuk Kepegawaian Pusdiklatwas BPKP. Untuk saran dan perbaikan, silakan hubungi tim pengembang.

## Lisensi

© 2025 Kepegawaian Pusdiklatwas BPKP. All rights reserved.