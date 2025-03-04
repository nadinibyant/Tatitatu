export const menuItems = [
    {
      label: "Dashboard",
      link: "/dashboard",
      icon: "/Menu/dashboard.svg",
      iconWarna: '/Icon Warna/dashboard.svg',
      submenu: [
        { label: "Overview", link: "/dashboard" },
        { label: "Produk Terlaris", link: "/dashboard/produk-terlaris" },
        { label: "Cabang Terbaik", link: "/dashboard/cabang-terlaris" },
        { label: "Karyawan Terbaik", link: "/dashboard/karyawan-terbaik" },
        { label: "Hari Terlaris", link: "/dashboard/hari-terlaris" },
      ],
    },
    {
        label: "Biaya Toko",
        link: "/biayaGudang",
        icon: "/Menu/biayaToko.svg",
        iconWarna: '/Icon Warna/biayaToko.svg',

    },
    {
        label: "Data Barang",
        link: "/dataBarang",
        icon: "/Menu/dataBarang.svg",
        iconWarna: '/Icon Warna/dataBarang.svg',
        submenu: [
            { label: "Barang Handmade", link: "/dataBarang/handmade" },
            { label: "Barang Non-Handmade", link: "/dataBarang/non-handmade" },
            { label: "Barang Custom", link: "/dataBarang/custom" },
            { label: "Packaging", link: "/dataBarang/packaging" },
        ],
    },
    {
        label: "Stok Barang",
        link: "/stokBarang",
        icon: "/Menu/stokBarang.svg",
        iconWarna: '/Icon Warna/stokBarang.svg',
    },
    {
        label: "Pembelian Stok",
        link: "/pembelianStok",
        icon: "/Menu/pembelianStok.svg",
        iconWarna: '/Icon Warna/pembelianStok.svg',
    },
    {
        label: "Penjualan",
        link: "/penjualanToko",
        icon: "/Menu/penjualan.svg",
        iconWarna: '/Icon Warna/penjualan.svg',
    },
    {
        label: "KPI",
        link: "/daftarPenilaianKPI",
        icon: "/Menu/kpi.svg",
        iconWarna: '/Icon Warna/kpi.svg',
        submenu: [
            {label: "Daftar Penilaian KPI", link: '/daftarPenilaianKPI'},
            {label: "KPI Divisi", link: '/daftarPenilaianKPI/seluruh-divisi'}
          ],
    },
    {
        label: "Karyawan Absensi & Gaji",
        link: "/dataKaryawanAbsenGaji",
        icon: "/Menu/karyawanAbsensi.svg",
        iconWarna: '/Icon Warna/karyawanAbsensi.svg',
    },
    {
        label: "Akun Karyawan",
        link: "/akunKaryawan",
        icon: "/Menu/akunKaryawan.svg",
        iconWarna: '/Icon Warna/akunKaryawan.svg',
    },
    {
        label: "Izin/Cuti Karyawan",
        link: "/pengajuanCuti",
        icon: "/Menu/izinCuti.svg",
        iconWarna: '/Icon Warna/izinCuti.svg',
    },
    {
        label: "Laporan Keuangan Toko",
        link: "/laporanKeuangan",
        icon: "/Menu/laporanKeuangan.svg",
        iconWarna: '/Icon Warna/laporanKeuangan.svg',
    },
    {
        label: "Cabang",
        link: "/daftarCabang",
        icon: "/Menu/cabang.svg",
        iconWarna: '/Icon Warna/cabang.svg',
    },
    {
        label: "Target Kasir",
        link: "/target-bulanan",
        icon: "/Menu/targetKasir.svg",
        iconWarna: '/Icon Warna/targetKasir.svg',

    },
    {
        label: "Master Kategori",
        link: "/master-kategori",
        icon: "/Menu/masterKategori.svg",
        iconWarna: '/Icon Warna/masterKategori.svg',
    },

  ];
  
  export const userOptions = [
    { label: "Profile", link: "/profile" },
    { label: "Logout", link: "/logout" },
  ];

// headGudang
  export const menuHeadGudang = [
    {
      label: "Dashboard",
      link: "/dashboard",
      icon: "/Menu/dashboard.svg",
      iconWarna: '/Icon Warna/dashboard_gudang.svg',
      submenu: [
        { label: "Overview", link: "/dashboard" },
        { label: "Produk Terlaris", link: "/dashboard/produk-terlaris" },
        { label: "Karyawan Terbaik", link: "/dashboard/karyawan-terbaik" },
      ],
    },
    {
        label: "Laporan Keuangan Toko",
        link: "/laporanKeuangan",
        icon: "/Menu/laporanKeuangan.svg",
        iconWarna: '/Icon Warna/laporanKeuangan_gudang.svg',
    },
    {
        label: "KPI",
        link: "/daftarPenilaianKPI",
        icon: "/Menu/kpi.svg",
        iconWarna: '/Icon Warna/kpi_gudang.svg',
        submenu: [
            {label: "Daftar Penilaian KPI", link: '/daftarPenilaianKPI'},
            {label: "KPI Seluruh Divisi", link: '/daftarPenilaianKPI/seluruh-divisi'}
          ],
    },
    {
        label: "Karyawan Absensi & Gaji",
        link: "/dataKaryawanAbsenGaji",
        icon: "/Menu/karyawanAbsensi.svg",
        iconWarna: '/Icon Warna/karyawanAbsensi_gudang.svg',
    },
    {
        label: "Akun Karyawan",
        link: "/akunKaryawan",
        icon: "/Menu/akunKaryawan.svg",
        iconWarna: '/Icon Warna/akunKaryawan_gudang.svg',
    },
    {
        label: "Izin/Cuti Karyawan",
        link: "/pengajuanCuti",
        icon: "/Menu/izinCuti.svg",
        iconWarna: '/Icon Warna/izinCuti_gudang.svg',
    },
    {
      label: "Master Kategori",
      link: "/master-kategori",
      icon: "/Menu/masterKategori.svg",
      iconWarna: '/Icon Warna/masterKategori_gudang.svg',
    },
  ];

//   kasir toko
  export const menuKasirToko = [
    {
      label: "Dashboard",
      link: "/dashboard-kasir",
      icon: "/Menu/dashboard.svg",
      iconWarna: '/Icon Warna/dashboard.svg',
    },
    {
        label: "Stok Barang",
        link: "/stokBarang",
        icon: "/Menu/stokBarang.svg",
        iconWarna: '/Icon Warna/stokBarang.svg',
    },
    {
        label: "Penjualan",
        link: "/penjualan-kasir",
        icon: "/Menu/penjualan.svg",
        iconWarna: '/Icon Warna/penjualan.svg',
    },
    {
        label: "Master Kategori",
        link: "/master-kategori",
        icon: "/Menu/masterKategori.svg",
        iconWarna: '/Icon Warna/masterKategori.svg',
    },
  ];

  export const menuAdminGudang = [
    {
      label: "Dashboard",
      link: "/dashboard-admin-gudang",
      icon: "/Menu/dashboard.svg",
      iconWarna: '/Icon Warna/dashboard_gudang.svg',
    },
    {
      label: "Biaya Rumah Produksi",
      link: "/biaya-gudang",
      icon: "/Menu/biayaToko.svg",
      iconWarna: '/Icon Warna/biayaToko_gudang.svg',
    },
    {
      label: "Data Barang",
      link: "/dataBarang",
      icon: "/Menu/dataBarang.svg",
      iconWarna: '/Icon Warna/dataBarang_gudang.svg',
      submenu: [
          { label: "Barang Handmade", link: "/dataBarang/handmade" },
          { label: "Barang Non-Handmade", link: "/dataBarang/non-handmade" },
          { label: "Barang Mentah", link: "/dataBarang/mentah" },
          { label: "Packaging", link: "/dataBarang/packaging" },
      ],
    },
    {
      label: "Stok Barang",
      link: "/stokBarang",
      icon: "/Menu/stokBarang.svg",
      iconWarna: '/Icon Warna/stokBarang_gudang.svg',
    },
    {
      label: "Penjualan",
      link: "/penjualan-admin-gudang",
      icon: "/Menu/penjualan.svg",
      iconWarna: '/Icon Warna/penjualan_gudang.svg',
    },
    {
      label: "Pembelian Stok",
      link: "/pembelianStok",
      icon: "/Menu/pembelianStok.svg",
      iconWarna: '/Icon Warna/pembelianStok_gudang.svg',
    },
    {
      label: "Pengajuan Absensi",
      link: "/pengajuanAbsensi",
      icon: "/Menu/absensi.svg",
      iconWarna: '/Icon Warna/absensi_gudang.svg',
    },
    {
      label: "Master Kategori",
      link: "/master-kategori",
      icon: "/Menu/masterKategori.svg",
      iconWarna: '/Icon Warna/masterKategori_gudang.svg',
  },
  ]

  export const menuKaryawan = [
    {
      label: "Absensi",
      link: "/absensi-karyawan",
      icon: "/Menu/absensi.svg",
      iconWarna: '/Icon Warna/absensi.svg',
    },
    {
      label: "Izin/Cuti Karyawan",
      link: "/izin-cuti-karyawan",
      icon: "/Menu/izinCuti.svg",
      iconWarna: '/Icon Warna/izinCuti.svg',
    },
  ]
  
  export const menuKaryawanTransport = [
    {
      label: "Absensi",
      link: "/absensi-karyawan-transport",
      icon: "/Menu/absensi.svg",
      iconWarna: '/Icon Warna/absensi.svg',
    },
    {
      label: "Izin/Cuti Karyawan",
      link: "/izin-cuti-karyawan",
      icon: "/Menu/izinCuti.svg",
      iconWarna: '/Icon Warna/izinCuti.svg',
    },
  ]

  export const menuKaryawanProduksi = [
    {
      label: "Absensi",
      link: "/absensi-karyawan-produksi",
      icon: "/Menu/absensi.svg",
      iconWarna: '/Icon Warna/absensi.svg',
    },
    {
      label: "Izin/Cuti Karyawan",
      link: "/izin-cuti-karyawan",
      icon: "/Menu/izinCuti.svg",
      iconWarna: '/Icon Warna/izinCuti.svg',
    },
  ]
  
  export const menuOwner = [
    {
      label: "Dashboard",
      link: "/dashboard",
      icon: "/Menu/dashboard.svg",
      iconWarna: '/Icon Warna/dashboard_non.svg',
      submenu: [
        { label: "Overview", link: "/dashboard" },
        { label: "Produk Terlaris", link: "/dashboard/produk-terlaris" },
        { label: "Toko Terbaik", link: "/dashboard/toko-terbaik" },
        { label: "Karyawan Terbaik", link: "/dashboard/karyawan-terbaik" },
        { label: "Hari Terlaris", link: "/dashboard/hari-terlaris" },
      ],
    },
    {
      label: "Laporan Keuangan Perusahaan",
      link: "/laporanKeuangan",
      icon: "/Menu/laporanKeuangan.svg",
      iconWarna: '/Icon Warna/laporanKeuangan_non.svg',
    },
    {
      label: "Catatan dari Manajer",
      link: "/catatan",
      icon: "/Menu/catatan.svg",
      iconWarna: '/Icon Warna/catatan_non.svg',
    },
  ]

  export const menuFinance = [
    {
      label: "Laporan Keuangan Perusahaan",
      link: "/laporanKeuangan",
      icon: "/Menu/laporanKeuangan.svg",
      iconWarna: '/Icon Warna/laporanKeuangan_non.svg',
    },
    {
      label: "Pemasukan",
      link: "/pemasukan",
      icon: "/Menu/pemasukan.svg",
      iconWarna: '/Icon Warna/pemasukan_non.svg',
    },
    {
      label: "Pengeluaran",
      link: "/pengeluaran",
      icon: "/Menu/pengeluaran.svg",
      iconWarna: '/Icon Warna/pengeluaran_non.svg',
    },
    {
      label: "Master Kategori",
      link: "/master-kategori",
      icon: "/Menu/masterKategori.svg",
      iconWarna: '/Icon Warna/masterKategori_non.svg',
    },
  ]

  export const menuManajer = [
    {
      label: "Dashboard",
      link: "/dashboard",
      icon: "/Menu/dashboard.svg",
      iconWarna: '/Icon Warna/dashboard_non.svg',
      submenu: [
        { label: "Overview", link: "/dashboard" },
        { label: "Produk Terlaris", link: "/dashboard/produk-terlaris" },
        { label: "Toko Terbaik", link: "/dashboard/toko-terbaik" },
        { label: "Karyawan Terbaik", link: "/dashboard/karyawan-terbaik" },
        { label: "Hari Terlaris", link: "/dashboard/hari-terlaris" },
      ],
    },
    {
      label: "KPI",
      link: "/daftarPenilaianKPI",
      icon: "/Menu/kpi.svg",
      iconWarna: '/Icon Warna/kpi_non.svg',
      submenu: [
          {label: "Daftar Penilaian KPI", link: '/daftarPenilaianKPI'},
          {label: "KPI Seluruh Divisi", link: '/daftarPenilaianKPI/seluruh-divisi'}
        ],
    },
    {
      label: "Karyawan Absensi & Gaji",
      link: "/karyawan-absen-gaji",
      icon: "/Menu/karyawanAbsensi.svg",
      iconWarna: '/Icon Warna/karyawanAbsensi_non.svg',
    },
    {
      label: "Laporan Keuangan Perusahaan",
      link: "/laporanKeuangan",
      icon: "/Menu/laporanKeuangan.svg",
      iconWarna: '/Icon Warna/laporanKeuangan_non.svg',
    },
    {
      label: "Toko",
      link: "/toko",
      icon: "/Menu/toko.svg",
      iconWarna: '/Icon Warna/toko_non.svg',
    },
    {
      label: "Catatan",
      link: "/catatan",
      icon: "/Menu/catatan.svg",
      iconWarna: '/Icon Warna/catatan_non.svg',
    },
  ]
  