// Impor komponen dan modul yang diperlukan
import { renderApp } from './components/appComponent.js';
import { setupForm } from './form.js';
import { setupSearch } from './search.js';
import { setupPrint } from './print.js';
import { PEGAWAI_DATA_URL } from './constants.js';

// Variabel global aplikasi
let pegawaiList = [];
let fuseInstance = null;

// Fungsi inisialisasi aplikasi utama
export function initializeApp() {
  // Render komponen utama
  renderApp();
  
  // Setup fungsi pencarian
  setupSearch();
  
  // Setup form dan validasi
  setupForm();
  
  // Setup fungsi cetak
  setupPrint();
  
  console.log('Aplikasi Form Kehadiran telah diinisialisasi');
}

// Fungsi untuk mendapatkan data pegawai
export async function loadPegawaiData() {
  try {
    const response = await fetch(PEGAWAI_DATA_URL);
    if (!response.ok) throw new Error('Gagal memuat data pegawai');
    pegawaiList = await response.json();
    return pegawaiList;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Fungsi untuk mendapatkan instance Fuse.js
export function getFuseInstance() {
  return fuseInstance;
}

// Fungsi untuk menginisialisasi Fuse.js
export function initFuse(data) {
  fuseInstance = new Fuse(data, {
    keys: ['Nama', 'NIP'],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
    ignoreLocation: true,
    shouldSort: true
  });
}