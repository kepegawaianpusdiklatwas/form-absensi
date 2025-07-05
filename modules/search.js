// Impor fungsi dari modul lain
import { loadPegawaiData, initFuse, getFuseInstance } from './app.js';
import { showError, showInfo, showSuccess } from './utils.js';

// Fungsi setup pencarian
export function setupSearch() {
  // Load data pegawai terlebih dahulu
  loadInitialData();
  
  // Setup field pencarian
  setupSearchField('nama', 'info-nama', 'nip', 'nama-results', true);
  setupSearchField('atasan1', 'info-atasan1', 'nip_atasan1', 'atasan1-results');
  setupSearchField('atasan2', 'info-atasan2', 'nip_atasan2', 'atasan2-results');
}

// Fungsi load data awal
async function loadInitialData() {
  try {
    showInfo('Memuat data pegawai...', 'info-nama');
    const data = await loadPegawaiData();
    initFuse(data);
  } catch (error) {
    showError('Gagal memuat data pegawai', 'info-nama');
  }
}

// Fungsi setup field pencarian
function setupSearchField(inputId, infoId, nipFieldId, resultsId, isPegawai = false) {
  const input = document.getElementById(inputId);
  const info = document.getElementById(infoId);
  const nipField = document.getElementById(nipFieldId);
  const resultsContainer = document.getElementById(resultsId);
  
  if (!input || !info || !nipField || !resultsContainer) return;
  
  let searchTimeout;
  
  input.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    const query = this.value.trim();
    
    if (!query) {
      clearSearchResults(info, nipField, resultsContainer, isPegawai);
      return;
    }
    
    if (query.length < 2) {
      showInfo('Ketik minimal 2 karakter...', infoId);
      return;
    }
    
    showInfo('Mencari...', infoId, 'loading');
    
    searchTimeout = setTimeout(() => {
      try {
        const fuse = getFuseInstance();
        if (!fuse) throw new Error('Pencarian belum siap');
        
        const results = fuse.search(query);
        handleSearchResults(results, input, info, nipField, resultsContainer, isPegawai);
      } catch (error) {
        console.error('Error pencarian:', error);
        showError('Error dalam pencarian', infoId);
      }
    }, 300);
  });
  
  // Sembunyikan hasil pencarian saat klik di luar
  document.addEventListener('click', function(e) {
    if (e.target !== input) {
      resultsContainer.style.display = 'none';
    }
  });
}

// Fungsi handle hasil pencarian
function handleSearchResults(results, input, info, nipField, resultsContainer, isPegawai) {
  if (results.length === 0) {
    showError('Data tidak ditemukan', info.id);
    resultsContainer.style.display = 'none';
    return;
  }
  
  resultsContainer.innerHTML = '';
  
  // Tampilkan maksimal 5 hasil
  results.slice(0, 5).forEach(result => {
    const item = document.createElement('div');
    item.className = 'search-result-item';
    item.innerHTML = `
      <div>${result.item.Nama}</div>
      <small>NIP: ${result.item.NIP} ${result.item.Jabatan ? '| ' + result.item.Jabatan : ''}</small>
    `;
    
    item.addEventListener('click', () => {
      input.value = result.item.Nama;
      nipField.value = result.item.NIP;
      
      if (isPegawai) {
        document.getElementById('golongan').value = result.item.Golongan || "-";
        document.getElementById('jabatan').value = result.item.Jabatan || "-";
      }
      
      showSuccess(`NIP: ${result.item.NIP} | Golongan: ${result.item.Golongan || '-'}`, info.id);
      resultsContainer.style.display = 'none';
    });
    
    resultsContainer.appendChild(item);
  });
  
  resultsContainer.style.display = 'block';
}

// Fungsi clear hasil pencarian
function clearSearchResults(info, nipField, resultsContainer, isPegawai) {
  info.textContent = '';
  info.className = 'search-info mt-2';
  nipField.value = '';
  resultsContainer.style.display = 'none';
  
  if (isPegawai) {
    document.getElementById('golongan').value = '';
    document.getElementById('jabatan').value = '';
  }
}