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
    
    // Reset data
    this.app.data.pegawai = [];
    this.app.data.cutiTahunan = [];
    this.app.data.cutiSakit = [];
    this.app.data.cutiBesar = [];
    this.app.data.cutiMelahirkan = [];
    this.app.data.cutiPenting = [];
    
    // Process semua sheet yang ada
    for (const [sheetName, sheetData] of Object.entries(sheets)) {
      this.updateProgress(30, `Memproses sheet: ${sheetName}...`);
      
      if (this.isPegawaiSheet(sheetName)) {
        await this.processPegawaiData(sheetData);
      } else if (this.isCutiTahunanSheet(sheetName)) {
        await this.processCutiTahunanData(sheetData);
      } else if (this.isCutiSakitSheet(sheetName)) {
        await this.processCutiSakitData(sheetData);
      } else if (this.isCutiBesarSheet(sheetName)) {
        await this.processCutiBesarData(sheetData);
      } else if (this.isCutiMelahirkanSheet(sheetName)) {
        await this.processCutiMelahirkanData(sheetData);
      } else if (this.isCutiPentingSheet(sheetName)) {
        await this.processCutiPentingData(sheetData);
      }
    }
    
    // Generate data cuti yang belum ada
    this.updateProgress(80, 'Melengkapi data cuti...');
    await this.generateMissingCutiData();
    
    this.updateProgress(100, 'Selesai!');
  }

  isPegawaiSheet(sheetName) {
    const pegawaiSheets = ['pegawai', 'data', 'sheet1', 'data_pegawai'];
    return pegawaiSheets.includes(sheetName.toLowerCase());
  }

  isCutiTahunanSheet(sheetName) {
    const cutiTahunanSheets = ['cuti_tahunan', 'cutitahunan', 'sheet2'];
    return cutiTahunanSheets.includes(sheetName.toLowerCase());
  }

  isCutiSakitSheet(sheetName) {
    const cutiSakitSheets = ['cuti_sakit', 'cutisakit', 'sheet3'];
    return cutiSakitSheets.includes(sheetName.toLowerCase());
  }

  isCutiBesarSheet(sheetName) {
    const cutiBesarSheets = ['cuti_besar', 'cutibesar', 'sheet4'];
    return cutiBesarSheets.includes(sheetName.toLowerCase());
  }

  isCutiMelahirkanSheet(sheetName) {
    const cutiMelahirkanSheets = ['cuti_melahirkan', 'cutimelahirkan', 'sheet5'];
    return cutiMelahirkanSheets.includes(sheetName.toLowerCase());
  }

  isCutiPentingSheet(sheetName) {
    const cutiPentingSheets = ['cuti_penting', 'cutipenting', 'sheet6'];
    return cutiPentingSheets.includes(sheetName.toLowerCase());
  }

  async processPegawaiData(data) {
    if (!data || data.length === 0) {
      console.warn('Data pegawai kosong');
      return;
    }
    
    const processedData = data.map(row => {
      // Sesuaikan dengan struktur file Excel yang diupload
      const nama = this.getColumnValue(row, ['Nama', 'NAMA', 'nama', 'Name']);
      const nip = this.getColumnValue(row, ['NIP', 'nip', 'Nip']);
      const golongan = this.getColumnValue(row, ['Golongan', 'GOLONGAN', 'golongan', 'Gol']);
      const jabatan = this.getColumnValue(row, ['Jabatan', 'JABATAN', 'jabatan', 'Position']);
      const tglMasuk = this.getColumnValue(row, ['Tanggal_Masuk', 'TGL_MASUK', 'tanggal_masuk', 'Tgl Masuk', 'Tanggal Masuk']);
      const jenisKelamin = this.getColumnValue(row, ['Jenis_Kelamin', 'JK', 'jenis_kelamin', 'L/P', 'Gender']) || 'L';
      
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

    this.app.data.pegawai = processedData;
    console.log(`Berhasil memproses ${processedData.length} data pegawai`);
  }

  async processCutiTahunanData(data) {
    if (!data || data.length === 0) {
      console.warn('Data cuti tahunan kosong');
      return;
    }

    const processedData = data.map(row => {
      const nip = this.getColumnValue(row, ['NIP', 'nip']);
      const pegawai = this.findPegawaiByNIP(nip);
      
      if (!pegawai) return null;

      return {
        pegawaiId: pegawai.id,
        tahun: parseInt(this.getColumnValue(row, ['Tahun', 'TAHUN', 'tahun']) || this.app.tahunAktif),
        saldoAwal: parseInt(this.getColumnValue(row, ['Saldo_Awal', 'saldo_awal', 'Saldo Awal']) || 0),
        hakCuti: parseInt(this.getColumnValue(row, ['Hak_Cuti', 'hak_cuti', 'Hak Cuti']) || this.app.calculateHakCutiTahunan(pegawai)),
        diambil: parseInt(this.getColumnValue(row, ['Diambil', 'diambil', 'Cuti Diambil']) || 0),
        sisa: parseInt(this.getColumnValue(row, ['Sisa', 'sisa', 'Sisa Cuti']) || 0),
        riwayat: this.parseRiwayatCuti(this.getColumnValue(row, ['Riwayat', 'riwayat']))
      };
    }).filter(item => item !== null);

    this.app.data.cutiTahunan = processedData;
    console.log(`Berhasil memproses ${processedData.length} data cuti tahunan`);
  }

  async processCutiSakitData(data) {
    if (!data || data.length === 0) {
      console.warn('Data cuti sakit kosong');
      return;
    }

    const processedData = data.map(row => {
      const nip = this.getColumnValue(row, ['NIP', 'nip']);
      const pegawai = this.findPegawaiByNIP(nip);
      
      if (!pegawai) return null;

      const totalHari = parseInt(this.getColumnValue(row, ['Total_Hari', 'total_hari', 'Total Hari', 'Jumlah_Hari']) || 0);
      const potongan = this.app.calculatePotonganSakit(totalHari);

      return {
        pegawaiId: pegawai.id,
        tahun: parseInt(this.getColumnValue(row, ['Tahun', 'tahun']) || this.app.tahunAktif),
        totalHari: totalHari,
        batasNormal: 14,
        kelebihan: Math.max(0, totalHari - 14),
        potongan: potongan,
        riwayat: this.parseRiwayatCuti(this.getColumnValue(row, ['Riwayat', 'riwayat']))
      };
    }).filter(item => item !== null);

    this.app.data.cutiSakit = processedData;
    console.log(`Berhasil memproses ${processedData.length} data cuti sakit`);
  }

  async processCutiBesarData(data) {
    if (!data || data.length === 0) {
      console.warn('Data cuti besar kosong');
      return;
    }

    const processedData = data.map(row => {
      const nip = this.getColumnValue(row, ['NIP', 'nip']);
      const pegawai = this.findPegawaiByNIP(nip);
      
      if (!pegawai) return null;

      const masaKerja = this.app.calculateMasaKerja(pegawai.tglMasuk);
      const terakhirDiambil = this.parseDate(this.getColumnValue(row, ['Terakhir_Diambil', 'terakhir_diambil', 'Terakhir Diambil']));

      return {
        pegawaiId: pegawai.id,
        masaKerja: masaKerja,
        hakCutiBesar: Math.floor(masaKerja / 6),
        terakhirDiambil: terakhirDiambil,
        statusKelayakan: masaKerja >= 6 ? 'Layak' : 'Belum Layak'
      };
    }).filter(item => item !== null);

    this.app.data.cutiBesar = processedData;
    console.log(`Berhasil memproses ${processedData.length} data cuti besar`);
  }

  async processCutiMelahirkanData(data) {
    if (!data || data.length === 0) {
      console.warn('Data cuti melahirkan kosong');
      return;
    }

    const processedData = data.map(row => {
      const nip = this.getColumnValue(row, ['NIP', 'nip']);
      const pegawai = this.findPegawaiByNIP(nip);
      
      if (!pegawai || pegawai.jenisKelamin !== 'P') return null;

      const tanggalMulai = this.parseDate(this.getColumnValue(row, ['Tanggal_Mulai', 'tanggal_mulai', 'Tanggal Mulai']));
      const tanggalSelesai = this.parseDate(this.getColumnValue(row, ['Tanggal_Selesai', 'tanggal_selesai', 'Tanggal Selesai']));
      const lamaHari = parseInt(this.getColumnValue(row, ['Lama_Hari', 'lama_hari', 'Lama Hari']) || 0);

      return {
        pegawaiId: pegawai.id,
        tahun: parseInt(this.getColumnValue(row, ['Tahun', 'tahun']) || this.app.tahunAktif),
        tanggalMulai: tanggalMulai,
        tanggalSelesai: tanggalSelesai,
        lamaHari: lamaHari,
        status: this.getColumnValue(row, ['Status', 'status']) || 'Selesai'
      };
    }).filter(item => item !== null);

    this.app.data.cutiMelahirkan = processedData;
    console.log(`Berhasil memproses ${processedData.length} data cuti melahirkan`);
  }

  async processCutiPentingData(data) {
    if (!data || data.length === 0) {
      console.warn('Data cuti penting kosong');
      return;
    }

    const processedData = data.map(row => {
      const nip = this.getColumnValue(row, ['NIP', 'nip']);
      const pegawai = this.findPegawaiByNIP(nip);
      
      if (!pegawai) return null;

      const totalHari = parseInt(this.getColumnValue(row, ['Total_Hari', 'total_hari', 'Total Hari']) || 0);

      return {
        pegawaiId: pegawai.id,
        tahun: parseInt(this.getColumnValue(row, ['Tahun', 'tahun']) || this.app.tahunAktif),
        totalHari: totalHari,
        batasMaksimal: 30,
        sisaHak: Math.max(0, 30 - totalHari),
        alasanTerakhir: this.getColumnValue(row, ['Alasan_Terakhir', 'alasan_terakhir', 'Alasan Terakhir', 'Keterangan']) || '-',
        riwayat: this.parseRiwayatCuti(this.getColumnValue(row, ['Riwayat', 'riwayat']))
      };
    }).filter(item => item !== null);

    this.app.data.cutiPenting = processedData;
    console.log(`Berhasil memproses ${processedData.length} data cuti penting`);
  }

  getColumnValue(row, possibleNames) {
    for (const name of possibleNames) {
      if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
        return row[name];
      }
    }
    return '';
  }

  async generateMissingCutiData() {
    const currentYear = this.app.tahunAktif;
    
    this.app.data.pegawai.forEach(pegawai => {
      // Cuti Tahunan - buat jika belum ada
      if (!this.app.data.cutiTahunan.find(c => c.pegawaiId === pegawai.id)) {
        const hakCuti = this.app.calculateHakCutiTahunan(pegawai);
        this.app.data.cutiTahunan.push({
          pegawaiId: pegawai.id,
          tahun: currentYear,
          saldoAwal: 0,
          hakCuti: hakCuti,
          diambil: 0,
          sisa: hakCuti,
          riwayat: []
        });
      }

      // Cuti Sakit - buat jika belum ada
      if (!this.app.data.cutiSakit.find(c => c.pegawaiId === pegawai.id)) {
        this.app.data.cutiSakit.push({
          pegawaiId: pegawai.id,
          tahun: currentYear,
          totalHari: 0,
          batasNormal: 14,
          kelebihan: 0,
          potongan: 0,
          riwayat: []
        });
      }

      // Cuti Besar - buat jika belum ada
      if (!this.app.data.cutiBesar.find(c => c.pegawaiId === pegawai.id)) {
        const masaKerja = this.app.calculateMasaKerja(pegawai.tglMasuk);
        this.app.data.cutiBesar.push({
          pegawaiId: pegawai.id,
          masaKerja: masaKerja,
          hakCutiBesar: Math.floor(masaKerja / 6),
          terakhirDiambil: null,
          statusKelayakan: masaKerja >= 6 ? 'Layak' : 'Belum Layak'
        });
      }

      // Cuti Melahirkan - buat jika belum ada (hanya untuk perempuan)
      if (pegawai.jenisKelamin === 'P' && !this.app.data.cutiMelahirkan.find(c => c.pegawaiId === pegawai.id)) {
        this.app.data.cutiMelahirkan.push({
          pegawaiId: pegawai.id,
          tahun: currentYear,
          tanggalMulai: null,
          tanggalSelesai: null,
          lamaHari: 0,
          status: 'Belum Ada'
        });
      }

      // Cuti Penting - buat jika belum ada
      if (!this.app.data.cutiPenting.find(c => c.pegawaiId === pegawai.id)) {
        this.app.data.cutiPenting.push({
          pegawaiId: pegawai.id,
          tahun: currentYear,
          totalHari: 0,
          batasMaksimal: 30,
          sisaHak: 30,
          alasanTerakhir: '-',
          riwayat: []
        });
      }
    });
    
    console.log(`Berhasil melengkapi data cuti untuk ${this.app.data.pegawai.length} pegawai`);
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
    
    // Sheet 1: Data Pegawai
    const pegawaiData = [
      {
        'Nama': 'Dr. Ahmad Susanto, M.Si.',
        'NIP': '196801011994031001',
        'Golongan': 'III/a',
        'Jabatan': 'Kepala Pusdiklatwas',
        'Tanggal_Masuk': '1994-03-01',
        'Jenis_Kelamin': 'L'
      },
      {
        'Nama': 'Dra. Siti Nurhaliza, M.M.',
        'NIP': '197205151998032001',
        'Golongan': 'III/b',
        'Jabatan': 'Kepala Subbag Kepegawaian',
        'Tanggal_Masuk': '1998-03-15',
        'Jenis_Kelamin': 'P'
      }
    ];
    const pegawaiWS = XLSX.utils.json_to_sheet(pegawaiData);
    XLSX.utils.book_append_sheet(wb, pegawaiWS, 'Pegawai');
    
    // Sheet 2: Cuti Tahunan (opsional)
    const cutiTahunanData = [
      {
        'NIP': '196801011994031001',
        'Tahun': 2025,
        'Saldo_Awal': 5,
        'Hak_Cuti': 21,
        'Diambil': 8,
        'Sisa': 18,
        'Riwayat': ''
      }
    ];
    const cutiTahunanWS = XLSX.utils.json_to_sheet(cutiTahunanData);
    XLSX.utils.book_append_sheet(wb, cutiTahunanWS, 'Cuti_Tahunan');
    
    // Sheet 3: Cuti Sakit (opsional)
    const cutiSakitData = [
      {
        'NIP': '196801011994031001',
        'Tahun': 2025,
        'Total_Hari': 5,
        'Riwayat': ''
      }
    ];
    const cutiSakitWS = XLSX.utils.json_to_sheet(cutiSakitData);
    XLSX.utils.book_append_sheet(wb, cutiSakitWS, 'Cuti_Sakit');
    
    // Sheet 4: Cuti Besar (opsional)
    const cutiBesarData = [
      {
        'NIP': '196801011994031001',
        'Terakhir_Diambil': '2018-01-01'
      }
    ];
    const cutiBesarWS = XLSX.utils.json_to_sheet(cutiBesarData);
    XLSX.utils.book_append_sheet(wb, cutiBesarWS, 'Cuti_Besar');
    
    // Sheet 5: Cuti Melahirkan (opsional)
    const cutiMelahirkanData = [
      {
        'NIP': '197205151998032001',
        'Tahun': 2025,
        'Tanggal_Mulai': '2025-01-01',
        'Tanggal_Selesai': '2025-03-31',
        'Lama_Hari': 90,
        'Status': 'Selesai'
      }
    ];
    const cutiMelahirkanWS = XLSX.utils.json_to_sheet(cutiMelahirkanData);
    XLSX.utils.book_append_sheet(wb, cutiMelahirkanWS, 'Cuti_Melahirkan');
    
    // Sheet 6: Cuti Penting (opsional)
    const cutiPentingData = [
      {
        'NIP': '196801011994031001',
        'Tahun': 2025,
        'Total_Hari': 3,
        'Alasan_Terakhir': 'Urusan keluarga',
        'Riwayat': ''
      }
    ];
    const cutiPentingWS = XLSX.utils.json_to_sheet(cutiPentingData);
    XLSX.utils.book_append_sheet(wb, cutiPentingWS, 'Cuti_Penting');
    
    // Download file
    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Template_Data_Cuti_Pusdiklatwas_${timestamp}.xlsx`);
  }

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