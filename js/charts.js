// Chart Manager untuk visualisasi data
class ChartManager {
  constructor(app) {
    this.app = app;
    this.charts = {};
    this.initializeCharts();
  }

  initializeCharts() {
    // Initialize dashboard charts
    this.createMonthlyChart();
    this.createCutiTypeChart();
    
    // Initialize laporan charts
    this.createSummaryChart();
  }

  createMonthlyChart() {
    const ctx = document.getElementById('chart-bulanan');
    if (!ctx) return;

    const monthlyData = this.getMonthlyData();
    
    this.charts.monthly = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
        datasets: [
          {
            label: 'Cuti Tahunan',
            data: monthlyData.tahunan,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Cuti Sakit',
            data: monthlyData.sakit,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Cuti Penting',
            data: monthlyData.penting,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Tren Penggunaan Cuti per Bulan - ${this.app.tahunAktif}`
          },
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Jumlah Hari'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Bulan'
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  createCutiTypeChart() {
    const ctx = document.getElementById('chart-jenis-cuti');
    if (!ctx) return;

    const typeData = this.getCutiTypeData();
    
    this.charts.cutiType = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Cuti Tahunan', 'Cuti Sakit', 'Cuti Melahirkan', 'Cuti Penting'],
        datasets: [{
          data: [
            typeData.tahunan,
            typeData.sakit,
            typeData.melahirkan,
            typeData.penting
          ],
          backgroundColor: [
            '#3b82f6',
            '#ef4444',
            '#8b5cf6',
            '#f59e0b'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Distribusi Jenis Cuti - ${this.app.tahunAktif}`
          },
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${context.parsed} hari (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  createSummaryChart() {
    const ctx = document.getElementById('chart-ringkasan');
    if (!ctx) return;

    const summaryData = this.getSummaryData();
    
    this.charts.summary = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: summaryData.labels,
        datasets: [
          {
            label: 'Hak Cuti',
            data: summaryData.hakCuti,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: '#3b82f6',
            borderWidth: 1
          },
          {
            label: 'Cuti Diambil',
            data: summaryData.cutiDiambil,
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: '#ef4444',
            borderWidth: 1
          },
          {
            label: 'Sisa Cuti',
            data: summaryData.sisaCuti,
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: '#10b981',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Ringkasan Cuti Tahunan per Pegawai - ${this.app.tahunAktif}`
          },
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Jumlah Hari'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Pegawai'
            }
          }
        }
      }
    });
  }

  getMonthlyData() {
    const monthlyData = {
      tahunan: new Array(12).fill(0),
      sakit: new Array(12).fill(0),
      penting: new Array(12).fill(0)
    };

    // Simulate monthly data based on existing data
    // In real implementation, this would parse actual dates from riwayat
    this.app.data.cutiTahunan.forEach(item => {
      if (item.riwayat && item.riwayat.length > 0) {
        item.riwayat.forEach(riwayat => {
          const month = new Date(riwayat.tanggalMulai).getMonth();
          monthlyData.tahunan[month] += riwayat.lamaCuti;
        });
      } else {
        // Distribute evenly if no detailed riwayat
        const monthlyAvg = Math.floor(item.diambil / 12);
        const remainder = item.diambil % 12;
        for (let i = 0; i < 12; i++) {
          monthlyData.tahunan[i] += monthlyAvg + (i < remainder ? 1 : 0);
        }
      }
    });

    this.app.data.cutiSakit.forEach(item => {
      if (item.riwayat && item.riwayat.length > 0) {
        item.riwayat.forEach(riwayat => {
          const month = new Date(riwayat.tanggalMulai).getMonth();
          monthlyData.sakit[month] += riwayat.lamaCuti;
        });
      } else {
        // Distribute evenly if no detailed riwayat
        const monthlyAvg = Math.floor(item.totalHari / 12);
        const remainder = item.totalHari % 12;
        for (let i = 0; i < 12; i++) {
          monthlyData.sakit[i] += monthlyAvg + (i < remainder ? 1 : 0);
        }
      }
    });

    this.app.data.cutiPenting.forEach(item => {
      if (item.riwayat && item.riwayat.length > 0) {
        item.riwayat.forEach(riwayat => {
          const month = new Date(riwayat.tanggalMulai).getMonth();
          monthlyData.penting[month] += riwayat.lamaCuti;
        });
      } else {
        // Distribute evenly if no detailed riwayat
        const monthlyAvg = Math.floor(item.totalHari / 12);
        const remainder = item.totalHari % 12;
        for (let i = 0; i < 12; i++) {
          monthlyData.penting[i] += monthlyAvg + (i < remainder ? 1 : 0);
        }
      }
    });

    return monthlyData;
  }

  getCutiTypeData() {
    const totalTahunan = this.app.data.cutiTahunan.reduce((sum, item) => sum + item.diambil, 0);
    const totalSakit = this.app.data.cutiSakit.reduce((sum, item) => sum + item.totalHari, 0);
    const totalMelahirkan = this.app.data.cutiMelahirkan.reduce((sum, item) => sum + item.lamaHari, 0);
    const totalPenting = this.app.data.cutiPenting.reduce((sum, item) => sum + item.totalHari, 0);

    return {
      tahunan: totalTahunan,
      sakit: totalSakit,
      melahirkan: totalMelahirkan,
      penting: totalPenting
    };
  }

  getSummaryData() {
    const labels = [];
    const hakCuti = [];
    const cutiDiambil = [];
    const sisaCuti = [];

    this.app.data.cutiTahunan.forEach(item => {
      const pegawai = this.app.data.pegawai.find(p => p.id === item.pegawaiId);
      if (pegawai) {
        labels.push(pegawai.nama.split(' ')[0]); // First name only for space
        hakCuti.push(item.hakCuti);
        cutiDiambil.push(item.diambil);
        sisaCuti.push(item.sisa);
      }
    });

    return {
      labels,
      hakCuti,
      cutiDiambil,
      sisaCuti
    };
  }

  updateCharts() {
    // Update all charts with new data
    if (this.charts.monthly) {
      const monthlyData = this.getMonthlyData();
      this.charts.monthly.data.datasets[0].data = monthlyData.tahunan;
      this.charts.monthly.data.datasets[1].data = monthlyData.sakit;
      this.charts.monthly.data.datasets[2].data = monthlyData.penting;
      this.charts.monthly.update();
    }

    if (this.charts.cutiType) {
      const typeData = this.getCutiTypeData();
      this.charts.cutiType.data.datasets[0].data = [
        typeData.tahunan,
        typeData.sakit,
        typeData.melahirkan,
        typeData.penting
      ];
      this.charts.cutiType.update();
    }

    if (this.charts.summary) {
      const summaryData = this.getSummaryData();
      this.charts.summary.data.labels = summaryData.labels;
      this.charts.summary.data.datasets[0].data = summaryData.hakCuti;
      this.charts.summary.data.datasets[1].data = summaryData.cutiDiambil;
      this.charts.summary.data.datasets[2].data = summaryData.sisaCuti;
      this.charts.summary.update();
    }
  }

  createCustomChart(canvasId, type, data, options) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
      type: type,
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...options
      }
    });
  }

  destroyChart(chartName) {
    if (this.charts[chartName]) {
      this.charts[chartName].destroy();
      delete this.charts[chartName];
    }
  }

  destroyAllCharts() {
    Object.keys(this.charts).forEach(chartName => {
      this.destroyChart(chartName);
    });
  }

  // Chart color schemes
  getColorScheme(type = 'default') {
    const schemes = {
      default: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'],
      blue: ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
      green: ['#065f46', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
      red: ['#7f1d1d', '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca'],
      purple: ['#581c87', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe']
    };
    
    return schemes[type] || schemes.default;
  }

  // Export chart as image
  exportChart(chartName, filename) {
    if (!this.charts[chartName]) {
      console.error(`Chart ${chartName} not found`);
      return;
    }

    const canvas = this.charts[chartName].canvas;
    const url = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = filename || `chart_${chartName}.png`;
    link.href = url;
    link.click();
  }

  // Resize charts
  resizeCharts() {
    Object.values(this.charts).forEach(chart => {
      chart.resize();
    });
  }
}

// Initialize chart manager when app is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.app && window.Chart) {
    window.chartManager = new ChartManager(window.app);
    
    // Update charts when data changes
    const originalUpdateDashboard = window.app.updateDashboard;
    window.app.updateDashboard = function() {
      originalUpdateDashboard.call(this);
      if (window.chartManager) {
        window.chartManager.updateCharts();
      }
    };
    
    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.chartManager) {
        window.chartManager.resizeCharts();
      }
    });
  }
});