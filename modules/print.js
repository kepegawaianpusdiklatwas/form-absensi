// Impor fungsi utilitas
import { formatTanggalIndonesia, formatDateTime } from './utils.js';
import { MONTHS_LIST } from './constants.js';

// Fungsi setup cetak
export function setupPrint() {
  // Event listener untuk tombol cetak
  document.getElementById('printBtn')?.addEventListener('click', handlePrint);
  
  // Event listener untuk tombol PDF
  document.getElementById('savePdfBtn')?.addEventListener('click', handleSavePdf);
}

// Fungsi handle cetak
function handlePrint() {
  // Tampilkan area cetak
  document.getElementById('cetak-area').style.display = 'block';
  
  // Jalankan print browser
  window.print();
  
  // Sembunyikan kembali area cetak
  setTimeout(() => {
    document.getElementById('cetak-area').style.display = 'none';
  }, 500);
}

// Fungsi handle save PDF
async function handleSavePdf() {
  const element = document.getElementById('print-area');
  const namaPegawai = document.getElementById('cetak-nama').textContent;
  const tanggal = document.getElementById('tanggal').value;
  const namaFile = `Surat_Pernyataan_${namaPegawai.replace(/\s+/g, '_')}_${tanggal.replace(/-/g, '')}.pdf`;
  
  const opt = {
    margin: 10,
    filename: namaFile,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Tampilkan loading
  const btn = document.getElementById('savePdfBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Menyimpan PDF...';
  btn.disabled = true;

  try {
    // Generate PDF
    await html2pdf().from(element).set(opt).save();
  } catch (error) {
    console.error('Gagal menyimpan PDF:', error);
    showError('Gagal menyimpan PDF');
  } finally {
    // Kembalikan tampilan tombol
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// Fungsi update tampilan cetak
export function updatePrintView(data, hari) {
  // Format data untuk ditampilkan
  const formattedData = {
    'cetak-nama': data.Nama,
    'ttd-nama': data.Nama,
    'ttd-nip': data.NIP,
    'cetak-nip': data.NIP,
    'cetak-golongan': data.Golongan || "-",
    'cetak-jabatan': data.Jabatan || "-",
    'cetak-haritanggal': `${hari}, ${formatTanggalIndonesia(data.Tanggal)}`,
    'cetak-waktu': data.Waktu,
    'cetak-lokasi': data.Lokasi,
    'cetak-atasan1': data.AtasanLangsung,
    'cetak-nip-atasan1': data.NIP_AtasanLangsung,
    'cetak-atasan2': data.AtasanDariAtasanLangsung,
    'cetak-nip-atasan2': data.NIP_AtasanDariAtasanLangsung,
    'tanggal-surat': formatTanggalIndonesia(data.Tanggal),
    'proof-nama': data.Nama,
    'proof-nip': data.NIP,
    'proof-tanggal': formatTanggalIndonesia(data.Tanggal),
    'proof-waktu': data.Waktu,
    'proof-lokasi': data.Lokasi,
    'proof-timestamp': formatDateTime(new Date(data.Timestamp))
  };

  // Update semua elemen
  for (const [id, value] of Object.entries(formattedData)) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  // Tambahkan gambar bukti
  const proofImageContainer = document.getElementById('proof-image-container');
  if (proofImageContainer) {
    proofImageContainer.innerHTML = '';
    
    const img = document.createElement('img');
    img.src = 'data:image/jpeg;base64,' + data.BuktiFile;
    img.className = 'proof-image';
    img.alt = 'Bukti Presensi ' + data.Nama;
    
    proofImageContainer.appendChild(img);
  }

  // Tampilkan area cetak
  document.getElementById('cetak-area').style.display = 'block';
}