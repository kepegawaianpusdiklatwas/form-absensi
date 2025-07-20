// Report Generator untuk berbagai format laporan
class ReportGenerator {
  constructor(app) {
    this.app = app;
    this.setupReportHandlers();
  }

  setupReportHandlers() {
    // Export buttons untuk setiap jenis cuti
    document.getElementById('export-tahunan')?.addEventListener('click', () => {
      this.exportCutiTahunan();
    });

    document.getElementById('export-sakit')?.addEventListener('click', () => {
      this.exportCutiSakit();
    });

    document.getElementById('export-besar')?.addEventListener('click', () => {
      this.exportCutiBesar();
    });

    document.getElementById('export-melahirkan')?.addEventListener('click', () => {
      this.exportCutiMelahirkan();
    });

    document.getElementById('export-penting')?.addEventListener('click', () => {
      this.exportCutiPenting();
    });

    // Generate laporan komprehensif
    document.getElementById('generate-laporan')?.addEventListener('click', () => {
      this.generateLaporan();
    });
  }

  async exportCutiTahunan() {
    const data = this.prepareCutiTahunanData();
    await this.exportToExcel(data, 'Laporan_Cuti_Tahunan');
  }

  async exportCutiSakit() {
    const data = this.prepareCutiSakitData();
    await this.exportToExcel(data, 'Laporan_Cuti_Sakit');
  }

  async exportCutiBesar() {
    const data = this.prepareCutiBesarData();
    await this.exportToExcel(data, 'Laporan_Cuti_Besar');
  }

  async exportCutiMelahirkan() {
    const data = this.prepareCutiMelahirkanData();
    await this.exportToExcel(data, 'Laporan_Cuti_Melahirkan');
  }

  async exportCutiPenting() {
    const data = this.prepareCutiPentingData();
    await this.exportToExcel(data, 'Laporan_Cuti_Alasan_Penting');
  }

  prepareCutiTahunanData() {
    return this.app.data.cutiTahunan.map(item => {
      const pegawai = this.app.data.pegawai.find(p => p.id === item.pegawaiId);
      return {
        'Nama': pegawai.nama,
        'NIP': pegawai.nip,
        'Golongan': pegawai.golongan,
        'Jabatan': pegawai.jabatan,
        'Tahun': item.tahun,
        'Saldo Awal': item.saldoAwal,
        'Hak Cuti': item.hakCuti,
        'Total Tersedia': item.saldoAwal + item.hakCuti,
        'Diambil': item.diambil,
        'Sisa': item.sisa,
        'Persentase Penggunaan': ((item.diambil / item.hakCuti) * 100).toFixed(1) + '%',
        'Status': this.getStatusCutiTahunan(item)
      };
    });
  }

  prepareCutiSakitData() {
    return this.app.data.cutiSakit.map(item => {
      const pegawai = this.app.data.pegawai.find(p => p.id === item.pegawaiId);
      const calculator = new CutiCalculator();
      const potongan = calculator.calculatePotonganCutiSakit(item.totalHari);
      
      return {
        'Nama': pegawai.nama,
        'NIP': pegawai.nip,
        'Golongan': pegawai.golongan,
        'Jabatan': pegawai.jabatan,
        'Tahun': item.tahun,
        'Total Hari Sakit': item.totalHari,
        'Batas Normal': item.batasNormal,
        'Kelebihan': item.kelebihan,
        'Potongan 50%': potongan.hariPotongan50 || 0,
        'Potongan 100%': potongan.hariPotongan100 || 0,
        'Total Potongan': potongan.hariPotongan.toFixed(1),
        'Keterangan': potongan.keterangan,
        'Status': this.getStatusCutiSakit(item)
      };
    });
  }

  prepareCutiBesarData() {
    return this.app.data.cutiBesar.map(item => {
      const pegawai = this.app.data.pegawai.find(p => p.id === item.pegawaiId);
      const calculator = new CutiCalculator();
      const kelayakan = calculator.calculateKelayakanCutiBesar(pegawai.tglMasuk);
      
      return {
        'Nama': pegawai.nama,
        'NIP': pegawai.nip,
        'Golongan': pegawai.golongan,
        'Jabatan': pegawai.jabatan,
        'Tanggal Masuk': this.formatDate(pegawai.tglMasuk),
        'Masa Kerja (Tahun)': item.masaKerja,
        'Hak Cuti Besar': item.hakCutiBesar,
        'Terakhir Diambil': item.terakhirDiambil ? this.formatDate(item.terakhirDiambil) : 'Belum Pernah',
        'Status Kelayakan': item.statusKelayakan,
        'Tahun Berikutnya Layak': kelayakan.tahunBerikutnyaLayak || '-'
      };
    });
  }

  prepareCutiMelahirkanData() {
    return this.app.data.cutiMelahirkan.map(item => {
      const pegawai = this.app.data.pegawai.find(p => p.id === item.pegawaiId);
      
      return {
        'Nama': pegawai.nama,
        'NIP': pegawai.nip,
        'Golongan': pegawai.golongan,
        'Jabatan': pegawai.jabatan,
        'Tahun': item.tahun,
        'Tanggal Mulai': item.tanggalMulai ? this.formatDate(item.tanggalMulai) : '-',
        'Tanggal Selesai': item.tanggalSelesai ? this.formatDate(item.tanggalSelesai) : '-',
        'Lama (Hari)': item.lamaHari,
        'Status': item.status
      };
    });
  }

  prepareCutiPentingData() {
    return this.app.data.cutiPenting.map(item => {
      const pegawai = this.app.data.pegawai.find(p => p.id === item.pegawaiId);
      
      return {
        'Nama': pegawai.nama,
        'NIP': pegawai.nip,
        'Golongan': pegawai.golongan,
        'Jabatan': pegawai.jabatan,
        'Tahun': item.tahun,
        'Total Hari': item.totalHari,
        'Batas Maksimal': item.batasMaksimal,
        'Sisa Hak': item.sisaHak,
        'Persentase Penggunaan': ((item.totalHari / item.batasMaksimal) * 100).toFixed(1) + '%',
        'Alasan Terakhir': item.alasanTerakhir,
        'Status': this.getStatusCutiPenting(item)
      };
    });
  }

  async exportToExcel(data, filename) {
    if (!data || data.length === 0) {
      alert('Tidak ada data untuk diekspor');
      return;
    }

    // Show loading
    this.showLoading('Menyiapkan file Excel...');

    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Auto-size columns
      const colWidths = this.calculateColumnWidths(data);
      ws['!cols'] = colWidths;
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const fullFilename = `${filename}_${timestamp}.xlsx`;
      
      // Save file
      XLSX.writeFile(wb, fullFilename);
      
      this.showSuccess(`File ${fullFilename} berhasil diunduh!`);
      
    } catch (error) {
      console.error('Export error:', error);
      this.showError('Gagal mengekspor data: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  calculateColumnWidths(data) {
    if (!data || data.length === 0) return [];
    
    const keys = Object.keys(data[0]);
    return keys.map(key => {
      const maxLength = Math.max(
        key.length,
        ...data.map(row => String(row[key] || '').length)
      );
      return { width: Math.min(maxLength + 2, 50) };
    });
  }

  async generateLaporan() {
    const jenisLaporan = document.getElementById('jenis-laporan').value;
    const formatLaporan = document.getElementById('format-laporan').value;
    
    this.showLoading('Menyiapkan laporan...');
    
    try {
      let data;
      let filename;
      
      switch (jenisLaporan) {
        case 'semua':
          data = this.prepareComprehensiveReport();
          filename = 'Laporan_Cuti_Komprehensif';
          break;
        case 'tahunan':
          data = this.prepareCutiTahunanData();
          filename = 'Laporan_Cuti_Tahunan';
          break;
        case 'sakit':
          data = this.prepareCutiSakitData();
          filename = 'Laporan_Cuti_Sakit';
          break;
        case 'besar':
          data = this.prepareCutiBesarData();
          filename = 'Laporan_Cuti_Besar';
          break;
        case 'melahirkan':
          data = this.prepareCutiMelahirkanData();
          filename = 'Laporan_Cuti_Melahirkan';
          break;
        case 'penting':
          data = this.prepareCutiPentingData();
          filename = 'Laporan_Cuti_Alasan_Penting';
          break;
        default:
          throw new Error('Jenis laporan tidak valid');
      }
      
      switch (formatLaporan) {
        case 'excel':
          await this.exportToExcel(data, filename);
          break;
        case 'pdf':
          await this.exportToPDF(data, filename);
          break;
        case 'csv':
          await this.exportToCSV(data, filename);
          break;
        default:
          throw new Error('Format laporan tidak valid');
      }
      
    } catch (error) {
      console.error('Generate laporan error:', error);
      this.showError('Gagal membuat laporan: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  prepareComprehensiveReport() {
    const report = [];
    
    this.app.data.pegawai.forEach(pegawai => {
      const cutiTahunan = this.app.data.cutiTahunan.find(c => c.pegawaiId === pegawai.id);
      const cutiSakit = this.app.data.cutiSakit.find(c => c.pegawaiId === pegawai.id);
      const cutiBesar = this.app.data.cutiBesar.find(c => c.pegawaiId === pegawai.id);
      const cutiMelahirkan = this.app.data.cutiMelahirkan.find(c => c.pegawaiId === pegawai.id);
      const cutiPenting = this.app.data.cutiPenting.find(c => c.pegawaiId === pegawai.id);
      
      const calculator = new CutiCalculator();
      const potonganSakit = cutiSakit ? calculator.calculatePotonganCutiSakit(cutiSakit.totalHari) : null;
      
      report.push({
        'Nama': pegawai.nama,
        'NIP': pegawai.nip,
        'Golongan': pegawai.golongan,
        'Jabatan': pegawai.jabatan,
        'Masa Kerja': calculator.calculateMasaKerja(pegawai.tglMasuk) + ' tahun',
        
        // Cuti Tahunan
        'Hak Cuti Tahunan': cutiTahunan?.hakCuti || 0,
        'Cuti Tahunan Diambil': cutiTahunan?.diambil || 0,
        'Sisa Cuti Tahunan': cutiTahunan?.sisa || 0,
        
        // Cuti Sakit
        'Total Cuti Sakit': cutiSakit?.totalHari || 0,
        'Potongan Cuti Sakit': potonganSakit?.hariPotongan.toFixed(1) || '0',
        
        // Cuti Besar
        'Status Cuti Besar': cutiBesar?.statusKelayakan || 'Belum Layak',
        
        // Cuti Melahirkan
        'Cuti Melahirkan': cutiMelahirkan?.lamaHari || 0,
        
        // Cuti Penting
        'Cuti Alasan Penting': cutiPenting?.totalHari || 0,
        'Sisa Hak Cuti Penting': cutiPenting?.sisaHak || 30,
        
        // Total
        'Total Hari Cuti': (cutiTahunan?.diambil || 0) + (cutiSakit?.totalHari || 0) + 
                          (cutiMelahirkan?.lamaHari || 0) + (cutiPenting?.totalHari || 0)
      });
    });
    
    return report;
  }

  async exportToPDF(data, filename) {
    if (!window.jsPDF) {
      throw new Error('jsPDF library tidak tersedia');
    }
    
    const { jsPDF } = window.jsPDF;
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
    
    // Title
    doc.setFontSize(16);
    doc.text(filename.replace(/_/g, ' '), 20, 20);
    
    // Date
    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 20, 30);
    doc.text(`Tahun: ${this.app.tahunAktif}`, 20, 35);
    
    // Table
    if (data && data.length > 0) {
      const headers = Object.keys(data[0]);
      const rows = data.map(item => headers.map(header => String(item[header] || '')));
      
      doc.autoTable({
        head: [headers],
        body: rows,
        startY: 45,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 10, right: 10 }
      });
    }
    
    // Save
    const timestamp = new Date().toISOString().slice(0, 10);
    doc.save(`${filename}_${timestamp}.pdf`);
  }

  async exportToCSV(data, filename) {
    if (!data || data.length === 0) {
      throw new Error('Tidak ada data untuk diekspor');
    }
    
    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = String(row[header] || '');
          // Escape commas and quotes
          return value.includes(',') || value.includes('"') ? 
            `"${value.replace(/"/g, '""')}"` : value;
        }).join(',')
      )
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${timestamp}.csv`;
    link.click();
    
    URL.revokeObjectURL(link.href);
  }

  getStatusCutiTahunan(item) {
    if (item.sisa === 0) return 'Habis';
    if (item.sisa <= 3) return 'Hampir Habis';
    return 'Normal';
  }

  getStatusCutiSakit(item) {
    if (item.kelebihan > 0) return 'Ada Potongan';
    return 'Normal';
  }

  getStatusCutiPenting(item) {
    const persentase = (item.totalHari / item.batasMaksimal) * 100;
    if (persentase >= 100) return 'Habis';
    if (persentase >= 80) return 'Hampir Habis';
    if (persentase >= 50) return 'Sedang';
    return 'Normal';
  }

  formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  showLoading(message) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.querySelector('p').textContent = message;
      overlay.classList.remove('hidden');
    }
  }

  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  showSuccess(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center">
        <i class="fas fa-check-circle mr-2"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center">
        <i class="fas fa-exclamation-circle mr-2"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

// Initialize report generator when app is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.app) {
    new ReportGenerator(window.app);
  }
});