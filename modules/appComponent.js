// Fungsi untuk merender komponen utama aplikasi
export function renderApp() {
  const appContainer = document.getElementById('app');
  
  if (!appContainer) return;
  
  appContainer.innerHTML = `
    <div class="form-card" id="print-area">
      <!-- Header Form -->
      <div class="form-header">
        <h1 class="text-xl md:text-2xl font-bold">Form Konfirmasi Kehadiran</h1>
        <p class="text-sm opacity-90 mt-1">Silakan isi form berikut untuk konfirmasi kehadiran yang tidak terekam</p>
      </div>
      
      <div class="form-body">
        <!-- Form Input Data -->
        <form id="absenForm" class="space-y-6">
          <!-- Page Indicator -->
          <div class="page-indicator">
            <div class="page-step active" id="step1">1</div>
            <div class="page-step" id="step2">2</div>
            <div class="page-step" id="step3">3</div>
            <div class="page-step" id="step4">4</div>
          </div>
          
          <!-- Halaman 1: Data Diri dan Atasan -->
          <div class="form-page active" id="page1">
            <!-- Data Pegawai -->
            <div>
              <h2 class="section-title"><i class="fas fa-user-circle mr-2"></i>Data Pegawai</h2>
              <div class="form-group">
                <label for="nama" class="form-label required">Nama Pegawai / NIP</label>
                <div class="input-with-icon">
                  <input type="text" id="nama" name="Nama" required class="form-control" placeholder="Ketik nama atau NIP...">
                  <i class="fas fa-search" style="position:absolute; right:1rem; top:50%; transform:translateY(-50%); color:#94a3b8;"></i>
                  <div id="nama-results" class="search-result"></div>
                </div>
                <input type="hidden" id="nip" name="NIP">
                <input type="hidden" id="golongan" name="Golongan">
                <input type="hidden" id="jabatan" name="Jabatan">
                <p id="info-nama" class="search-info mt-2"></p>
              </div>
            </div>
            
            <!-- Data Atasan -->
            <div>
              <h2 class="section-title"><i class="fas fa-user-tie mr-2"></i>Data Atasan</h2>
              <div class="form-group">
                <label for="atasan1" class="form-label required">Atasan Langsung</label>
                <div class="input-with-icon">
                  <input type="text" id="atasan1" name="AtasanLangsung" required class="form-control" placeholder="Cari nama atasan...">
                  <i class="fas fa-search" style="position:absolute; right:1rem; top:50%; transform:translateY(-50%); color:#94a3b8;"></i>
                  <div id="atasan1-results" class="search-result"></div>
                </div>
                <input type="hidden" id="nip_atasan1" name="NIP_AtasanLangsung">
                <p id="info-atasan1" class="search-info mt-2"></p>
              </div>
              
              <div class="form-group">
                <label for="atasan2" class="form-label required">Atasan dari Atasan Langsung</label>
                <div class="input-with-icon">
                  <input type="text" id="atasan2" name="AtasanDariAtasanLangsung" required class="form-control" placeholder="Cari nama atasan atas...">
                  <i class="fas fa-search" style="position:absolute; right:1rem; top:50%; transform:translateY(-50%); color:#94a3b8;"></i>
                  <div id="atasan2-results" class="search-result"></div>
                </div>
                <input type="hidden" id="nip_atasan2" name="NIP_AtasanDariAtasanLangsung">
                <p id="info-atasan2" class="search-info mt-2"></p>
              </div>
            </div>
            
            <div class="page-nav">
              <div></div>
              <button type="button" class="btn btn-primary" onclick="nextPage(1)">
                Selanjutnya <i class="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
          
          <!-- Halaman 2: Tanggal, Waktu dan Lokasi -->
          <div class="form-page" id="page2">
            <h2 class="section-title"><i class="fas fa-calendar-check mr-2"></i>Detail Kehadiran</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="form-group">
                <label for="tanggal" class="form-label required">Tanggal</label>
                <input type="date" id="tanggal" name="Tanggal" required class="form-control">
              </div>
              <div class="form-group">
                <label for="waktu" class="form-label required">Waktu</label>
                <input type="time" id="waktu" name="Waktu" required class="form-control">
              </div>
              <div class="form-group">
                <label for="lokasi" class="form-label required">Lokasi</label>
                <input type="text" id="lokasi" name="Lokasi" required class="form-control" placeholder="Lokasi presensi">
              </div>
            </div>
            
            <div class="page-nav">
              <button type="button" class="btn btn-secondary" onclick="prevPage(2)">
                <i class="fas fa-arrow-left mr-2"></i> Kembali
              </button>
              <button type="button" class="btn btn-primary" onclick="nextPage(2)">
                Selanjutnya <i class="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
          
          <!-- Halaman 3: Upload Bukti -->
          <div class="form-page" id="page3">
            <h2 class="section-title"><i class="fas fa-file-upload mr-2"></i>Upload Bukti</h2>
            
            <div class="form-group">
              <label for="bukti" class="form-label required">Bukti Screenshot CCTV/Google Linimasa</label>
              <div class="file-upload">
                <label class="file-upload-btn">
                  <i class="fas fa-cloud-upload-alt mr-2"></i>
                  <span id="file-label">Pilih file gambar (JPG, PNG)</span>
                  <input type="file" id="bukti" name="Bukti" accept="image/*" required class="file-upload-input">
                </label>
                <div id="file-name" class="file-name"></div>
              </div>
              <div class="text-xs text-slate-500 mt-1">Maksimal ukuran file: 2MB</div>
            </div>
            
            <div id="loading" class="hidden p-4 bg-blue-50 text-blue-600 rounded-lg">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              <span>Mengunggah file, mohon tunggu...</span>
            </div>
            
            <div id="error-display"></div>
            
            <div class="page-nav">
              <button type="button" class="btn btn-secondary" onclick="prevPage(3)">
                <i class="fas fa-arrow-left mr-2"></i> Kembali
              </button>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-paper-plane mr-2"></i>Kirim & Cetak
              </button>
            </div>
          </div>
          
          <!-- Halaman 4: Ucapan Terima Kasih -->
          <div class="form-page" id="page4">
            <div class="thank-you-page">
              <div class="thank-you-icon animate__animated animate__bounceIn">
                <i class="fas fa-check-circle bounce"></i>
              </div>
              <h2 class="thank-you-title animate__animated animate__fadeIn">Terima Kasih!</h2>
              <p class="thank-you-message animate__animated animate__fadeIn">
                Formulir berhasil disimpan. Harap cetak dokumen, mintakan tanda tangan persetujuan oleh atasan, lalu serahkan ke Subbag Kepegawaian Gedung TU Tower Lt 4.
              </p>
              <button type="button" class="btn btn-primary animate__animated animate__fadeInUp" onclick="resetForm()">
                <i class="fas fa-redo mr-2"></i> Isi Form Baru
              </button>
            </div>
          </div>
        </form>
        
        <!-- Bagian Cetak Surat Pernyataan -->
        <div id="cetak-area" class="p-10" style="font-family:'Poppins',sans-serif;font-size:12pt;">
          <div class="flex justify-center mt-6 mb-4 print:hidden">
            <button id="savePdfBtn" class="btn btn-primary">
              <i class="fas fa-file-pdf mr-2"></i> Simpan ke PDF
            </button>
          </div>
          
          <div style="text-align:center;font-weight:bold;text-decoration:underline;margin-bottom:20px;font-size:14pt;">SURAT PERNYATAAN</div>

          <p>Yang bertanda tangan di bawah ini:</p>
          <table style="margin-left:40px;margin-bottom:15px;">
            <tr><td style="width:120px;">Nama</td><td>: <span id="cetak-nama"></span></td></tr>
            <tr><td>NIP</td><td>: <span id="cetak-nip"></span></td></tr>
            <tr><td>Golongan</td><td>: <span id="cetak-golongan"></span></td></tr>
            <tr><td>Jabatan</td><td>: <span id="cetak-jabatan"></span></td></tr>
          </table>

          <p>Dengan ini menyatakan bahwa saya telah melakukan presensi namun tidak terekam, yaitu pada:</p>
          <table style="margin-left:40px;margin-bottom:15px;">
            <tr><td style="width:120px;padding-right:10px;vertical-align:top;">Hari/Tanggal</td><td style="vertical-align:top;">: <span id="cetak-haritanggal"></span></td></tr>
            <tr><td style="width:120px;padding-right:10px;vertical-align:top;">Waktu</td><td style="vertical-align:top;">: <span id="cetak-waktu"></span> WIB</td></tr>
            <tr><td style="width:120px;padding-right:10px;vertical-align:top;">Lokasi</td><td style="vertical-align:top;">: <span id="cetak-lokasi"></span></td></tr>
          </table>

          <p style="margin-top:20px;">Terlampir screenshoot tampilan CCTV atau Google Linimasa saya. Demikian surat pernyataan ini saya buat dengan sebenar-benarnya dan dapat dipertanggungjawabkan. </p>

          <div style="text-align:right;margin:10px 0 0 0;">Bogor, <span id="tanggal-surat"></span></div>

          <table style="width:100%;text-align:center;border-collapse:collapse;margin-top:20px;">
            <tr>
              <td style="width:40%;">
                <div class="ttd-space">
                  <div class="ttd-name">
                    Menyetujui,<br>
                    Atasan Langsung<br><br>
                    <span id="cetak-atasan1"></span><br>
                    NIP. <span id="cetak-nip-atasan1"></span>
                  </div>
                </div>
              </td>
              <td style="width:20%;"></td>
              <td style="width:40%;">
                <div class="ttd-space">
                  <div class="ttd-name">
                    Yang Menyatakan,<br><br>
                    <span id="ttd-nama"></span><br>
                    NIP. <span id="ttd-nip"></span>
                  </div>
                </div>
              </td>
            </tr>
          </table>

          <div style="text-align:center;margin-top:30px;">
            <div class="ttd-space">
              <div class="ttd-name">
                Disetujui oleh:<br>
                Atasan dari Atasan Langsung<br><br>
                <span id="cetak-atasan2"></span><br>
                NIP. <span id="cetak-nip-atasan2"></span>
              </div>
            </div>
          </div>

          <!-- Halaman Bukti -->
          <div class="proof-page">
            <div style="text-align:center; margin-bottom:1rem;">
              <div style="font-weight:bold; font-size:14pt; text-decoration:underline">
                LAMPIRAN BUKTI KEHADIRAN
              </div>
              <div style="font-size:11pt; color:#555; margin-top:4px">
                (Tidak berlaku tanpa paraf/tanda tangan atasan langsung)
              </div>
            </div>
            
            <div class="proof-container">
              <div style="text-align:center; font-weight:500; margin-bottom:8px">
                <span id="proof-nama"></span> <br>
                NIP: <span id="proof-nip"></span>
              </div>
              
              <div id="proof-image-container">
                <!-- Gambar akan muncul di sini -->
              </div>
              
              <div style="text-align:center; margin-top:12px; font-size:11pt">
                <div>Tanggal: <span id="proof-tanggal"></span></div>
                <div>Waktu: <span id="proof-waktu"></span> WIB</div>
                <div>Lokasi: <span id="proof-lokasi"></span></div>
              </div>
              
              <div style="text-align:center; font-size:9pt; color:#777; margin-top:16px; padding-top:8px; border-top:1px dashed #ddd">
                Dicetak otomatis pada <span id="proof-timestamp"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Fungsi navigasi halaman
export function nextPage(currentPage) {
  // Validasi sebelum pindah halaman
  if (currentPage === 1 && !validatePage1()) return;
  if (currentPage === 2 && !validatePage2()) return;
  
  document.getElementById(`page${currentPage}`).classList.remove('active');
  document.getElementById(`page${currentPage + 1}`).classList.add('active');
  
  // Update step indicator
  document.getElementById(`step${currentPage}`).classList.remove('active');
  document.getElementById(`step${currentPage}`).classList.add('completed');
  document.getElementById(`step${currentPage + 1}`).classList.add('active');
}

export function prevPage(currentPage) {
  document.getElementById(`page${currentPage}`).classList.remove('active');
  document.getElementById(`page${currentPage - 1}`).classList.add('active');
  
  // Update step indicator
  document.getElementById(`step${currentPage}`).classList.remove('active');
  document.getElementById(`step${currentPage - 1}`).classList.add('active');
}

// Fungsi reset form
export function resetForm() {
  const { resetForm } = await import('../utils.js');
  resetForm();
}

// Tambahkan fungsi ke window agar bisa diakses dari HTML
window.nextPage = nextPage;
window.prevPage = prevPage;
window.resetForm = resetForm;