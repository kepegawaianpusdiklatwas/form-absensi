# Aplikasi Rekap Cuti Pegawai PNS

Sistem manajemen dan pelaporan cuti komprehensif untuk Pegawai Negeri Sipil (PNS) yang memungkinkan pengelolaan berbagai jenis cuti sesuai dengan peraturan kepegawaian.

## Fitur Utama

### 1. **Dashboard Komprehensif**
- Statistik real-time jumlah pegawai dan penggunaan cuti
- Grafik tren penggunaan cuti per bulan
- Visualisasi distribusi jenis cuti
- Indikator pegawai yang perlu perhatian khusus

### 2. **Manajemen Cuti Tahunan**
- Perhitungan hak cuti berdasarkan masa kerja
- Tracking saldo awal, hak cuti, dan sisa cuti
- Riwayat pengambilan cuti detail
- Status monitoring (Normal, Hampir Habis, Habis)

### 3. **Monitoring Cuti Sakit**
- Tracking total hari cuti sakit per tahun
- Perhitungan otomatis potongan gaji untuk cuti berlebihan
- Batas normal 14 hari tanpa potongan
- Sistem potongan bertingkat (50% dan 100%)

### 4. **Kelayakan Cuti Besar**
- Perhitungan kelayakan berdasarkan masa kerja (setiap 6 tahun)
- Tracking riwayat pengambilan cuti besar
- Prediksi tahun berikutnya yang layak
- Durasi standar 3 bulan (90 hari)

### 5. **Cuti Melahirkan**
- Khusus untuk pegawai wanita
- Durasi standar 3 bulan (90 hari)
- Tracking periode cuti dan status
- Validasi distribusi waktu sebelum dan sesudah melahirkan

### 6. **Cuti Alasan Penting**
- Batas maksimal 30 hari per tahun
- Monitoring sisa hak cuti
- Tracking alasan pengambilan cuti
- Status peringatan mendekati batas

### 7. **Upload Data Excel**
- Import data dari file Excel (.xlsx/.xls)
- Template Excel yang dapat diunduh
- Validasi format dan ukuran file
- Progress indicator saat upload
- Integrasi otomatis dengan Google Sheets

### 8. **Sistem Pelaporan**
- Export ke berbagai format (Excel, PDF, CSV)
- Laporan per jenis cuti atau komprehensif
- Template laporan yang dapat disesuaikan
- Timestamp otomatis pada setiap laporan

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

### 1. Upload Data
1. Klik tab "Upload Data"
2. Download template Excel yang disediakan
3. Isi data pegawai dan cuti sesuai format template
4. Upload file Excel ke aplikasi
5. Sistem akan memproses dan mengintegrasikan data

### 2. Monitoring Cuti
1. Gunakan tab sesuai jenis cuti yang ingin dipantau
2. Gunakan fitur pencarian untuk menemukan pegawai tertentu
3. Klik "Detail" untuk melihat riwayat lengkap
4. Export data jika diperlukan

### 3. Generate Laporan
1. Klik tab "Laporan"
2. Pilih jenis laporan (semua atau spesifik)
3. Pilih format output (PDF, Excel, CSV)
4. Klik "Generate Laporan"
5. File akan otomatis terunduh

## Format Template Excel

Template Excel terdiri dari 6 sheet yang dapat disesuaikan:

1. **Pegawai** (atau Sheet1/Data): Data dasar pegawai
   - Kolom: Nama, NIP, Golongan, Jabatan, Tanggal_Masuk, Jenis_Kelamin
   - Format alternatif: NAMA, nip, golongan, jabatan, TGL_MASUK, JK/L/P

2. **Cuti_Tahunan** (atau CutiTahunan/Sheet2): Data cuti tahunan per pegawai
   - Kolom: NIP, Tahun, Saldo_Awal, Hak_Cuti, Diambil, Sisa, Riwayat
   - Format alternatif: nip, TAHUN, saldo_awal, hak_cuti, diambil, sisa

3. **Cuti_Sakit** (atau CutiSakit/Sheet3): Riwayat cuti sakit
   - Kolom: NIP, Tahun, Total_Hari, Riwayat
   - Format alternatif: nip, tahun, total_hari, jumlah_hari

4. **Cuti_Besar** (atau CutiBesar/Sheet4): Status dan riwayat cuti besar
   - Kolom: NIP, Terakhir_Diambil
   - Format alternatif: nip, terakhir_diambil

5. **Cuti_Melahirkan** (atau CutiMelahirkan/Sheet5): Data cuti melahirkan (khusus wanita)
   - Kolom: NIP, Tahun, Tanggal_Mulai, Tanggal_Selesai, Status
   - Format alternatif: nip, tahun, tanggal_mulai, tanggal_selesai, status

6. **Cuti_Penting** (atau CutiPenting/Sheet6): Riwayat cuti alasan penting
   - Kolom: NIP, Tahun, Total_Hari, Alasan_Terakhir, Riwayat
   - Format alternatif: nip, tahun, total_hari, alasan_terakhir, keterangan

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