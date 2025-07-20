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
    
    // Process each sheet
    if (sheets['Pegawai']) {
      await this.processPegawaiData(sheets['Pegawai']);
    }
    
    this.updateProgress(40, 'Memproses data cuti tahunan...');
    if (sheets['Cuti_Tahunan']) {
      await this.processCutiTahunanData(sheets['Cuti_Tahunan']);
    }
    
    this.updateProgress(60, 'Memproses data cuti sakit...');
    if (sheets['Cuti_Sakit']) {
      await this.processCutiSakitData(sheets['Cuti_Sakit']);
    }
    
    this.updateProgress(80, 'Memproses data cuti lainnya...');
    if (sheets['Cuti_Besar']) {
      await this.processCutiBesarData(sheets['Cuti_Besar']);
    }
    
    if (sheets['Cuti_Melahirkan']) {
      await this.processCutiMelahirkanData(sheets['Cuti_Melahirkan']);
    }
    
    if (sheets['Cuti_Penting']) {
      await this.processCutiPentingData(sheets['Cuti_Penting']);
    }
    
    this.updateProgress(100, 'Selesai!');
  }

  async processPegawaiData(data) {
    const processedData = data.map(row => ({
      id: this.generateId(),
      nama: row['Nama'] || '',
      nip: row['NIP'] || '',
      golongan: row['Golongan'] || '',
      jabatan: row['Jabatan'] || '',
      tglMasuk: this.parseDate(row['Tanggal_Masuk']),
      jenisKelamin: row['Jenis_Kelamin'] || 'L'
    })).filter(item => item.nama && item.nip);

    // Merge with existing data
    this.app.data.pegawai = this.mergeData(this.app.data.pegawai, processedData, 'nip');
  }

  async processCutiTahunanData(data) {
    const processedData = data.map(row => {
      const pegawai = this.findPegawaiByNIP(row['NIP']);
      if (!pegawai) return null;

      return {
        pegawaiId: pegawai.id,
        tahun: parseInt(row['Tahun']) || this.app.tahunAktif,
        saldoAwal: parseInt(row['Saldo_Awal']) || 0,
        hakCuti: parseInt(row['Hak_Cuti']) || this.app.calculateHakCutiTahunan(pegawai),
        diambil: parseInt(row['Diambil']) || 0,
        sisa: parseInt(row['Sisa']) || 0,
        riwayat: this.parseRiwayatCuti(row['Riwayat'])
      };
    }).filter(item => item !== null);

    this.app.data.cutiTahunan = this.mergeData(this.app.data.cutiTahunan, processedData, 'pegawaiId');
  }

  async processCutiSakitData(data) {
    const processedData = data.map(row => {
      const pegawai = this.findPegawaiByNIP(row['NIP']);
      if (!pegawai) return null;

      const totalHari = parseInt(row['Total_Hari']) || 0;
      const kelebihan = Math.max(0, totalHari - 14);
      
      return {
        pegawaiId: pegawai.id,
        tahun: parseInt(row['Tahun']) || this.app.tahunAktif,
        totalHari: totalHari,
        batasNormal: 14,
        kelebihan: kelebihan,
        potongan: this.app.calculatePotonganSakit(totalHari),
        riwayat: this.parseRiwayatCuti(row['Riwayat'])
      };
    }).filter(item => item !== null);

    this.app.data.cutiSakit = this.mergeData(this.app.data.cutiSakit, processedData, 'pegawaiId');
  }

  async processCutiBesarData(data) {
    const processedData = data.map(row => {
      const pegawai = this.findPegawaiByNIP(row['NIP']);
      if (!pegawai) return null;

      const masaKerja = this.app.calculateMasaKerja(pegawai.tglMasuk);
      
      return {
        pegawaiId: pegawai.id,
        masaKerja: masaKerja,
        hakCutiBesar: Math.floor(masaKerja / 6),
        terakhirDiambil: this.parseDate(row['Terakhir_Diambil']),
        statusKelayakan: masaKerja >= 6 && (masaKerja % 6 === 0) ? 'Layak' : 'Belum Layak'
      };
    }).filter(item => item !== null);

    this.app.data.cutiBesar = this.mergeData(this.app.data.cutiBesar, processedData, 'pegawaiId');
  }

  async processCutiMelahirkanData(data) {
    const processedData = data.map(row => {
      const pegawai = this.findPegawaiByNIP(row['NIP']);
      if (!pegawai || pegawai.jenisKelamin !== 'P') return null;

      const tanggalMulai = this.parseDate(row['Tanggal_Mulai']);
      const tanggalSelesai = this.parseDate(row['Tanggal_Selesai']);
      const lamaHari = tanggalMulai && tanggalSelesai ? 
        Math.ceil((new Date(tanggalSelesai) - new Date(tanggalMulai)) / (1000 * 60 * 60 * 24)) + 1 : 0;
      
      return {
        pegawaiId: pegawai.id,
        tahun: parseInt(row['Tahun']) || this.app.tahunAktif,
        tanggalMulai: tanggalMulai,
        tanggalSelesai: tanggalSelesai,
        lamaHari: lamaHari,
        status: row['Status'] || (lamaHari > 0 ? 'Selesai' : 'Tidak Ada')
      };
    }).filter(item => item !== null);

    this.app.data.cutiMelahirkan = this.mergeData(this.app.data.cutiMelahirkan, processedData, 'pegawaiId');
  }

  async processCutiPentingData(data) {
    const processedData = data.map(row => {
      const pegawai = this.findPegawaiByNIP(row['NIP']);
      if (!pegawai) return null;

      const totalHari = parseInt(row['Total_Hari']) || 0;
      
      return {
        pegawaiId: pegawai.id,
        tahun: parseInt(row['Tahun']) || this.app.tahunAktif,
        totalHari: totalHari,
        batasMaksimal: 30,
        sisaHak: 30 - totalHari,
        alasanTerakhir: row['Alasan_Terakhir'] || '-',
        riwayat: this.parseRiwayatCuti(row['Riwayat'])
      };
    }).filter(item => item !== null);

    this.app.data.cutiPenting = this.mergeData(this.app.data.cutiPenting, processedData, 'pegawaiId');
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
        'Nama': 'Ahmad Suryadi',
        'NIP': '198501012010011001',
        'Golongan': 'III/c',
        'Jabatan': 'Auditor Ahli Muda',
        'Tanggal_Masuk': '2010-01-01',
        'Jenis_Kelamin': 'L'
      },
      {
        'Nama': 'Siti Nurhaliza',
        'NIP': '198703152012012002',
        'Golongan': 'III/b',
        'Jabatan': 'Auditor Terampil',
        'Tanggal_Masuk': '2012-03-15',
        'Jenis_Kelamin': 'P'
      }
    ];
    const pegawaiWS = XLSX.utils.json_to_sheet(pegawaiData);
    XLSX.utils.book_append_sheet(wb, pegawaiWS, 'Pegawai');
    
    // Cuti Tahunan sheet
    const cutiTahunanData = [
      {
        'NIP': '198501012010011001',
        'Tahun': 2025,
        'Saldo_Awal': 3,
        'Hak_Cuti': 12,
        'Diambil': 8,
        'Sisa': 7,
        'Riwayat': '[]'
      }
    ];
    const cutiTahunanWS = XLSX.utils.json_to_sheet(cutiTahunanData);
    XLSX.utils.book_append_sheet(wb, cutiTahunanWS, 'Cuti_Tahunan');
    
    // Cuti Sakit sheet
    const cutiSakitData = [
      {
        'NIP': '198501012010011001',
        'Tahun': 2025,
        'Total_Hari': 5,
        'Riwayat': '[]'
      }
    ];
    const cutiSakitWS = XLSX.utils.json_to_sheet(cutiSakitData);
    XLSX.utils.book_append_sheet(wb, cutiSakitWS, 'Cuti_Sakit');
    
    // Cuti Besar sheet
    const cutiBesarData = [
      {
        'NIP': '198501012010011001',
        'Terakhir_Diambil': '2020-01-01'
      }
    ];
    const cutiBesarWS = XLSX.utils.json_to_sheet(cutiBesarData);
    XLSX.utils.book_append_sheet(wb, cutiBesarWS, 'Cuti_Besar');
    
    // Cuti Melahirkan sheet
    const cutiMelahirkanData = [
      {
        'NIP': '198703152012012002',
        'Tahun': 2025,
        'Tanggal_Mulai': '2025-03-01',
        'Tanggal_Selesai': '2025-05-30',
        'Status': 'Selesai'
      }
    ];
    const cutiMelahirkanWS = XLSX.utils.json_to_sheet(cutiMelahirkanData);
    XLSX.utils.book_append_sheet(wb, cutiMelahirkanWS, 'Cuti_Melahirkan');
    
    // Cuti Penting sheet
    const cutiPentingData = [
      {
        'NIP': '198501012010011001',
        'Tahun': 2025,
        'Total_Hari': 3,
        'Alasan_Terakhir': 'Urusan keluarga',
        'Riwayat': '[]'
      }
    ];
    const cutiPentingWS = XLSX.utils.json_to_sheet(cutiPentingData);
    XLSX.utils.book_append_sheet(wb, cutiPentingWS, 'Cuti_Penting');
    
    // Download file
    XLSX.writeFile(wb, 'Template_Data_Cuti.xlsx');
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