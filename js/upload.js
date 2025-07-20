// Upload dan Import Data Excel
class UploadManager {
  constructor(app) {
    this.app = app;
    this.setupUploadHandlers();
  }

  setupUploadHandlers() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const downloadTemplate = document.getElementById('download-template');

    // Click to upload
    uploadArea.addEventListener('click', () => {
      fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFileUpload(e.target.files[0]);
      }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileUpload(files[0]);
      }
    });

    // Download template
    downloadTemplate.addEventListener('click', () => {
      this.downloadTemplate();
    });
  }

  async handleFileUpload(file) {
    // Validasi file
    if (!this.validateFile(file)) {
      return;
    }

    // Show progress
    this.showProgress();

    try {
      // Read Excel file
      const data = await this.readExcelFile(file);
      
      // Process data
      await this.processExcelData(data);
      
      // Show success
      this.showSuccess('File berhasil diupload dan diproses!');
      
      // Refresh dashboard
      this.app.updateDashboard();
      this.app.refreshAllTables();
      
    } catch (error) {
      console.error('Upload error:', error);
      this.showError('Gagal memproses file: ' + error.message);
    } finally {
      this.hideProgress();
    }
  }

  validateFile(file) {
    // Check file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      this.showError('Format file tidak didukung. Gunakan file Excel (.xlsx atau .xls)');
      return false;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.showError('Ukuran file terlalu besar. Maksimal 10MB');
      return false;
    }

    return true;
  }

  readExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get all sheets
          const sheets = {};
          workbook.SheetNames.forEach(sheetName => {
            sheets[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          });
          
          resolve(sheets);
        } catch (error) {
          reject(new Error('Gagal membaca file Excel'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Gagal membaca file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  async processExcelData(sheets) {
    // Update progress
    this.updateProgress(20, 'Memproses data pegawai...');
    
    // Hapus semua data existing
    this.app.data = {
      pegawai: [],
      cutiTahunan: [],
      cutiSakit: [],
      cutiBesar: [],
      cutiMelahirkan: [],
      cutiPenting: []
    };
    
    // Process data pegawai dari sheet pertama
    const sheetNames = Object.keys(sheets);
    if (sheetNames.length > 0) {
      const pegawaiSheet = sheets[sheetNames[0]]; // Ambil sheet pertama
      await this.processPegawaiData(pegawaiSheet);
    }
    
    // Generate data cuti berdasarkan data pegawai yang diupload
    this.updateProgress(60, 'Menghitung data cuti berdasarkan aturan PNS...');
    await this.generateCutiDataFromPegawai();
    
    this.updateProgress(100, 'Selesai!');
  }

  async processPegawaiData(data) {
    if (!data || data.length === 0) {
      throw new Error('Data pegawai tidak ditemukan atau kosong');
    }
    
    const processedData = data.map(row => {
      // Fleksibel untuk berbagai format kolom
      const nama = row['Nama'] || row['NAMA'] || row['nama'] || '';
      const nip = row['NIP'] || row['nip'] || row['Nip'] || '';
      const golongan = row['Golongan'] || row['GOLONGAN'] || row['golongan'] || '';
      const jabatan = row['Jabatan'] || row['JABATAN'] || row['jabatan'] || '';
      const tglMasuk = row['Tanggal_Masuk'] || row['TGL_MASUK'] || row['tanggal_masuk'] || row['Tgl Masuk'] || '';
      const jenisKelamin = row['Jenis_Kelamin'] || row['JK'] || row['jenis_kelamin'] || row['L/P'] || 'L';
      
      return {
        id: this.generateId(),
        nama: nama,
        nip: nip,
        golongan: golongan,
        jabatan: jabatan,
        tglMasuk: this.parseDate(tglMasuk),
        jenisKelamin: jenisKelamin
      };
    }).filter(item => item.nama && item.nip);

    // Replace existing data
    this.app.data.pegawai = processedData;
    
    console.log(`Berhasil memproses ${processedData.length} data pegawai`);
  }

  async generateCutiDataFromPegawai() {
    const currentYear = this.app.tahunAktif;
    
    this.app.data.pegawai.forEach(pegawai => {
      // Cuti Tahunan - hitung berdasarkan masa kerja
      const hakCuti = this.app.calculateHakCutiTahunan(pegawai);
      this.app.data.cutiTahunan.push({
        pegawaiId: pegawai.id,
        tahun: currentYear,
        saldoAwal: 0, // Akan diisi manual atau dari data lain
        hakCuti: hakCuti,
        diambil: 0, // Akan diisi manual atau dari data lain
        sisa: hakCuti,
        riwayat: []
      });

      // Cuti Sakit
      this.app.data.cutiSakit.push({
        pegawaiId: pegawai.id,
        tahun: currentYear,
        totalHari: 0, // Akan diisi manual atau dari data lain
        batasNormal: 14,
        kelebihan: 0,
        potongan: 0,
        riwayat: []
      });

      // Cuti Besar
      const masaKerja = this.app.calculateMasaKerja(pegawai.tglMasuk);
      this.app.data.cutiBesar.push({
        pegawaiId: pegawai.id,
        masaKerja: masaKerja,
        hakCutiBesar: Math.floor(masaKerja / 6),
        terakhirDiambil: null,
        statusKelayakan: masaKerja >= 6 ? 'Layak' : 'Belum Layak'
      });

      // Cuti Melahirkan (hanya untuk perempuan)
      if (pegawai.jenisKelamin === 'P') {
        this.app.data.cutiMelahirkan.push({
          pegawaiId: pegawai.id,
          tahun: currentYear,
          tanggalMulai: null,
          tanggalSelesai: null,
          lamaHari: 0,
          status: 'Tidak Ada'
        });
      }

      // Cuti Alasan Penting
      this.app.data.cutiPenting.push({
        pegawaiId: pegawai.id,
        tahun: currentYear,
        totalHari: 0, // Akan diisi manual atau dari data lain
        batasMaksimal: 30,
        sisaHak: 30,
        alasanTerakhir: '-',
        riwayat: []
      });
    });
    
    console.log(`Berhasil generate data cuti untuk ${this.app.data.pegawai.length} pegawai`);
  }

  findPegawaiByNIP(nip) {
    return this.app.data.pegawai.find(p => p.nip === nip);
  }

  parseDate(dateValue) {
    if (!dateValue) return null;
    
    // Handle Excel date serial number
    if (typeof dateValue === 'number') {
      const date = new Date((dateValue - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    
    // Handle string date
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    
    return null;
  }

  parseRiwayatCuti(riwayatString) {
    if (!riwayatString) return [];
    
    try {
      // Assume riwayat is stored as JSON string
      return JSON.parse(riwayatString);
    } catch (error) {
      // If not JSON, try to parse as simple format
      return [];
    }
  }

  mergeData(existingData, newData, keyField) {
    const merged = [...existingData];
    
    newData.forEach(newItem => {
      const existingIndex = merged.findIndex(item => item[keyField] === newItem[keyField]);
      if (existingIndex >= 0) {
        // Update existing
        merged[existingIndex] = { ...merged[existingIndex], ...newItem };
      } else {
        // Add new
        merged.push(newItem);
      }
    });
    
    return merged;
  }

  generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  }

  downloadTemplate() {
    // Create template workbook
    const wb = XLSX.utils.book_new();
    
    // Pegawai sheet
    const pegawaiData = [
      {
        'Nama': 'Contoh Nama Pegawai',
        'NIP': '199001012020121001',
        'Golongan': 'III/a',
        'Jabatan': 'Contoh Jabatan',
        'Tanggal_Masuk': '2020-01-01',
        'Jenis_Kelamin': 'L'
      }
    ];
    const pegawaiWS = XLSX.utils.json_to_sheet(pegawaiData);
    XLSX.utils.book_append_sheet(wb, pegawaiWS, 'Data_Pegawai');
    
    // Download file
    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Template_Data_Pegawai_${timestamp}.xlsx`);
  }

  showProgress() {
    document.getElementById('upload-progress').classList.remove('hidden');
    document.getElementById('upload-result').classList.add('hidden');
  }

  updateProgress(percent, message) {
    document.getElementById('progress-fill').style.width = percent + '%';
    document.getElementById('upload-status').textContent = message;
  }

  hideProgress() {
    setTimeout(() => {
      document.getElementById('upload-progress').classList.add('hidden');
    }, 1000);
  }

  showSuccess(message) {
    document.getElementById('upload-message').textContent = message;
    document.getElementById('upload-result').classList.remove('hidden');
  }

  showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger mt-4';
    alertDiv.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
    
    const uploadArea = document.getElementById('upload-area');
    uploadArea.parentNode.insertBefore(alertDiv, uploadArea.nextSibling);
    
    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
  }
}

// Initialize upload manager when app is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.app) {
    new UploadManager(window.app);
  }
});