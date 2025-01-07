export const menuItems = [
    {
      label: "Dashboard",
      link: "/dashboard",
      icon: "/Menu/dashboard.svg",
      iconWarna: '/Icon Warna/dashboard.svg',
      submenu: [
        { label: "Overview", link: "/dashboard" },
        { label: "Produk Terlaris", link: "/dashboard/produk-terlaris" },
        { label: "Cabang Terlaris", link: "/dashboard/cabang-terlaris" },
        { label: "Karyawan Terbaik", link: "/dashboard/karyawan-terbaik" },
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
            {label: "KPI Seluruh Divisi", link: '/daftarPenilaianKPI/seluruh-divisi'}
          ],
    },
    {
        label: "Karyawan Absens & Gaji",
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
        link: "/target-kasir",
        icon: "/Menu/targetKasir.svg",
        iconWarna: "/Menu/targetKasir.svg",
        // iconWarna: '/Icon Warna/targetKasir.svg',

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
      iconWarna: '/Icon Warna/dashboard.svg',
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
        iconWarna: '/Icon Warna/laporanKeuangan.svg',
    },
    {
        label: "KPI",
        link: "/daftarPenilaianKPI",
        icon: "/Menu/kpi.svg",
        iconWarna: '/Icon Warna/kpi.svg',
        submenu: [
            {label: "Daftar Penilaian KPI", link: '/daftarPenilaianKPI'},
            {label: "KPI Seluruh Divisi", link: '/daftarPenilaianKPI/seluruh-divisi'}
          ],
    },
    {
        label: "Karyawan Absens & Gaji",
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
    }
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


  
  