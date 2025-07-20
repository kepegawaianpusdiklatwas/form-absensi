// Aplikasi Rekap Cuti Pegawai
class CutiApp {
  constructor() {
    this.data = {
      pegawai: [],
      cutiTahunan: [],
      cutiSakit: [],
      cutiBesar: [],
      cutiMelahirkan: [],
      cutiPenting: []
    };
    
    this.tahunAktif = new Date().getFullYear();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadSampleData();
    this.updateDashboard();
  }

  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Tahun selector
    document.getElementById('tahun-aktif').addEventListener('change', (e) => {
      this.tahunAktif = parseInt(e.target.value);
      this.updateDashboard();
      this.refreshAllTables();
    });

    // Search functionality
    this.setupSearchListeners();

    // Export buttons
    this.setupExportListeners();

    // Modal close
    document.querySelector('.modal-close').addEventListener('click', () => {
      this.closeModal();
    });

    // Click outside modal to close
    document.getElementById('modal-detail').addEventListener('click', (e) => {
      if (e.target.id === 'modal-detail') {
        this.closeModal();
      }
    });
  }

  switchTab(tabName) {
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update active content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    // Load specific tab data
    this.loadTabData(tabName);
  }

  loadTabData(tabName) {
    switch(tabName) {
      case 'dashboard':
        this.updateDashboard();
        break;
      case 'cuti-tahunan':
        this.loadCutiTahunanTable();
        break;
      case 'cuti-sakit':
        this.loadCutiSakitTable();
        break;
      case 'cuti-besar':
        this.loadCutiBesarTable();
        break;
      case 'cuti-melahirkan':
        this.loadCutiMelahirkanTable();
        break;
      case 'cuti-penting':
        this.loadCutiPentingTable();
        break;
      case 'laporan':
        this.loadLaporanCharts();
        break;
    }
  }

  setupSearchListeners() {
    const searchInputs = [
      'search-tahunan',
      'search-sakit', 
      'search-besar',
      'search-melahirkan',
      'search-penting'
    ];

    searchInputs.forEach(inputId => {
      const input = document.getElementById(inputId);
      if (input) {
        input.addEventListener('input', (e) => {
          this.filterTable(inputId.replace('search-', ''), e.target.value);
        });
      }
    });
  }

  setupExportListeners() {
    const exportButtons = [
      'export-tahunan',
      'export-sakit',
      'export-besar', 
      'export-melahirkan',
      'export-penting'
    ];

    exportButtons.forEach(buttonId => {
      const button = document.getElementById(buttonId);
      if (button) {
        button.addEventListener('click', () => {
          this.exportData(buttonId.replace('export-', ''));
        });
      }
    });

    // Generate laporan
    document.getElementById('generate-laporan')?.addEventListener('click', () => {
      this.generateLaporan();
    });
  }

  loadSampleData() {
    // Sample data untuk demonstrasi
    this.data.pegawai = [
      {
        id: 1,
        nama: 'Ahmad Suryadi',
        nip: '198501012010011001',
        golongan: 'III/c',
        jabatan: 'Auditor Ahli Muda',
        tglMasuk: '2010-01-01',
        jenisKelamin: 'L'
      },
      {
        id: 2,
        nama: 'Siti Nurhaliza',
        nip: '198703152012012002',
        golongan: 'III/b',
        jabatan: 'Auditor Terampil',
        tglMasuk: '2012-03-15',
        jenisKelamin: 'P'
      },
      {
        id: 3,
        nama: 'Budi Santoso',
        nip: '198205102008011003',
        golongan: 'III/d',
        jabatan: 'Auditor Ahli Madya',
        tglMasuk: '2008-05-10',
        jenisKelamin: 'L'
      },
      {
        id: 4,
        nama: 'Dewi Sartika',
        nip: '199002202015012004',
        golongan: 'III/a',
        jabatan: 'Auditor Terampil',
        tglMasuk: '2015-02-20',
        jenisKelamin: 'P'
      },
      {
        id: 5,
        nama: 'Eko Prasetyo',
        nip: '197812051999031005',
        golongan: 'IV/a',
        jabatan: 'Auditor Ahli Utama',
        tglMasuk: '1999-12-05',
        jenisKelamin: 'L'
      }
    ];

    // Generate sample cuti data
    this.generateSampleCutiData();
  }

  generateSampleCutiData() {
    const currentYear = this.tahunAktif;
    
    this.data.pegawai.forEach(pegawai => {
      // Cuti Tahunan
      const hakCuti = this.calculateHakCutiTahunan(pegawai);
      const cutiDiambil = Math.floor(Math.random() * hakCuti);
      
      this.data.cutiTahunan.push({
        pegawaiId: pegawai.id,
        tahun: currentYear,
        saldoAwal: Math.floor(Math.random() * 6), // Sisa tahun lalu
        hakCuti: hakCuti,
        diambil: cutiDiambil,
        sisa: hakCuti - cutiDiambil,
        riwayat: this.generateRiwayatCuti(pegawai.id, 'tahunan', cutiDiambil)
      });

      // Cuti Sakit
      const cutiSakit = Math.floor(Math.random() * 20);
      this.data.cutiSakit.push({
        pegawaiId: pegawai.id,
        tahun: currentYear,
        totalHari: cutiSakit,
        batasNormal: 14,
        kelebihan: Math.max(0, cutiSakit - 14),
        potongan: this.calculatePotonganSakit(cutiSakit),
        riwayat: this.generateRiwayatCuti(pegawai.id, 'sakit', cutiSakit)
      });

      // Cuti Besar
      const masaKerja = this.calculateMasaKerja(pegawai.tglMasuk);
      this.data.cutiBesar.push({
        pegawaiId: pegawai.id,
        masaKerja: masaKerja,
        hakCutiBesar: Math.floor(masaKerja / 6),
        terakhirDiambil: masaKerja >= 6 ? '2020-01-01' : null,
        statusKelayakan: masaKerja >= 6 && (masaKerja % 6 === 0) ? 'Layak' : 'Belum Layak'
      });

      // Cuti Melahirkan (hanya untuk perempuan)
      if (pegawai.jenisKelamin === 'P') {
        this.data.cutiMelahirkan.push({
          pegawaiId: pegawai.id,
          tahun: currentYear,
          tanggalMulai: Math.random() > 0.7 ? '2025-03-01' : null,
          tanggalSelesai: Math.random() > 0.7 ? '2025-05-30' : null,
          lamaHari: Math.random() > 0.7 ? 90 : 0,
          status: Math.random() > 0.7 ? 'Sedang Cuti' : 'Tidak Ada'
        });
      }

      // Cuti Alasan Penting
      const cutiPenting = Math.floor(Math.random() * 15);
      this.data.cutiPenting.push({
        pegawaiId: pegawai.id,
        tahun: currentYear,
        totalHari: cutiPenting,
        batasMaksimal: 30,
        sisaHak: 30 - cutiPenting,
        alasanTerakhir: cutiPenting > 0 ? 'Urusan keluarga' : '-',
        riwayat: this.generateRiwayatCuti(pegawai.id, 'penting', cutiPenting)
      });
    });
  }

  calculateHakCutiTahunan(pegawai) {
    const masaKerja = this.calculateMasaKerja(pegawai.tglMasuk);
    if (masaKerja < 1) return 12;
    if (masaKerja < 5) return 12;
    if (masaKerja < 10) return 15;
    if (masaKerja < 20) return 18;
    return 21;
  }

  calculateMasaKerja(tglMasuk) {
    const masuk = new Date(tglMasuk);
    const sekarang = new Date();
    return Math.floor((sekarang - masuk) / (365.25 * 24 * 60 * 60 * 1000));
  }

  calculatePotonganSakit(hariSakit) {
    if (hariSakit <= 14) return 0;
    const kelebihan = hariSakit - 14;
    if (kelebihan <= 30) return kelebihan * 0.5; // 50% gaji
    return 30 * 0.5 + (kelebihan - 30) * 1; // 100% gaji
  }

  generateRiwayatCuti(pegawaiId, jenis, totalHari) {
    const riwayat = [];
    let sisaHari = totalHari;
    
    while (sisaHari > 0) {
      const lamaCuti = Math.min(sisaHari, Math.floor(Math.random() * 7) + 1);
      const tanggalMulai = new Date(this.tahunAktif, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const tanggalSelesai = new Date(tanggalMulai);
      tanggalSelesai.setDate(tanggalSelesai.getDate() + lamaCuti - 1);
      
      riwayat.push({
        tanggalMulai: tanggalMulai.toISOString().split('T')[0],
        tanggalSelesai: tanggalSelesai.toISOString().split('T')[0],
        lamaCuti: lamaCuti,
        keterangan: this.getKeteranganCuti(jenis)
      });
      
      sisaHari -= lamaCuti;
    }
    
    return riwayat;
  }

  getKeteranganCuti(jenis) {
    const keterangan = {
      tahunan: ['Liburan keluarga', 'Istirahat', 'Acara keluarga', 'Refreshing'],
      sakit: ['Demam', 'Flu', 'Sakit kepala', 'Masuk angin', 'Kontrol dokter'],
      penting: ['Urusan keluarga', 'Acara pernikahan', 'Pemakaman', 'Urusan hukum']
    };
    
    const list = keterangan[jenis] || ['Keperluan pribadi'];
    return list[Math.floor(Math.random() * list.length)];
  }

  updateDashboard() {
    // Update stats cards
    document.getElementById('total-pegawai').textContent = this.data.pegawai.length;
    
    const totalCutiDiambil = this.data.cutiTahunan.reduce((sum, item) => sum + item.diambil, 0);
    document.getElementById('total-cuti-diambil').textContent = totalCutiDiambil;
    
    const totalSaldoCuti = this.data.cutiTahunan.reduce((sum, item) => sum + item.sisa, 0);
    document.getElementById('total-saldo-cuti').textContent = totalSaldoCuti;
    
    const perluPerhatian = this.data.cutiSakit.filter(item => item.kelebihan > 0).length;
    document.getElementById('total-perhatian').textContent = perluPerhatian;
  }

  loadCutiTahunanTable() {
    const tbody = document.querySelector('#table-cuti-tahunan tbody');
    tbody.innerHTML = '';
    
    this.data.cutiTahunan.forEach((item, index) => {
      const pegawai = this.data.pegawai.find(p => p.id === item.pegawaiId);
      const persentaseUsage = (item.diambil / item.hakCuti * 100).toFixed(1);
      
      let statusClass = 'status-normal';
      let statusText = 'Normal';
      
      if (persentaseUsage > 80) {
        statusClass = 'status-warning';
        statusText = 'Hampir Habis';
      }
      if (item.sisa === 0) {
        statusClass = 'status-danger';
        statusText = 'Habis';
      }
      
      const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${pegawai.nama}</td>
          <td>${pegawai.nip}</td>
          <td>${item.saldoAwal}</td>
          <td>${item.hakCuti}</td>
          <td>${item.diambil}</td>
          <td>${item.sisa}</td>
          <td><span class="status-badge ${statusClass}">${statusText}</span></td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="app.showDetail('tahunan', ${item.pegawaiId})">
              <i class="fas fa-eye mr-1"></i>Detail
            </button>
          </td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  }

  loadCutiSakitTable() {
    const tbody = document.querySelector('#table-cuti-sakit tbody');
    tbody.innerHTML = '';
    
    this.data.cutiSakit.forEach((item, index) => {
      const pegawai = this.data.pegawai.find(p => p.id === item.pegawaiId);
      
      let statusClass = 'status-normal';
      let statusText = 'Normal';
      
      if (item.kelebihan > 0) {
        statusClass = 'status-warning';
        statusText = 'Ada Potongan';
      }
      if (item.totalHari > 30) {
        statusClass = 'status-danger';
        statusText = 'Berlebihan';
      }
      
      const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${pegawai.nama}</td>
          <td>${pegawai.nip}</td>
          <td>${item.totalHari}</td>
          <td>${item.batasNormal}</td>
          <td>${item.kelebihan}</td>
          <td>${item.potongan.toFixed(1)} hari</td>
          <td><span class="status-badge ${statusClass}">${statusText}</span></td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="app.showDetail('sakit', ${item.pegawaiId})">
              <i class="fas fa-eye mr-1"></i>Detail
            </button>
          </td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  }

  loadCutiBesarTable() {
    const tbody = document.querySelector('#table-cuti-besar tbody');
    tbody.innerHTML = '';
    
    this.data.cutiBesar.forEach((item, index) => {
      const pegawai = this.data.pegawai.find(p => p.id === item.pegawaiId);
      
      const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${pegawai.nama}</td>
          <td>${pegawai.nip}</td>
          <td>${item.masaKerja} tahun</td>
          <td>${item.hakCutiBesar} kali</td>
          <td>${item.terakhirDiambil || '-'}</td>
          <td>
            <span class="status-badge ${item.statusKelayakan === 'Layak' ? 'status-normal' : 'status-info'}">
              ${item.statusKelayakan}
            </span>
          </td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="app.showDetail('besar', ${item.pegawaiId})">
              <i class="fas fa-eye mr-1"></i>Detail
            </button>
          </td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  }

  loadCutiMelahirkanTable() {
    const tbody = document.querySelector('#table-cuti-melahirkan tbody');
    tbody.innerHTML = '';
    
    this.data.cutiMelahirkan.forEach((item, index) => {
      const pegawai = this.data.pegawai.find(p => p.id === item.pegawaiId);
      
      let statusClass = 'status-info';
      if (item.status === 'Sedang Cuti') statusClass = 'status-warning';
      
      const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${pegawai.nama}</td>
          <td>${pegawai.nip}</td>
          <td>${item.tanggalMulai || '-'}</td>
          <td>${item.tanggalSelesai || '-'}</td>
          <td>${item.lamaHari}</td>
          <td><span class="status-badge ${statusClass}">${item.status}</span></td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="app.showDetail('melahirkan', ${item.pegawaiId})">
              <i class="fas fa-eye mr-1"></i>Detail
            </button>
          </td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  }

  loadCutiPentingTable() {
    const tbody = document.querySelector('#table-cuti-penting tbody');
    tbody.innerHTML = '';
    
    this.data.cutiPenting.forEach((item, index) => {
      const pegawai = this.data.pegawai.find(p => p.id === item.pegawaiId);
      
      let statusClass = 'status-normal';
      let statusText = 'Normal';
      
      if (item.totalHari > 20) {
        statusClass = 'status-warning';
        statusText = 'Mendekati Batas';
      }
      if (item.totalHari >= 30) {
        statusClass = 'status-danger';
        statusText = 'Mencapai Batas';
      }
      
      const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${pegawai.nama}</td>
          <td>${pegawai.nip}</td>
          <td>${item.totalHari}</td>
          <td>${item.batasMaksimal}</td>
          <td>${item.sisaHak}</td>
          <td>${item.alasanTerakhir}</td>
          <td><span class="status-badge ${statusClass}">${statusText}</span></td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="app.showDetail('penting', ${item.pegawaiId})">
              <i class="fas fa-eye mr-1"></i>Detail
            </button>
          </td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  }

  showDetail(jenisCuti, pegawaiId) {
    const pegawai = this.data.pegawai.find(p => p.id === pegawaiId);
    const modal = document.getElementById('modal-detail');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = `Detail Cuti ${this.getJenisCutiLabel(jenisCuti)} - ${pegawai.nama}`;
    
    let content = '';
    let cutiData = null;
    
    switch(jenisCuti) {
      case 'tahunan':
        cutiData = this.data.cutiTahunan.find(c => c.pegawaiId === pegawaiId);
        content = this.generateDetailTahunan(pegawai, cutiData);
        break;
      case 'sakit':
        cutiData = this.data.cutiSakit.find(c => c.pegawaiId === pegawaiId);
        content = this.generateDetailSakit(pegawai, cutiData);
        break;
      case 'besar':
        cutiData = this.data.cutiBesar.find(c => c.pegawaiId === pegawaiId);
        content = this.generateDetailBesar(pegawai, cutiData);
        break;
      case 'melahirkan':
        cutiData = this.data.cutiMelahirkan.find(c => c.pegawaiId === pegawaiId);
        content = this.generateDetailMelahirkan(pegawai, cutiData);
        break;
      case 'penting':
        cutiData = this.data.cutiPenting.find(c => c.pegawaiId === pegawaiId);
        content = this.generateDetailPenting(pegawai, cutiData);
        break;
    }
    
    modalBody.innerHTML = content;
    modal.classList.add('active');
  }

  generateDetailTahunan(pegawai, cutiData) {
    let riwayatHtml = '';
    if (cutiData.riwayat && cutiData.riwayat.length > 0) {
      riwayatHtml = cutiData.riwayat.map((riwayat, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${this.formatTanggal(riwayat.tanggalMulai)}</td>
          <td>${this.formatTanggal(riwayat.tanggalSelesai)}</td>
          <td>${riwayat.lamaCuti}</td>
          <td>${riwayat.keterangan}</td>
        </tr>
      `).join('');
    } else {
      riwayatHtml = '<tr><td colspan="5" class="text-center">Belum ada riwayat cuti</td></tr>';
    }
    
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 class="font-semibold mb-3">Informasi Pegawai</h4>
          <table class="w-full text-sm">
            <tr><td class="py-1 font-medium">Nama:</td><td>${pegawai.nama}</td></tr>
            <tr><td class="py-1 font-medium">NIP:</td><td>${pegawai.nip}</td></tr>
            <tr><td class="py-1 font-medium">Golongan:</td><td>${pegawai.golongan}</td></tr>
            <tr><td class="py-1 font-medium">Jabatan:</td><td>${pegawai.jabatan}</td></tr>
          </table>
        </div>
        <div>
          <h4 class="font-semibold mb-3">Ringkasan Cuti Tahunan ${this.tahunAktif}</h4>
          <table class="w-full text-sm">
            <tr><td class="py-1 font-medium">Saldo Awal:</td><td>${cutiData.saldoAwal} hari</td></tr>
            <tr><td class="py-1 font-medium">Hak Cuti:</td><td>${cutiData.hakCuti} hari</td></tr>
            <tr><td class="py-1 font-medium">Total Tersedia:</td><td>${cutiData.saldoAwal + cutiData.hakCuti} hari</td></tr>
            <tr><td class="py-1 font-medium">Diambil:</td><td>${cutiData.diambil} hari</td></tr>
            <tr><td class="py-1 font-medium">Sisa:</td><td class="font-bold text-blue-600">${cutiData.sisa} hari</td></tr>
          </table>
        </div>
      </div>
      
      <h4 class="font-semibold mb-3">Riwayat Pengambilan Cuti</h4>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal Mulai</th>
              <th>Tanggal Selesai</th>
              <th>Lama (Hari)</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            ${riwayatHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  generateDetailSakit(pegawai, cutiData) {
    let riwayatHtml = '';
    if (cutiData.riwayat && cutiData.riwayat.length > 0) {
      riwayatHtml = cutiData.riwayat.map((riwayat, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${this.formatTanggal(riwayat.tanggalMulai)}</td>
          <td>${this.formatTanggal(riwayat.tanggalSelesai)}</td>
          <td>${riwayat.lamaCuti}</td>
          <td>${riwayat.keterangan}</td>
        </tr>
      `).join('');
    } else {
      riwayatHtml = '<tr><td colspan="5" class="text-center">Belum ada riwayat cuti sakit</td></tr>';
    }
    
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 class="font-semibold mb-3">Informasi Pegawai</h4>
          <table class="w-full text-sm">
            <tr><td class="py-1 font-medium">Nama:</td><td>${pegawai.nama}</td></tr>
            <tr><td class="py-1 font-medium">NIP:</td><td>${pegawai.nip}</td></tr>
            <tr><td class="py-1 font-medium">Golongan:</td><td>${pegawai.golongan}</td></tr>
            <tr><td class="py-1 font-medium">Jabatan:</td><td>${pegawai.jabatan}</td></tr>
          </table>
        </div>
        <div>
          <h4 class="font-semibold mb-3">Ringkasan Cuti Sakit ${this.tahunAktif}</h4>
          <table class="w-full text-sm">
            <tr><td class="py-1 font-medium">Total Hari Sakit:</td><td>${cutiData.totalHari} hari</td></tr>
            <tr><td class="py-1 font-medium">Batas Normal:</td><td>${cutiData.batasNormal} hari</td></tr>
            <tr><td class="py-1 font-medium">Kelebihan:</td><td class="${cutiData.kelebihan > 0 ? 'text-red-600 font-bold' : ''}">${cutiData.kelebihan} hari</td></tr>
            <tr><td class="py-1 font-medium">Potongan Gaji:</td><td class="${cutiData.potongan > 0 ? 'text-red-600 font-bold' : ''}">${cutiData.potongan.toFixed(1)} hari</td></tr>
          </table>
        </div>
      </div>
      
      ${cutiData.kelebihan > 0 ? `
        <div class="alert alert-warning mb-4">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          Pegawai ini telah melebihi batas normal cuti sakit dan akan mendapat potongan gaji sebesar ${cutiData.potongan.toFixed(1)} hari.
        </div>
      ` : ''}
      
      <h4 class="font-semibold mb-3">Riwayat Cuti Sakit</h4>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal Mulai</th>
              <th>Tanggal Selesai</th>
              <th>Lama (Hari)</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            ${riwayatHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  generateDetailBesar(pegawai, cutiData) {
    const sisaTahun = 6 - (cutiData.masaKerja % 6);
    const tahunBerikutnya = new Date().getFullYear() + sisaTahun;
    
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 class="font-semibold mb-3">Informasi Pegawai</h4>
          <table class="w-full text-sm">
            <tr><td class="py-1 font-medium">Nama:</td><td>${pegawai.nama}</td></tr>
            <tr><td class="py-1 font-medium">NIP:</td><td>${pegawai.nip}</td></tr>
            <tr><td class="py-1 font-medium">Golongan:</td><td>${pegawai.golongan}</td></tr>
            <tr><td class="py-1 font-medium">Jabatan:</td><td>${pegawai.jabatan}</td></tr>
            <tr><td class="py-1 font-medium">Tanggal Masuk:</td><td>${this.formatTanggal(pegawai.tglMasuk)}</td></tr>
          </table>
        </div>
        <div>
          <h4 class="font-semibold mb-3">Status Cuti Besar</h4>
          <table class="w-full text-sm">
            <tr><td class="py-1 font-medium">Masa Kerja:</td><td>${cutiData.masaKerja} tahun</td></tr>
            <tr><td class="py-1 font-medium">Hak Cuti Besar:</td><td>${cutiData.hakCutiBesar} kali</td></tr>
            <tr><td class="py-1 font-medium">Terakhir Diambil:</td><td>${cutiData.terakhirDiambil ? this.formatTanggal(cutiData.terakhirDiambil) : 'Belum pernah'}</td></tr>
            <tr><td class="py-1 font-medium">Status:</td><td class="${cutiData.statusKelayakan === 'Layak' ? 'text-green-600 font-bold' : 'text-gray-600'}">${cutiData.statusKelayakan}</td></tr>
          </table>
        </div>
      </div>
      
      <div class="alert ${cutiData.statusKelayakan === 'Layak' ? 'alert-success' : 'alert-info'} mb-4">
        <i class="fas ${cutiData.statusKelayakan === 'Layak' ? 'fa-check-circle' : 'fa-info-circle'} mr-2"></i>
        ${cutiData.statusKelayakan === 'Layak' 
          ? 'Pegawai ini layak mengambil cuti besar selama 3 bulan (90 hari).'
          : `Pegawai ini akan layak mengambil cuti besar pada tahun ${tahunBerikutnya} (${sisaTahun} tahun lagi).`
        }
      </div>
      
      <h4 class="font-semibold mb-3">Ketentuan Cuti Besar</h4>
      <ul class="list-disc list-inside space-y-2 text-sm text-gray-600">
        <li>Cuti besar diberikan kepada PNS yang telah bekerja secara terus-menerus selama 6 tahun</li>
        <li>Lamanya cuti besar adalah 3 bulan atau 90 hari</li>
        <li>Cuti besar dapat diambil sekaligus atau bertahap</li>
        <li>Selama cuti besar, PNS tetap menerima gaji penuh</li>
        <li>Cuti besar tidak dapat ditunda ke tahun berikutnya</li>
      </ul>
    `;
  }

  generateDetailMelahirkan(pegawai, cutiData) {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 class="font-semibold mb-3">Informasi Pegawai</h4>
          <table class="w-full text-sm">
            <tr><td class="py-1 font-medium">Nama:</td><td>${pegawai.nama}</td></tr>
            <tr><td class="py-1 font-medium">NIP:</td><td>${pegawai.nip}</td></tr>
            <tr><td class="py-1 font-medium">Golongan:</td><td>${pegawai.golongan}</td></tr>
            <tr><td class="py-1 font-medium">Jabatan:</td><td>${pegawai.jabatan}</td></tr>
          </table>
        </div>
        <div>
          <h4 class="font-semibold mb-3">Status Cuti Melahirkan ${this.tahunAktif}</h4>
          <table class="w-full text-sm">
            <tr><td class="py-1 font-medium">Tanggal Mulai:</td><td>${cutiData.tanggalMulai ? this.formatTanggal(cutiData.tanggalMulai) : '-'}</td></tr>
            <tr><td class="py-1 font-medium">Tanggal Selesai:</td><td>${cutiData.tanggalSelesai ? this.formatTanggal(cutiData.tanggalSelesai) : '-'}</td></tr>
            <tr><td class="py-1 font-medium">Lama Cuti:</td><td>${cutiData.lamaHari} hari</td></tr>
            <tr><td class="py-1 font-medium">Status:</td><td class="${cutiData.status === 'Sedang Cuti' ? 'text-orange-600 font-bold' : 'text-gray-600'}">${cutiData.status}</td></tr>
          </table>
        </div>
      </div>
      
      <div class="alert alert-info mb-4">
        <i class="fas fa-info-circle mr-2"></i>
        Cuti melahirkan diberikan selama 3 bulan (90 hari) untuk pegawai wanita yang melahirkan.
      </div>
      
      <h4 class="font-semibold mb-3">Ketentuan Cuti Melahirkan</h4>
      <ul class="list-disc list-inside space-y-2 text-sm text-gray-600">
        <li>Cuti melahirkan diberikan selama 3 bulan atau 90 hari</li>
        <li>Dapat diambil 1,5 bulan sebelum dan 1,5 bulan sesudah melahirkan</li>
        <li>Selama cuti melahirkan, pegawai tetap menerima gaji penuh</li>
        <li>Wajib melampirkan surat keterangan dokter</li>
        <li>Dapat diperpanjang atas rekomendasi dokter</li>
      </ul>
    `;
  }

  generateDetailPenting(pegawai, cutiData) {
    let riwayatHtml = '';
    if (cutiData.riwayat && cutiData.riwayat.length > 0) {
      riwayatHtml = cutiData.riwayat.map((riwayat, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${this.formatTanggal(riwayat.tanggalMulai)}</td>
          <td>${this.formatTanggal(riwayat.tanggalSelesai)}</td>
          <td>${riwayat.lamaCuti}</td>
          <td>${riwayat.keterangan}</td>
        </tr>
      `).join('');
    } else {
      riwayatHtml = '<tr><td colspan="5" class="text-center">Belum ada riwayat cuti alasan penting</td></tr>';
    }
    
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 class="font-semibold mb-3">Informasi Pegawai</h4>
          <table class="w-full text-sm">
            <tr><td class="py-1 font-medium">Nama:</td><td>${pegawai.nama}</td></tr>
            <tr><td class="py-1 font-medium">NIP:</td><td>${pegawai.nip}</td></tr>
            <tr><td class="py-1 font-medium">Golongan:</td><td>${pegawai.golongan}</td></tr>
            <tr><td class="py-1 font-medium">Jabatan:</td><td>${pegawai.jabatan}</td></tr>
          </table>
        </div>
        <div>
          <h4 class="font-semibold mb-3">Ringkasan Cuti Alasan Penting ${this.tahunAktif}</h4>
          <table class="w-full text-sm">
            <tr><td class="py-1 font-medium">Total Diambil:</td><td>${cutiData.totalHari} hari</td></tr>
            <tr><td class="py-1 font-medium">Batas Maksimal:</td><td>${cutiData.batasMaksimal} hari</td></tr>
            <tr><td class="py-1 font-medium">Sisa Hak:</td><td class="${cutiData.sisaHak <= 5 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}">${cutiData.sisaHak} hari</td></tr>
            <tr><td class="py-1 font-medium">Alasan Terakhir:</td><td>${cutiData.alasanTerakhir}</td></tr>
          </table>
        </div>
      </div>
      
      ${cutiData.sisaHak <= 5 ? `
        <div class="alert alert-warning mb-4">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          Sisa hak cuti alasan penting tinggal ${cutiData.sisaHak} hari. Harap gunakan dengan bijak.
        </div>
      ` : ''}
      
      <h4 class="font-semibold mb-3">Riwayat Cuti Alasan Penting</h4>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal Mulai</th>
              <th>Tanggal Selesai</th>
              <th>Lama (Hari)</th>
              <th>Alasan</th>
            </tr>
          </thead>
          <tbody>
            ${riwayatHtml}
          </tbody>
        </table>
      </div>
      
      <h4 class="font-semibold mb-3 mt-6">Ketentuan Cuti Alasan Penting</h4>
      <ul class="list-disc list-inside space-y-2 text-sm text-gray-600">
        <li>Maksimal 30 hari dalam satu tahun</li>
        <li>Untuk keperluan yang sangat penting dan mendesak</li>
        <li>Harus mendapat persetujuan atasan langsung</li>
        <li>Wajib melampirkan bukti pendukung</li>
        <li>Tidak dapat ditunda atau diakumulasi ke tahun berikutnya</li>
      </ul>
    `;
  }

  getJenisCutiLabel(jenis) {
    const labels = {
      'tahunan': 'Tahunan',
      'sakit': 'Sakit',
      'besar': 'Besar',
      'melahirkan': 'Melahirkan',
      'penting': 'Alasan Penting'
    };
    return labels[jenis] || jenis;
  }

  closeModal() {
    document.getElementById('modal-detail').classList.remove('active');
  }

  formatTanggal(tanggal) {
    const date = new Date(tanggal);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Asia/Jakarta'
    };
    return date.toLocaleDateString('id-ID', options);
  }

  filterTable(jenis, searchTerm) {
    const tableId = `table-cuti-${jenis}`;
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const shouldShow = text.includes(searchTerm.toLowerCase());
      row.style.display = shouldShow ? '' : 'none';
    });
  }

  exportData(jenis) {
    // Implementasi export data
    console.log(`Exporting ${jenis} data...`);
    // Akan diimplementasikan di reports.js
  }

  generateLaporan() {
    const jenisLaporan = document.getElementById('jenis-laporan').value;
    const formatLaporan = document.getElementById('format-laporan').value;
    
    console.log(`Generating ${jenisLaporan} report in ${formatLaporan} format...`);
    // Akan diimplementasikan di reports.js
  }

  refreshAllTables() {
    this.loadCutiTahunanTable();
    this.loadCutiSakitTable();
    this.loadCutiBesarTable();
    this.loadCutiMelahirkanTable();
    this.loadCutiPentingTable();
  }

  loadLaporanCharts() {
    // Akan diimplementasikan di charts.js
    console.log('Loading laporan charts...');
  }
}

// Initialize app
const app = new CutiApp();

// Make app globally available
window.app = app;