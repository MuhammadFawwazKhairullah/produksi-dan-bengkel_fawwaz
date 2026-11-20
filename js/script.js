document.addEventListener('DOMContentLoaded', function () {
  function rupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
  }

  function bacaTanggal(teks) {
    var p = teks.split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function tampilkanStatusBuka() {
    var kotak = document.querySelectorAll('.fawwaz_info');
    if (kotak.length === 0) return;

    var bagian = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      weekday: 'short',
      hour: '2-digit',
      hour12: false
    }).formatToParts(new Date());

    var hari = '';
    var jam = 0;
    bagian.forEach(function (b) {
      if (b.type === 'weekday') hari = b.value;
      if (b.type === 'hour') jam = Number(b.value) % 24;
    });

    var buka = hari !== 'Sun' && jam >= 8 && jam < 17;

    kotak.forEach(function (k) {
      if (k.textContent.indexOf('Jam Operasional') === -1) return;
      var status = document.createElement('p');
      status.style.fontWeight = '700';
      status.style.color = buka ? '#15803d' : '#b91c1c';
      status.textContent = buka
        ? 'Bengkel sedang buka sekarang.'
        : 'Bengkel sedang tutup. Kami buka lagi pada jam operasional.';
      k.appendChild(status);
    });
  }

  tampilkanStatusBuka();
  document.querySelectorAll('input[type="tel"]').forEach(function (input) {
    input.addEventListener('input', function () {
      input.value = input.value.replace(/\D/g, '').slice(0, 13);
    });
  });

  var tanggal = document.getElementById('fawwaz_tanggal');
  if (tanggal) {

    var sekarang = new Date();
    var bulan = String(sekarang.getMonth() + 1).padStart(2, '0');
    var tgl = String(sekarang.getDate()).padStart(2, '0');
    tanggal.min = sekarang.getFullYear() + '-' + bulan + '-' + tgl;

    tanggal.addEventListener('input', function () {
      if (tanggal.value && bacaTanggal(tanggal.value).getDay() === 0) {
        tanggal.setCustomValidity('Bengkel tutup hari Minggu. Pilih Senin sampai Sabtu.');
        tanggal.reportValidity();
      } else {
        tanggal.setCustomValidity('');
      }
    });
  }

  var plat = document.getElementById('fawwaz_plat');
  if (plat) {
    plat.addEventListener('input', function () {
      plat.value = plat.value.toUpperCase();
    });
  }

  var pilihProduk = document.getElementById('fawwaz_produk');
  var jumlah = document.getElementById('fawwaz_jumlah');

  if (pilihProduk && jumlah) {

    var param = new URLSearchParams(window.location.search);
    if (param.get('produk')) pilihProduk.value = param.get('produk');
    if (param.get('jumlah')) jumlah.value = param.get('jumlah');

    var totalEl = document.createElement('p');
    totalEl.style.fontWeight = '700';
    totalEl.style.color = '#1a8fe3';
    jumlah.parentNode.insertAdjacentElement('afterend', totalEl);

    function hitungTotal() {
      var teks = pilihProduk.options[pilihProduk.selectedIndex].text;
      var cocok = teks.match(/Rp\s*([\d.]+)/);
      var qty = parseInt(jumlah.value, 10);

      if (!cocok || isNaN(qty) || qty < 1) {
        totalEl.textContent = '';
        return;
      }
      var harga = parseInt(cocok[1].replace(/\./g, ''), 10);
      totalEl.textContent = 'Perkiraan total: ' + rupiah(harga * qty) + ' (belum termasuk ongkos pasang)';
    }

    pilihProduk.addEventListener('change', hitungTotal);
    jumlah.addEventListener('input', hitungTotal);
    hitungTotal();

    var alamat = document.getElementById('fawwaz_alamat');
    var radioAmbil = document.querySelectorAll('input[name="ambil"]');

    function aturAlamat() {
      var kirim = document.getElementById('fawwaz_p2').checked;
      alamat.required = kirim;
      alamat.disabled = !kirim;
      if (!kirim) alamat.value = '';
    }

    radioAmbil.forEach(function (r) {
      r.addEventListener('change', aturAlamat);
    });
    aturAlamat();
  }

  var pesan = document.getElementById('fawwaz_pesan');
  if (pesan) {
    var batas = 500;
    pesan.maxLength = batas;

    var hitung = document.createElement('small');
    pesan.insertAdjacentElement('afterend', hitung);

    function updateHitung() {
      hitung.textContent = pesan.value.length + ' / ' + batas + ' karakter';
    }
    pesan.addEventListener('input', updateHitung);
    updateHitung();
  }

  var NOMOR_WA = '6282124972947';

  function labelRadio(nama) {
    var r = document.querySelector('input[name="' + nama + '"]:checked');
    if (!r) return '-';
    var l = document.querySelector('label[for="' + r.id + '"]');
    return l ? l.textContent.trim() : r.value;
  }

  function teksPilihan(select) {
    return select.options[select.selectedIndex].text.trim();
  }

  function kirimKeWhatsApp(form, baris) {
    var pesanWA = baris.join('\n');
    var url = 'https://wa.me/' + NOMOR_WA + '?text=' + encodeURIComponent(pesanWA);
    var jendela = window.open(url, '_blank');
    if (!jendela) {
      window.location.href = url;
      return;
    }
    form.reset();
    window.location.hash = 'fawwaz_terima';
    var terimaEl = document.getElementById('fawwaz_terima');
    if (terimaEl) terimaEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (document.getElementById('fawwaz_tanggal')) {
    var formBooking = document.getElementById('fawwaz_tanggal').form;
    formBooking.addEventListener('submit', function (e) {
      e.preventDefault();
      var tglTeks = bacaTanggal(document.getElementById('fawwaz_tanggal').value)
        .toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

      kirimKeWhatsApp(formBooking, [
        '*BOOKING BENGKEL*',
        'Priangan Automotive Glass',
        '',
        'Nama: ' + document.getElementById('fawwaz_nama').value,
        'Telepon: ' + document.getElementById('fawwaz_telp').value,
        'Merek mobil: ' + teksPilihan(document.getElementById('fawwaz_merk')),
        'Plat nomor: ' + document.getElementById('fawwaz_plat').value,
        'Layanan: ' + labelRadio('layanan'),
        'Tanggal datang: ' + tglTeks
      ]);
    });
  }

  if (document.getElementById('fawwaz_produk')) {
    var formPesan = document.getElementById('fawwaz_produk').form;
    formPesan.addEventListener('submit', function (e) {
      e.preventDefault();
      var selectProduk = document.getElementById('fawwaz_produk');
      var qty = parseInt(document.getElementById('fawwaz_jumlah').value, 10);
      var cocok = teksPilihan(selectProduk).match(/Rp\s*([\d.]+)/);
      var total = cocok ? rupiah(parseInt(cocok[1].replace(/\./g, ''), 10) * qty) : '-';
      var kirim = document.getElementById('fawwaz_p2').checked;

      var baris = [
        '*PESANAN KACA MOBIL*',
        'Priangan Automotive Glass',
        '',
        'Nama: ' + document.getElementById('fawwaz_nama').value,
        'Telepon: ' + document.getElementById('fawwaz_telp').value,
        'Produk: ' + teksPilihan(selectProduk),
        'Jumlah: ' + qty,
        'Perkiraan total: ' + total + ' (belum termasuk ongkos pasang)',
        'Pengambilan: ' + labelRadio('ambil')
      ];
      if (kirim) baris.push('Alamat: ' + document.getElementById('fawwaz_alamat').value);

      kirimKeWhatsApp(formPesan, baris);
    });
  }

  if (document.getElementById('fawwaz_pesan')) {
    var formKontak = document.getElementById('fawwaz_pesan').form;
    formKontak.addEventListener('submit', function (e) {
      e.preventDefault();
      kirimKeWhatsApp(formKontak, [
        '*PESAN DARI WEBSITE*',
        'Priangan Automotive Glass',
        '',
        'Nama: ' + document.getElementById('fawwaz_nama').value,
        'Email: ' + document.getElementById('fawwaz_email').value,
        'Pesan: ' + document.getElementById('fawwaz_pesan').value
      ]);
    });
  }

  var terima = document.getElementById('fawwaz_terima');
  if (terima && window.location.hash === '#fawwaz_terima') {
    terima.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

});