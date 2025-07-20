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
    
    // Process each sheet - sesuaikan dengan struktur file Excel yang diupload
    if (sheets['Sheet1'] || sheets['Data'] || sheets['Pegawai']) {
      const pegawaiSheet = sheets['Sheet1'] || sheets['Data'] || sheets['Pegawai'];
      await this.processPegawaiData(pegawaiSheet);
    }
    
    this.updateProgress(40, 'Memproses data cuti tahunan...');
    if (sheets['Cuti_Tahunan'] || sheets['CutiTahunan'] || sheets['Sheet2']) {
      const cutiTahunanSheet = sheets['Cuti_Tahunan'] || sheets['CutiTahunan'] || sheets['Sheet2'];
      await this.processCutiTahunanData(cutiTahunanSheet);
    }
    
    this.updateProgress(60, 'Memproses data cuti sakit...');
    if (sheets['Cuti_Sakit'] || sheets['CutiSakit'] || sheets['Sheet3']) {
      const cutiSakitSheet = sheets['Cuti_Sakit'] || sheets['CutiSakit'] || sheets['Sheet3'];
      await this.processCutiSakitData(cutiSakitSheet);
    }
    
    this.updateProgress(80, 'Memproses data cuti lainnya...');
    if (sheets['Cuti_Besar'] || sheets['CutiBesar'] || sheets['Sheet4']) {
      const cutiBesarSheet = sheets['Cuti_Besar'] || sheets['CutiBesar'] || sheets['Sheet4'];
      await this.processCutiBesarData(cutiBesarSheet);
    }
    
    if (sheets['Cuti_Melahirkan'] || sheets['CutiMelahirkan'] || sheets['Sheet5']) {
      const cutiMelahirkanSheet = sheets['Cuti_Melahirkan'] || sheets['CutiMelahirkan'] || sheets['Sheet5'];
      await this.processCutiMelahirkanData(cutiMelahirkanSheet);
    }
    
    if (sheets['Cuti_Penting'] || sheets['CutiPenting'] || sheets['Sheet6']) {
      const cutiPentingSheet = sheets['Cuti_Penting'] || sheets['CutiPenting'] || sheets['Sheet6'];
      await this.processCutiPentingData(cutiPentingSheet);
    }
    
    this.updateProgress(100, 'Selesai!');
  }

  async processPegawaiData(data) {
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

    // Merge with existing data
    this.app.data.pegawai = this.mergeData(this.app.data.pegawai, processedData, 'nip');
  }

  async processCutiTahunanData(data) {
    const processedData = data.map(row => {
      const nip = row['NIP'] || row['nip'] || row['Nip'] || '';
      const pegawai = this.findPegawaiByNIP(nip);
      if (!pegawai) return null;

      const tahun = parseInt(row['Tahun'] || row['TAHUN'] || row['tahun'] || this.app.tahunAktif);
      const saldoAwal = parseInt(row['Saldo_Awal'] || row['SALDO_AWAL'] || row['saldo_awal'] || row['Saldo Awal'] || 0);
      const hakCuti = parseInt(row['Hak_Cuti'] || row['HAK_CUTI'] || row['hak_cuti'] || row['Hak Cuti'] || this.app.calculateHakCutiTahunan(pegawai));
      const diambil = parseInt(row['Diambil'] || row['DIAMBIL'] || row['diambil'] || row['Cuti Diambil'] || 0);
      const sisa = parseInt(row['Sisa'] || row['SISA'] || row['sisa'] || row['Sisa Cuti'] || 0);
      
      return {
        pegawaiId: pegawai.id,
        tahun: tahun,
        saldoAwal: saldoAwal,
        hakCuti: hakCuti,
        diambil: diambil,
        sisa: sisa,
        riwayat: this.parseRiwayatCuti(row['Riwayat'])
      };
    }).filter(item => item !== null);

    this.app.data.cutiTahunan = this.mergeData(this.app.data.cutiTahunan, processedData, 'pegawaiId');
  }

  async processCutiSakitData(data) {
    const processedData = data.map(row => {
      const nip = row['NIP'] || row['nip'] || row['Nip'] || '';
      const pegawai = this.findPegawaiByNIP(nip);
      if (!pegawai) return null;

      const totalHari = parseInt(row['Total_Hari'] || row['TOTAL_HARI'] || row['total_hari'] || row['Total Hari'] || row['Jumlah Hari'] || 0);
      const kelebihan = Math.max(0, totalHari - 14);
      
      return {
        pegawaiId: pegawai.id,
        tahun: parseInt(row['Tahun'] || row['TAHUN'] || row['tahun'] || this.app.tahunAktif),
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
      const nip = row['NIP'] || row['nip'] || row['Nip'] || '';
      const pegawai = this.findPegawaiByNIP(nip);
      if (!pegawai) return null;

      const masaKerja = this.app.calculateMasaKerja(pegawai.tglMasuk);
      const terakhirDiambil = row['Terakhir_Diambil'] || row['TERAKHIR_DIAMBIL'] || row['terakhir_diambil'] || row['Terakhir Diambil'] || null;
      
      return {
        pegawaiId: pegawai.id,
        masaKerja: masaKerja,
        hakCutiBesar: Math.floor(masaKerja / 6),
        terakhirDiambil: this.parseDate(terakhirDiambil),
        statusKelayakan: masaKerja >= 6 && (masaKerja % 6 === 0) ? 'Layak' : 'Belum Layak'
      };
    }).filter(item => item !== null);

    this.app.data.cutiBesar = this.mergeData(this.app.data.cutiBesar, processedData, 'pegawaiId');
  }

  async processCutiMelahirkanData(data) {
    const processedData = data.map(row => {
      const nip = row['NIP'] || row['nip'] || row['Nip'] || '';
      const pegawai = this.findPegawaiByNIP(nip);
      if (!pegawai || pegawai.jenisKelamin !== 'P') return null;

      const tanggalMulai = this.parseDate(row['Tanggal_Mulai'] || row['TANGGAL_MULAI'] || row['tanggal_mulai'] || row['Tanggal Mulai']);
      const tanggalSelesai = this.parseDate(row['Tanggal_Selesai'] || row['TANGGAL_SELESAI'] || row['tanggal_selesai'] || row['Tanggal Selesai']);
      const lamaHari = tanggalMulai && tanggalSelesai ? 
        Math.ceil((new Date(tanggalSelesai) - new Date(tanggalMulai)) / (1000 * 60 * 60 * 24)) + 1 : 0;
      
      return {
        pegawaiId: pegawai.id,
        tahun: parseInt(row['Tahun'] || row['TAHUN'] || row['tahun'] || this.app.tahunAktif),
        tanggalMulai: tanggalMulai,
        tanggalSelesai: tanggalSelesai,
        lamaHari: lamaHari,
        status: row['Status'] || row['STATUS'] || row['status'] || (lamaHari > 0 ? 'Selesai' : 'Tidak Ada')
      };
    }).filter(item => item !== null);

    this.app.data.cutiMelahirkan = this.mergeData(this.app.data.cutiMelahirkan, processedData, 'pegawaiId');
  }

  async processCutiPentingData(data) {
    const processedData = data.map(row => {
      const nip = row['NIP'] || row['nip'] || row['Nip'] || '';
      const pegawai = this.findPegawaiByNIP(nip);
      if (!pegawai) return null;

      const totalHari = parseInt(row['Total_Hari'] || row['TOTAL_HARI'] || row['total_hari'] || row['Total Hari'] || row['Jumlah Hari'] || 0);
      const alasanTerakhir = row['Alasan_Terakhir'] || row['ALASAN_TERAKHIR'] || row['alasan_terakhir'] || row['Alasan Terakhir'] || row['Keterangan'] || '-';
      
      return {
        pegawaiId: pegawai.id,
        tahun: parseInt(row['Tahun'] || row['TAHUN'] || row['tahun'] || this.app.tahunAktif),
        totalHari: totalHari,
        batasMaksimal: 30,
        sisaHak: 30 - totalHari,
        alasanTerakhir: alasanTerakhir,
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
        'Nama': 'Dr. Ahmad Suryadi, M.Si',
        'NIP': '196801012010011001',
        'Golongan': 'III/c',
        'Jabatan': 'Kepala Pusdiklatwas',
        'Tanggal_Masuk': '2010-03-01',
        'Jenis_Kelamin': 'L'
      },
      {
        'Nama': 'Dra. Siti Nurhaliza, M.M',
        'NIP': '197203152012012002',
        'Golongan': 'III/b',
        'Jabatan': 'Kepala Subbag Kepegawaian',
        'Tanggal_Masuk': '2012-06-15',
        'Jenis_Kelamin': 'P'
      },
      {
        'Nama': 'Ir. Budi Santoso, M.T',
        'NIP': '197205102008011003',
        'Golongan': 'III/d',
        'Jabatan': 'Widyaiswara Ahli Madya',
        'Tanggal_Masuk': '2008-08-10',
        'Jenis_Kelamin': 'L'
      }
    ];
    const pegawaiWS = XLSX.utils.json_to_sheet(pegawaiData);
    XLSX.utils.book_append_sheet(wb, pegawaiWS, 'Pegawai');
    
    // Cuti Tahunan sheet
    const cutiTahunanData = [
      {
        'NIP': '196801012010011001',
        'Tahun': 2025,
        'Saldo_Awal': 5,
        'Hak_Cuti': 21,
        'Diambil': 12,
        'Sisa': 14,
        'Riwayat': '[]'
      },
      {
        'NIP': '197203152012012002',
        'Tahun': 2025,
        'Saldo_Awal': 2,
        'Hak_Cuti': 15,
        'Diambil': 8,
        'Sisa': 9,
        'Riwayat': '[]'
      }
    ];
    const cutiTahunanWS = XLSX.utils.json_to_sheet(cutiTahunanData);
    XLSX.utils.book_append_sheet(wb, cutiTahunanWS, 'Cuti_Tahunan');
    
    // Cuti Sakit sheet
    const cutiSakitData = [
      {
        'NIP': '196801012010011001',
        'Tahun': 2025,
        'Total_Hari': 8,
        'Riwayat': '[]'
      },
      {
        'NIP': '197203152012012002',
        'Tahun': 2025,
        'Total_Hari': 3,
        'Riwayat': '[]'
      }
    ];
    const cutiSakitWS = XLSX.utils.json_to_sheet(cutiSakitData);
    XLSX.utils.book_append_sheet(wb, cutiSakitWS, 'Cuti_Sakit');
    
    // Cuti Besar sheet
    const cutiBesarData = [
      {
        'NIP': '196801012010011001',
        'Terakhir_Diambil': '2019-01-01'
      },
      {
        'NIP': '197205102008011003',
        'Terakhir_Diambil': '2020-06-01'
      }
    ];
    const cutiBesarWS = XLSX.utils.json_to_sheet(cutiBesarData);
    XLSX.utils.book_append_sheet(wb, cutiBesarWS, 'Cuti_Besar');
    
    // Cuti Melahirkan sheet
    const cutiMelahirkanData = [
      {
        'NIP': '197203152012012002',
        'Tahun': 2025,
        'Tanggal_Mulai': '',
        'Tanggal_Selesai': '',
        'Status': 'Tidak Ada'
      },
      {
        'NIP': '198502202015012004',
        'Tahun': 2024,
        'Tanggal_Mulai': '2024-08-01',
        'Tanggal_Selesai': '2024-10-30',
        'Status': 'Selesai'
      }
    ];
    const cutiMelahirkanWS = XLSX.utils.json_to_sheet(cutiMelahirkanData);
    XLSX.utils.book_append_sheet(wb, cutiMelahirkanWS, 'Cuti_Melahirkan');
    
    // Cuti Penting sheet
    const cutiPentingData = [
      {
        'NIP': '196801012010011001',
        'Tahun': 2025,
        'Total_Hari': 5,
        'Alasan_Terakhir': 'Acara keluarga',
        'Riwayat': '[]'
      },
      {
        'NIP': '197203152012012002',
        'Tahun': 2025,
        'Total_Hari': 2,
        'Alasan_Terakhir': 'Urusan pribadi',
        'Riwayat': '[]'
      }
    ];
    const cutiPentingWS = XLSX.utils.json_to_sheet(cutiPentingData);
    XLSX.utils.book_append_sheet(wb, cutiPentingWS, 'Cuti_Penting');
    
    // Download file
    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Template_Data_Cuti_Pusdiklatwas_${timestamp}.xlsx`);
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