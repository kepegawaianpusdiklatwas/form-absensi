// Calculator untuk berbagai jenis cuti
class CutiCalculator {
  constructor() {
    this.ATURAN_CUTI = {
      TAHUNAN: {
        MASA_KERJA_1_5: 12,    // < 5 tahun
        MASA_KERJA_5_10: 15,   // 5-10 tahun
        MASA_KERJA_10_20: 18,  // 10-20 tahun
        MASA_KERJA_20_PLUS: 21 // > 20 tahun
      },
      SAKIT: {
        BATAS_NORMAL: 14,      // 14 hari tanpa potongan
        POTONGAN_50_PERSEN: 30, // hari ke-15 s/d 44 potongan 50%
        POTONGAN_100_PERSEN: 45 // hari ke-45+ potongan 100%
      },
      BESAR: {
        INTERVAL_TAHUN: 6,     // Setiap 6 tahun
        LAMA_HARI: 90         // 3 bulan
      },
      MELAHIRKAN: {
        LAMA_HARI: 90,        // 3 bulan
        SEBELUM_LAHIR: 45,    // 1.5 bulan sebelum
        SESUDAH_LAHIR: 45     // 1.5 bulan sesudah
      },
      PENTING: {
        MAKSIMAL_TAHUN: 30    // 30 hari per tahun
      }
    };
  }

  // Hitung hak cuti tahunan berdasarkan masa kerja
  calculateHakCutiTahunan(tanggalMasuk) {
    const masaKerja = this.calculateMasaKerja(tanggalMasuk);
    
    if (masaKerja < 5) {
      return this.ATURAN_CUTI.TAHUNAN.MASA_KERJA_1_5;
    } else if (masaKerja < 10) {
      return this.ATURAN_CUTI.TAHUNAN.MASA_KERJA_5_10;
    } else if (masaKerja < 20) {
      return this.ATURAN_CUTI.TAHUNAN.MASA_KERJA_10_20;
    } else {
      return this.ATURAN_CUTI.TAHUNAN.MASA_KERJA_20_PLUS;
    }
  }

  // Hitung masa kerja dalam tahun
  calculateMasaKerja(tanggalMasuk) {
    const masuk = new Date(tanggalMasuk);
    const sekarang = new Date();
    const diffTime = Math.abs(sekarang - masuk);
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
    return diffYears;
  }

  // Hitung potongan gaji untuk cuti sakit berlebihan
  calculatePotonganCutiSakit(totalHariSakit) {
    if (totalHariSakit <= this.ATURAN_CUTI.SAKIT.BATAS_NORMAL) {
      return {
        hariPotongan: 0,
        persentasePotongan: 0,
        keterangan: 'Tidak ada potongan'
      };
    }

    const kelebihan = totalHariSakit - this.ATURAN_CUTI.SAKIT.BATAS_NORMAL;
    let hariPotongan50 = 0;
    let hariPotongan100 = 0;

    if (kelebihan <= 30) {
      // Hari ke-15 s/d 44: potongan 50%
      hariPotongan50 = kelebihan;
    } else {
      // Hari ke-15 s/d 44: potongan 50%
      hariPotongan50 = 30;
      // Hari ke-45+: potongan 100%
      hariPotongan100 = kelebihan - 30;
    }

    const totalPotongan = (hariPotongan50 * 0.5) + (hariPotongan100 * 1.0);

    return {
      hariPotongan: totalPotongan,
      hariPotongan50: hariPotongan50,
      hariPotongan100: hariPotongan100,
      persentasePotongan: (totalPotongan / totalHariSakit * 100).toFixed(1),
      keterangan: this.generateKeteranganPotongan(hariPotongan50, hariPotongan100)
    };
  }

  generateKeteranganPotongan(hari50, hari100) {
    let keterangan = [];
    
    if (hari50 > 0) {
      keterangan.push(`${hari50} hari potongan 50%`);
    }
    
    if (hari100 > 0) {
      keterangan.push(`${hari100} hari potongan 100%`);
    }
    
    return keterangan.join(', ');
  }

  // Hitung kelayakan cuti besar
  calculateKelayakanCutiBesar(tanggalMasuk, riwayatCutiBesar = []) {
    const masaKerja = this.calculateMasaKerja(tanggalMasuk);
    const hakCutiBesar = Math.floor(masaKerja / this.ATURAN_CUTI.BESAR.INTERVAL_TAHUN);
    const sudahDiambil = riwayatCutiBesar.length;
    const sisaHak = hakCutiBesar - sudahDiambil;
    
    // Cek apakah sudah waktunya untuk cuti besar berikutnya
    const tahunTerakhirAmbil = riwayatCutiBesar.length > 0 ? 
      new Date(riwayatCutiBesar[riwayatCutiBesar.length - 1].tanggal).getFullYear() : 
      new Date(tanggalMasuk).getFullYear();
    
    const tahunSekarang = new Date().getFullYear();
    const selisihTahun = tahunSekarang - tahunTerakhirAmbil;
    
    const statusKelayakan = sisaHak > 0 && selisihTahun >= this.ATURAN_CUTI.BESAR.INTERVAL_TAHUN ? 
      'Layak' : 'Belum Layak';
    
    const tahunBerikutnyaLayak = tahunTerakhirAmbil + this.ATURAN_CUTI.BESAR.INTERVAL_TAHUN;

    return {
      masaKerja: masaKerja,
      hakTotal: hakCutiBesar,
      sudahDiambil: sudahDiambil,
      sisaHak: sisaHak,
      statusKelayakan: statusKelayakan,
      tahunBerikutnyaLayak: statusKelayakan === 'Belum Layak' ? tahunBerikutnyaLayak : null,
      lamaHari: this.ATURAN_CUTI.BESAR.LAMA_HARI
    };
  }

  // Validasi periode cuti melahirkan
  validateCutiMelahirkan(tanggalMulai, tanggalSelesai, tanggalLahir = null) {
    const mulai = new Date(tanggalMulai);
    const selesai = new Date(tanggalSelesai);
    const lahir = tanggalLahir ? new Date(tanggalLahir) : null;
    
    const lamaHari = Math.ceil((selesai - mulai) / (1000 * 60 * 60 * 24)) + 1;
    
    const validasi = {
      lamaHari: lamaHari,
      valid: true,
      peringatan: [],
      rekomendasi: []
    };

    // Cek lama cuti
    if (lamaHari > this.ATURAN_CUTI.MELAHIRKAN.LAMA_HARI) {
      validasi.valid = false;
      validasi.peringatan.push(`Lama cuti melebihi ketentuan (${this.ATURAN_CUTI.MELAHIRKAN.LAMA_HARI} hari)`);
    }

    // Cek distribusi sebelum dan sesudah lahir jika tanggal lahir tersedia
    if (lahir) {
      const hariSebelumLahir = Math.ceil((lahir - mulai) / (1000 * 60 * 60 * 24));
      const hariSesudahLahir = Math.ceil((selesai - lahir) / (1000 * 60 * 60 * 24));
      
      if (hariSebelumLahir > this.ATURAN_CUTI.MELAHIRKAN.SEBELUM_LAHIR) {
        validasi.peringatan.push(`Cuti sebelum lahir terlalu lama (${hariSebelumLahir} hari, maks ${this.ATURAN_CUTI.MELAHIRKAN.SEBELUM_LAHIR} hari)`);
      }
      
      if (hariSesudahLahir > this.ATURAN_CUTI.MELAHIRKAN.SESUDAH_LAHIR) {
        validasi.peringatan.push(`Cuti sesudah lahir terlalu lama (${hariSesudahLahir} hari, maks ${this.ATURAN_CUTI.MELAHIRKAN.SESUDAH_LAHIR} hari)`);
      }
      
      validasi.distribusi = {
        sebelumLahir: hariSebelumLahir,
        sesudahLahir: hariSesudahLahir
      };
    }

    return validasi;
  }

  // Hitung sisa hak cuti alasan penting
  calculateSisaHakCutiPenting(totalDiambil, tahun = new Date().getFullYear()) {
    const sisaHak = this.ATURAN_CUTI.PENTING.MAKSIMAL_TAHUN - totalDiambil;
    
    return {
      totalDiambil: totalDiambil,
      batasMaksimal: this.ATURAN_CUTI.PENTING.MAKSIMAL_TAHUN,
      sisaHak: Math.max(0, sisaHak),
      persentaseUsage: (totalDiambil / this.ATURAN_CUTI.PENTING.MAKSIMAL_TAHUN * 100).toFixed(1),
      status: this.getStatusCutiPenting(totalDiambil),
      tahun: tahun
    };
  }

  getStatusCutiPenting(totalDiambil) {
    const persentase = (totalDiambil / this.ATURAN_CUTI.PENTING.MAKSIMAL_TAHUN) * 100;
    
    if (persentase >= 100) return 'Habis';
    if (persentase >= 80) return 'Hampir Habis';
    if (persentase >= 50) return 'Sedang';
    return 'Normal';
  }

  // Hitung total hari kerja dalam periode (exclude weekend dan libur)
  calculateHariKerja(tanggalMulai, tanggalSelesai, hariLibur = []) {
    const mulai = new Date(tanggalMulai);
    const selesai = new Date(tanggalSelesai);
    let hariKerja = 0;
    
    for (let d = new Date(mulai); d <= selesai; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const dateString = d.toISOString().split('T')[0];
      
      // Skip weekend (Saturday = 6, Sunday = 0)
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      
      // Skip hari libur
      if (hariLibur.includes(dateString)) continue;
      
      hariKerja++;
    }
    
    return hariKerja;
  }

  // Generate laporan ringkasan cuti pegawai
  generateRingkasanCuti(pegawai, dataCuti, tahun) {
    const ringkasan = {
      pegawai: pegawai,
      tahun: tahun,
      cutiTahunan: this.getRingkasanCutiTahunan(dataCuti.tahunan),
      cutiSakit: this.getRingkasanCutiSakit(dataCuti.sakit),
      cutiBesar: this.getRingkasanCutiBesar(pegawai, dataCuti.besar),
      cutiMelahirkan: this.getRingkasanCutiMelahirkan(dataCuti.melahirkan),
      cutiPenting: this.getRingkasanCutiPenting(dataCuti.penting),
      totalHariCuti: 0,
      rekomendasi: []
    };

    // Hitung total hari cuti
    ringkasan.totalHariCuti = 
      (dataCuti.tahunan?.diambil || 0) +
      (dataCuti.sakit?.totalHari || 0) +
      (dataCuti.melahirkan?.lamaHari || 0) +
      (dataCuti.penting?.totalHari || 0);

    // Generate rekomendasi
    ringkasan.rekomendasi = this.generateRekomendasi(ringkasan);

    return ringkasan;
  }

  getRingkasanCutiTahunan(data) {
    if (!data) return null;
    
    return {
      hakCuti: data.hakCuti,
      diambil: data.diambil,
      sisa: data.sisa,
      persentaseUsage: (data.diambil / data.hakCuti * 100).toFixed(1),
      status: data.sisa === 0 ? 'Habis' : data.sisa <= 3 ? 'Hampir Habis' : 'Normal'
    };
  }

  getRingkasanCutiSakit(data) {
    if (!data) return null;
    
    const potongan = this.calculatePotonganCutiSakit(data.totalHari);
    
    return {
      totalHari: data.totalHari,
      batasNormal: this.ATURAN_CUTI.SAKIT.BATAS_NORMAL,
      kelebihan: Math.max(0, data.totalHari - this.ATURAN_CUTI.SAKIT.BATAS_NORMAL),
      potongan: potongan,
      status: data.totalHari <= this.ATURAN_CUTI.SAKIT.BATAS_NORMAL ? 'Normal' : 'Ada Potongan'
    };
  }

  getRingkasanCutiBesar(pegawai, data) {
    const kelayakan = this.calculateKelayakanCutiBesar(pegawai.tglMasuk, data?.riwayat || []);
    return kelayakan;
  }

  getRingkasanCutiMelahirkan(data) {
    if (!data) return null;
    
    return {
      lamaHari: data.lamaHari,
      status: data.status,
      tanggalMulai: data.tanggalMulai,
      tanggalSelesai: data.tanggalSelesai
    };
  }

  getRingkasanCutiPenting(data) {
    if (!data) return null;
    
    return this.calculateSisaHakCutiPenting(data.totalHari);
  }

  generateRekomendasi(ringkasan) {
    const rekomendasi = [];
    
    // Rekomendasi cuti tahunan
    if (ringkasan.cutiTahunan) {
      if (ringkasan.cutiTahunan.sisa > 6) {
        rekomendasi.push({
          jenis: 'tahunan',
          prioritas: 'tinggi',
          pesan: `Sisa cuti tahunan masih ${ringkasan.cutiTahunan.sisa} hari. Disarankan untuk mengambil cuti agar tidak hangus.`
        });
      }
    }
    
    // Rekomendasi cuti sakit
    if (ringkasan.cutiSakit && ringkasan.cutiSakit.kelebihan > 0) {
      rekomendasi.push({
        jenis: 'sakit',
        prioritas: 'tinggi',
        pesan: `Cuti sakit melebihi batas normal. Ada potongan gaji sebesar ${ringkasan.cutiSakit.potongan.hariPotongan.toFixed(1)} hari.`
      });
    }
    
    // Rekomendasi cuti besar
    if (ringkasan.cutiBesar && ringkasan.cutiBesar.statusKelayakan === 'Layak') {
      rekomendasi.push({
        jenis: 'besar',
        prioritas: 'sedang',
        pesan: 'Pegawai layak mengambil cuti besar selama 3 bulan.'
      });
    }
    
    // Rekomendasi cuti penting
    if (ringkasan.cutiPenting && ringkasan.cutiPenting.sisaHak <= 5) {
      rekomendasi.push({
        jenis: 'penting',
        prioritas: 'rendah',
        pesan: `Sisa hak cuti alasan penting tinggal ${ringkasan.cutiPenting.sisaHak} hari.`
      });
    }
    
    return rekomendasi;
  }

  // Validasi overlap cuti
  validateOverlapCuti(tanggalMulai, tanggalSelesai, riwayatCuti = []) {
    const mulai = new Date(tanggalMulai);
    const selesai = new Date(tanggalSelesai);
    
    const overlap = riwayatCuti.filter(cuti => {
      const cutiMulai = new Date(cuti.tanggalMulai);
      const cutiSelesai = new Date(cuti.tanggalSelesai);
      
      return (mulai <= cutiSelesai && selesai >= cutiMulai);
    });
    
    return {
      hasOverlap: overlap.length > 0,
      overlappingCuti: overlap,
      message: overlap.length > 0 ? 'Terdapat overlap dengan cuti yang sudah ada' : 'Tidak ada overlap'
    };
  }
}

// Make calculator globally available
window.CutiCalculator = CutiCalculator;