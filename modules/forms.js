// Impor fungsi utilitas dan konstanta
import { showError, showSuccess, showLoading, hideLoading } from './utils.js';
import { formatTanggalIndonesia, formatDateTime } from './utils.js';
import { PEGAWAI_DATA_URL, FORM_SUBMIT_URL } from './constants.js';

// Fungsi setup form utama
export function setupForm() {
  const form = document.getElementById('absenForm');
  
  if (!form) return;
  
  // Event listener untuk submit form
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validasi form
    if (!validateForm()) return;
    
    showLoading('Mengirim data...', 'loading');
    
    try {
      // Proses form
      const formData = new FormData(form);
      const result = await processFormData(formData);
      
      // Update tampilan cetak
      updatePrintView(result.data, result.hari);
      
      // Tampilkan halaman terima kasih
      showThankYouPage();
      
      showSuccess('Form berhasil dikirim!');
    } catch (error) {
      showError(`Gagal mengirim form: ${error.message}`);
    } finally {
      hideLoading('loading');
    }
  });
}

// Fungsi validasi form lengkap
function validateForm() {
  return validatePage1() && validatePage2() && validateFileUpload();
}

// Fungsi validasi halaman 1 (Data Diri dan Atasan)
function validatePage1() {
  let isValid = true;
  
  // Validasi nama pegawai
  if (!document.getElementById('nip').value) {
    showError('Harap pilih pegawai dari daftar', 'info-nama');
    isValid = false;
  }
  
  // Validasi atasan langsung
  if (!document.getElementById('nip_atasan1').value) {
    showError('Harap pilih atasan langsung dari daftar', 'info-atasan1');
    isValid = false;
  }
  
  // Validasi atasan dari atasan
  if (!document.getElementById('nip_atasan2').value) {
    showError('Harap pilih atasan dari atasan langsung', 'info-atasan2');
    isValid = false;
  }
  
  return isValid;
}

// Fungsi validasi halaman 2 (Tanggal, Waktu, Lokasi)
function validatePage2() {
  let isValid = true;
  
  // Validasi tanggal
  if (!document.getElementById('tanggal').value) {
    showError('Harap isi tanggal kehadiran');
    isValid = false;
  }
  
  // Validasi waktu
  if (!document.getElementById('waktu').value) {
    showError('Harap isi waktu kehadiran');
    isValid = false;
  }
  
  // Validasi lokasi
  if (!document.getElementById('lokasi').value.trim()) {
    showError('Harap isi lokasi kehadiran');
    isValid = false;
  }
  
  return isValid;
}

// Fungsi validasi file upload
function validateFileUpload() {
  const fileInput = document.getElementById('bukti');
  
  if (!fileInput.files || fileInput.files.length === 0) {
    showError('Harap upload bukti kehadiran');
    return false;
  }
  
  const file = fileInput.files[0];
  if (file.size > 2 * 1024 * 1024) {
    showError('Ukuran file terlalu besar (maks 2MB)');
    return false;
  }
  
  return true;
}

// Fungsi proses data form
async function processFormData(formData) {
  const file = document.getElementById('bukti').files[0];
  const base64File = await toBase64(file);
  const hari = getHariFromDate(formData.get('Tanggal'));
  
  const data = {
    Timestamp: new Date().toISOString(),
    Nama: formData.get('Nama'),
    NIP: formData.get('NIP'),
    Golongan: formData.get('Golongan'),
    Jabatan: formData.get('Jabatan'),
    Tanggal: formData.get('Tanggal'),
    Waktu: formData.get('Waktu'),
    Lokasi: formData.get('Lokasi'),
    AtasanLangsung: formData.get('AtasanLangsung'),
    NIP_AtasanLangsung: formData.get('NIP_AtasanLangsung'),
    AtasanDariAtasanLangsung: formData.get('AtasanDariAtasanLangsung'),
    NIP_AtasanDariAtasanLangsung: formData.get('NIP_AtasanDariAtasanLangsung'),
    BuktiFile: base64File,
    OriginalFileName: file.name
  };
  
  // Kirim data ke server
  const response = await fetch(FORM_SUBMIT_URL, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Gagal mengirim data ke server');
  }
  
  return { data, hari };
}

// Fungsi konversi file ke base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
}

// Fungsi untuk mendapatkan nama hari
function getHariFromDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return DAYS_LIST[date.getDay()];
}

// Fungsi update tampilan cetak
function updatePrintView(data, hari) {
  // Implementasi update tampilan cetak
  // ...
}

// Fungsi tampilkan halaman terima kasih
function showThankYouPage() {
  // Implementasi navigasi ke halaman terima kasih
  // ...
}