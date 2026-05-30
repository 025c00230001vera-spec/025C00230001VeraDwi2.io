/* ============================================================
   SI RAWAT INAP — script.js
   Sistem Informasi Manajemen Rumah Sakit
   ============================================================ */

'use strict';

/* ============================================================
   STATE — Data disimpan di localStorage untuk persistensi
   ============================================================ */
const STATE = {
  pasienMasuk:   JSON.parse(localStorage.getItem('si_pasien_masuk')  || '[]'),
  pasienKeluar:  JSON.parse(localStorage.getItem('si_pasien_keluar') || '[]'),
  biayaLayanan:  JSON.parse(localStorage.getItem('si_biaya_layanan') || '[]'),
};

function saveState() {
  localStorage.setItem('si_pasien_masuk',   JSON.stringify(STATE.pasienMasuk));
  localStorage.setItem('si_pasien_keluar',  JSON.stringify(STATE.pasienKeluar));
  localStorage.setItem('si_biaya_layanan',  JSON.stringify(STATE.biayaLayanan));
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  updateDateTime();
  setInterval(updateDateTime, 60000);

  // Muat tema tersimpan
  const savedTheme = localStorage.getItem('si_theme');
  if (savedTheme === 'dark') document.body.classList.add('dark');

  // Set tanggal default form ke hari ini
  const today = new Date().toISOString().split('T')[0];
  const dateFields = document.querySelectorAll('input[type="date"]');
  dateFields.forEach(function (el) { if (!el.value) el.value = today; });

  // Render semua data
  renderAll();
});

/* ============================================================
   DATETIME
   ============================================================ */
function updateDateTime() {
  const el = document.getElementById('topbarDate');
  if (!el) return;
  const now  = new Date();
  const opts = { weekday:'short', day:'2-digit', month:'short', year:'numeric' };
  el.textContent = now.toLocaleDateString('id-ID', opts);
}

/* ============================================================
   SIDEBAR & THEME TOGGLE
   ============================================================ */
function toggleSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebarOverlay');
  const isOpen   = sidebar.classList.toggle('open');
  overlay.classList.toggle('open', isOpen);
}

function toggleTheme() {
  const dark = document.body.classList.toggle('dark');
  localStorage.setItem('si_theme', dark ? 'dark' : 'light');
}

/* ============================================================
   NAVIGATION — tampilkan section sesuai menu
   ============================================================ */
function showSection(id, linkEl) {
  // Sembunyikan semua section
  document.querySelectorAll('.section').forEach(function (s) {
    s.classList.remove('active');
  });
  // Hapus active dari semua nav-item
  document.querySelectorAll('.nav-item').forEach(function (n) {
    n.classList.remove('active');
  });

  // Tampilkan section yang dipilih
  const target = document.getElementById('section-' + id);
  if (target) target.classList.add('active');

  // Set active pada link
  if (linkEl) linkEl.classList.add('active');

  // Update judul & breadcrumb
  const titles = {
    'dashboard'     : 'Dashboard Analitik',
    'pasien-masuk'  : 'Data Pasien Masuk',
    'pasien-keluar' : 'Transaksi Pasien Keluar',
    'layanan'       : 'Master Biaya Layanan',
    'laporan'       : 'Laporan Detail',
  };
  const crumbs = {
    'dashboard'     : 'Dashboard',
    'pasien-masuk'  : 'Pasien Masuk',
    'pasien-keluar' : 'Pasien Keluar',
    'layanan'       : 'Biaya Layanan',
    'laporan'       : 'Laporan',
  };

  const titleEl = document.getElementById('pageTitle');
  const crumbEl = document.getElementById('breadcrumbCurrent');
  if (titleEl) titleEl.textContent = titles[id] || id;
  if (crumbEl) crumbEl.textContent = crumbs[id] || id;

  // Tutup sidebar di mobile setelah navigasi
  if (window.innerWidth <= 900) toggleSidebar();

  return false;
}

/* ============================================================
   MODAL
   ============================================================ */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('open');
    // Fokus ke input pertama
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 100);
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

// Tutup modal saat klik overlay
document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// Tutup modal saat tekan Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(function (m) {
      closeModal(m.id);
    });
  }
});

/* ============================================================
   TOAST NOTIFICATION
   ============================================================ */
let toastTimer = null;

function showToast(message, type) {
  type = type || 'info';
  const toast = document.getElementById('toast');
  if (!toast) return;

  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className   = 'toast ' + type + ' show';

  toastTimer = setTimeout(function () {
    toast.classList.remove('show');
  }, 3000);
}

/* ============================================================
   HELPERS
   ============================================================ */
function formatRupiah(angka) {
  var n = parseInt(angka, 10);
  if (isNaN(n)) return 'Rp 0';
  return 'Rp ' + n.toLocaleString('id-ID');
}

function formatTanggal(tgl) {
  if (!tgl) return '-';
  var d = new Date(tgl);
  return d.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
}

function generateId(prefix, arr) {
  return prefix + '-' + String(arr.length + 1).padStart(3, '0');
}

/* ============================================================
   RENDER — Pasien Masuk
   ============================================================ */
function renderPasienMasuk() {
  var tbody = document.getElementById('tbodyPasienMasuk');
  if (!tbody) return;

  if (STATE.pasienMasuk.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Belum ada data pasien masuk</td></tr>';
    return;
  }

  tbody.innerHTML = STATE.pasienMasuk.map(function (p, i) {
    return '<tr>' +
      '<td><span style="font-family:var(--mono);font-size:12px;">' + escHtml(p.noReg) + '</span></td>' +
      '<td style="font-weight:600;">' + escHtml(p.nama) + '</td>' +
      '<td>' + escHtml(p.umur) + ' th / ' + escHtml(p.sex) + '</td>' +
      '<td>' + escHtml(p.diagnosa) + '</td>' +
      '<td>' + formatTanggal(p.tglMasuk) + '</td>' +
      '<td><span class="penjamin-badge penjamin-' + p.penjamin.toLowerCase() + '">' + escHtml(p.penjamin) + '</span></td>' +
      '<td>' +
        '<button class="action-btn action-edit" onclick="editPasienMasuk(' + i + ')">Edit</button> ' +
        '<button class="action-btn action-delete" onclick="deletePasienMasuk(' + i + ')">Hapus</button>' +
      '</td>' +
    '</tr>';
  }).join('');
}

/* ============================================================
   RENDER — Pasien Keluar
   ============================================================ */
function renderPasienKeluar() {
  var tbody = document.getElementById('tbodyPasienKeluar');
  if (!tbody) return;

  if (STATE.pasienKeluar.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Belum ada data pasien keluar</td></tr>';
    return;
  }

  tbody.innerHTML = STATE.pasienKeluar.map(function (k, i) {
    return '<tr>' +
      '<td><span style="font-family:var(--mono);font-size:12px;">' + escHtml(k.kode) + '</span></td>' +
      '<td>' + escHtml(k.noReg) + '</td>' +
      '<td>' + formatTanggal(k.tglKeluar) + '</td>' +
      '<td>' + escHtml(k.lamaInap) + ' hari</td>' +
      '<td style="font-weight:700;color:var(--green);">' + formatRupiah(k.totalBiaya) + '</td>' +
      '<td>' +
        '<button class="action-btn action-delete" onclick="deletePasienKeluar(' + i + ')">Hapus</button>' +
      '</td>' +
    '</tr>';
  }).join('');
}

/* ============================================================
   RENDER — Biaya Layanan
   ============================================================ */
function renderBiayaLayanan() {
  var tbody = document.getElementById('tbodyBiayaLayanan');
  if (!tbody) return;

  if (STATE.biayaLayanan.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Belum ada data layanan</td></tr>';
    return;
  }

  tbody.innerHTML = STATE.biayaLayanan.map(function (l, i) {
    return '<tr>' +
      '<td><span style="font-family:var(--mono);font-size:12px;">' + escHtml(l.kode) + '</span></td>' +
      '<td style="font-weight:600;">' + escHtml(l.nama) + '</td>' +
      '<td style="color:var(--green);font-weight:700;">' + formatRupiah(l.biaya) + '</td>' +
      '<td>' + escHtml(l.keterangan || '-') + '</td>' +
      '<td>' +
        '<button class="action-btn action-delete" onclick="deleteLayanan(' + i + ')">Hapus</button>' +
      '</td>' +
    '</tr>';
  }).join('');
}

/* ============================================================
   RENDER — Statistik Layanan (Dashboard)
   ============================================================ */
function renderStatistikLayanan() {
  var tbody = document.getElementById('tbodyLayanan');
  if (!tbody) return;

  // Hitung jumlah pasien dan total pendapatan per layanan
  var stats = {};
  STATE.biayaLayanan.forEach(function (l) {
    stats[l.nama] = { jumlah: 0, total: 0 };
  });

  STATE.pasienKeluar.forEach(function (k) {
    // Coba cocokkan dengan data pasien masuk untuk info layanan
    // Untuk demo, distribusi merata
    var keys = Object.keys(stats);
    if (keys.length > 0) {
      var key = keys[0]; // assign ke layanan pertama sebagai contoh
      stats[key].jumlah += 1;
      stats[key].total  += parseInt(k.totalBiaya || 0, 10);
    }
  });

  var rows = Object.entries(stats);
  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="empty-state">Belum ada data layanan</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(function (r) {
    return '<tr>' +
      '<td style="font-weight:600;">' + escHtml(r[0]) + '</td>' +
      '<td>' + r[1].jumlah + ' pasien</td>' +
      '<td style="color:var(--green);">' + formatRupiah(r[1].total) + '</td>' +
    '</tr>';
  }).join('');
}

/* ============================================================
   RENDER — Rekam Medis (Dashboard & Laporan)
   ============================================================ */
function buildRekamMedisRows(filterDari, filterSampai) {
  // Gabungkan data pasien masuk + keluar
  var rows = STATE.pasienKeluar.map(function (k) {
    var pm = STATE.pasienMasuk.find(function (p) { return p.noReg === k.noReg; });
    return {
      nama     : pm ? pm.nama     : k.noReg,
      diagnosa : pm ? pm.diagnosa : '-',
      masuk    : pm ? pm.tglMasuk : '-',
      keluar   : k.tglKeluar,
      lama     : k.lamaInap,
      layanan  : '-',
      total    : k.totalBiaya,
      operator : 'Budi Santoso',
    };
  });

  // Filter tanggal jika ada
  if (filterDari) {
    rows = rows.filter(function (r) { return r.masuk >= filterDari; });
  }
  if (filterSampai) {
    rows = rows.filter(function (r) { return r.masuk <= filterSampai; });
  }

  return rows;
}

function renderRekamMedis() {
  var tbody = document.getElementById('tbodyRekamMedis');
  if (!tbody) return;
  var rows = buildRekamMedisRows();

  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Belum ada data rekam medis</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(function (r) {
    return '<tr>' +
      '<td style="font-weight:600;">' + escHtml(r.nama) + '</td>' +
      '<td>' + escHtml(r.diagnosa) + '</td>' +
      '<td>' + formatTanggal(r.masuk) + '</td>' +
      '<td>' + formatTanggal(r.keluar) + '</td>' +
      '<td>' + r.lama + ' hr</td>' +
      '<td>' + escHtml(r.layanan) + '</td>' +
      '<td style="color:var(--green);font-weight:700;">' + formatRupiah(r.total) + '</td>' +
      '<td>' + escHtml(r.operator) + '</td>' +
    '</tr>';
  }).join('');
}

/* ============================================================
   RENDER — Laporan
   ============================================================ */
function renderLaporan(filterDari, filterSampai) {
  var tbody = document.getElementById('tbodyLaporan');
  if (!tbody) return;
  var rows = buildRekamMedisRows(filterDari, filterSampai);

  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Belum ada data laporan</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(function (r) {
    return '<tr>' +
      '<td style="font-weight:600;">' + escHtml(r.nama) + '</td>' +
      '<td>' + escHtml(r.diagnosa) + '</td>' +
      '<td>' + formatTanggal(r.masuk) + '</td>' +
      '<td>' + formatTanggal(r.keluar) + '</td>' +
      '<td>' + r.lama + ' hr</td>' +
      '<td>' + escHtml(r.layanan) + '</td>' +
      '<td style="color:var(--green);font-weight:700;">' + formatRupiah(r.total) + '</td>' +
      '<td>' + escHtml(r.operator) + '</td>' +
    '</tr>';
  }).join('');
}

/* ============================================================
   RENDER — Dashboard Stats
   ============================================================ */
function renderDashboardStats() {
  var totalPasien = STATE.pasienMasuk.length;
  var totalPendapatan = STATE.pasienKeluar.reduce(function (s, k) {
    return s + parseInt(k.totalBiaya || 0, 10);
  }, 0);
  var pasienKeluar = STATE.pasienKeluar.length;
  var totalLama = STATE.pasienKeluar.reduce(function (s, k) {
    return s + parseInt(k.lamaInap || 0, 10);
  }, 0);
  var rataInap = pasienKeluar > 0 ? (totalLama / pasienKeluar).toFixed(1) : 0;

  animateNumber('statTotalPasien', totalPasien, '');
  animateNumber('statPendapatan', totalPendapatan, 'rupiah');
  animateNumber('statPasienKeluar', pasienKeluar, '');
  var el = document.getElementById('statRataInap');
  if (el) el.textContent = rataInap + ' hr';
}

function animateNumber(elId, target, type) {
  var el = document.getElementById(elId);
  if (!el) return;
  var start = 0;
  var duration = 600;
  var startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    var progress = Math.min((timestamp - startTime) / duration, 1);
    var val = Math.floor(progress * target);
    el.textContent = type === 'rupiah' ? formatRupiah(val) : val;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = type === 'rupiah' ? formatRupiah(target) : target;
  }

  requestAnimationFrame(step);
}

/* ============================================================
   RENDER ALL
   ============================================================ */
function renderAll() {
  renderDashboardStats();
  renderPasienMasuk();
  renderPasienKeluar();
  renderBiayaLayanan();
  renderStatistikLayanan();
  renderRekamMedis();
  renderLaporan();
}

/* ============================================================
   SUBMIT — Pasien Masuk
   ============================================================ */
function submitPasienMasuk(e) {
  e.preventDefault();

  var noReg    = val('pmNoReg');
  var nama     = val('pmNama');
  var umur     = val('pmUmur');
  var sex      = val('pmSex');
  var diagnosa = val('pmDiagnosa');
  var tglMasuk = val('pmTglMasuk');
  var penjamin = val('pmPenjamin');

  // Cek duplikasi No Reg
  var duplikat = STATE.pasienMasuk.find(function (p) { return p.noReg === noReg; });
  if (duplikat) {
    showToast('No. Registrasi sudah ada!', 'error');
    return;
  }

  STATE.pasienMasuk.push({ noReg:noReg, nama:nama, umur:umur, sex:sex, diagnosa:diagnosa, tglMasuk:tglMasuk, penjamin:penjamin });
  saveState();

  document.getElementById('formPasienMasuk').reset();
  closeModal('modalPasienMasuk');
  renderAll();
  showToast('Data pasien masuk berhasil disimpan!', 'success');
}

/* ============================================================
   SUBMIT — Pasien Keluar
   ============================================================ */
function submitPasienKeluar(e) {
  e.preventDefault();

  var kode       = val('pkKode');
  var noReg      = val('pkNoReg');
  var tglKeluar  = val('pkTglKeluar');
  var lamaInap   = val('pkLamaInap');
  var totalBiaya = val('pkTotalBiaya');

  STATE.pasienKeluar.push({ kode:kode, noReg:noReg, tglKeluar:tglKeluar, lamaInap:lamaInap, totalBiaya:totalBiaya });
  saveState();

  document.getElementById('formPasienKeluar').reset();
  closeModal('modalPasienKeluar');
  renderAll();
  showToast('Data pasien keluar berhasil disimpan!', 'success');
}

/* ============================================================
   SUBMIT — Layanan
   ============================================================ */
function submitLayanan(e) {
  e.preventDefault();

  var kode       = val('lKode');
  var nama       = val('lNama');
  var biaya      = val('lBiaya');
  var keterangan = val('lKeterangan');

  STATE.biayaLayanan.push({ kode:kode, nama:nama, biaya:biaya, keterangan:keterangan });
  saveState();

  document.getElementById('formLayanan').reset();
  closeModal('modalLayanan');
  renderAll();
  showToast('Data layanan berhasil disimpan!', 'success');
}

/* ============================================================
   DELETE
   ============================================================ */
function deletePasienMasuk(i) {
  if (!confirm('Hapus data pasien ini?')) return;
  STATE.pasienMasuk.splice(i, 1);
  saveState();
  renderAll();
  showToast('Data pasien masuk dihapus.', 'info');
}

function deletePasienKeluar(i) {
  if (!confirm('Hapus data keluar ini?')) return;
  STATE.pasienKeluar.splice(i, 1);
  saveState();
  renderAll();
  showToast('Data pasien keluar dihapus.', 'info');
}

function deleteLayanan(i) {
  if (!confirm('Hapus data layanan ini?')) return;
  STATE.biayaLayanan.splice(i, 1);
  saveState();
  renderAll();
  showToast('Data layanan dihapus.', 'info');
}

/* ============================================================
   EDIT — Pasien Masuk (isi ulang form)
   ============================================================ */
function editPasienMasuk(i) {
  var p = STATE.pasienMasuk[i];
  if (!p) return;
  setVal('pmNoReg', p.noReg);
  setVal('pmNama', p.nama);
  setVal('pmUmur', p.umur);
  setVal('pmSex', p.sex);
  setVal('pmDiagnosa', p.diagnosa);
  setVal('pmTglMasuk', p.tglMasuk);
  setVal('pmPenjamin', p.penjamin);

  // Hapus data lama, submit akan menambahkan kembali
  STATE.pasienMasuk.splice(i, 1);
  saveState();
  openModal('modalPasienMasuk');
  showToast('Silakan edit dan simpan kembali.', 'info');
}

/* ============================================================
   FILTER TABLE (pencarian)
   ============================================================ */
function filterTable(tbodyId, query) {
  var tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  var q = query.toLowerCase().trim();
  var rows = tbody.querySelectorAll('tr');
  rows.forEach(function (row) {
    var text = row.textContent.toLowerCase();
    row.style.display = (q === '' || text.includes(q)) ? '' : 'none';
  });
}

/* ============================================================
   FILTER LAPORAN
   ============================================================ */
function filterLaporan() {
  var dari    = val('filterDari');
  var sampai  = val('filterSampai');
  renderLaporan(dari || null, sampai || null);
  showToast('Laporan difilter.', 'info');
}

/* ============================================================
   CETAK LAPORAN
   ============================================================ */
function printLaporan() {
  window.print();
}

/* ============================================================
   UTILITY
   ============================================================ */
function val(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setVal(id, v) {
  var el = document.getElementById(id);
  if (el) el.value = v;
}

function escHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
