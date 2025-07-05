// Impor konstanta
import { MONTHS_LIST } from './constants.js';

// Fungsi untuk menampilkan pesan error
export function showError(message, elementId = 'error-display') {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.style.display = 'block';
    element.className = 'search-info error mt-2';
  }
}

// Fungsi untuk menampilkan pesan sukses
export function showSuccess(message, elementId) {
  const element = elementId ? document.getElementById(elementId) : null;
  if (element) {
    element.textContent = message;
    element.className = 'search-info success mt-2';
  }
}

// Fungsi untuk menampilkan pesan info
export function showInfo(message, elementId, type = 'info') {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.className = `search-info ${type} mt-2`;
  }
}

// Fungsi untuk menampilkan loading
export function showLoading(message, elementId = 'loading') {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> ${message}`;
    element.classList.remove('hidden');
  }
}

// Fungsi untuk menyembunyikan loading
export function hideLoading(elementId = 'loading') {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add('hidden');
  }
}

// Fungsi format tanggal Indonesia
export function formatTanggalIndonesia(tanggalISO) {
  const tanggal = new Date(tanggalISO + 'T00:00:00');
  return `${tanggal.getDate()} ${MONTHS_LIST[tanggal.getMonth()]} ${tanggal.getFullYear()}`;
}

// Fungsi format tanggal dan waktu
export function formatDateTime(date) {
  const jam = date.getHours().toString().padStart(2, '0');
  const menit = date.getMinutes().toString().padStart(2, '0');
  return `${date.getDate()} ${MONTHS_LIST[date.getMonth()]} ${date.getFullYear()} ${jam}:${menit}`;
}

// Fungsi untuk reset form
export function resetForm() {
  const form = document.getElementById('absenForm');
  if (form) form.reset();
  
  // Reset info pencarian
  document.querySelectorAll('.search-info').forEach(el => {
    el.textContent = '';
    el.className = 'search-info mt-2';
  });
  
  // Reset file upload
  document.getElementById('file-label').textContent = 'Pilih file gambar (JPG, PNG)';
  document.getElementById('file-name').textContent = '';
  
  // Reset halaman
  document.querySelectorAll('.form-page').forEach(page => page.classList.remove('active'));
  document.getElementById('page1').classList.add('active');
  
  // Reset step indicator
  document.querySelectorAll('.page-step').forEach(step => {
    step.classList.remove('active', 'completed');
  });
  document.getElementById('step1').classList.add('active');
  
  // Sembunyikan area cetak
  document.getElementById('cetak-area').style.display = 'none';
}