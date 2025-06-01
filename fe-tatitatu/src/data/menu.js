const userData = JSON.parse(localStorage.getItem('userData'));
const userId = userData?.userId ? Number(userData.userId) : null;
const isManajer = userData?.role === 'manajer';
const isKasirToko = userData?.role === 'kasirtoko';
const isAdminGudang = userData?.role === 'admingudang';
const isHeadGudang = userData?.role === 'headgudang';
const isOwner = userData?.role === 'owner';
const isAdmin = userData?.role === 'admin';
const isFinance = userData?.role === 'finance';
const isKaryawanProduksi = userData?.role === 'karyawanproduksi';
const isKaryawanTransportasi = userData?.role === 'karyawantransportasi';
const isKaryawanUmum = userData?.role === 'karyawanumum';
const isKaryawanLogistik = userData?.role === 'karyawanlogistik';

// Get current route for Absensi routes check
const currentPath = window.location.pathname;
const isAbsensiRoute = 
  currentPath === '/absensi-karyawan' || 
  currentPath === '/absensi-karyawan-transport' || 
  currentPath === '/absensi-karyawan-produksi' ||
  currentPath.startsWith('/absensi-karyawan-produksi/tambah');

const toko_id = userData?.tokoId;

const themeColor = isAbsensiRoute
  ? (!toko_id 
      ? "biruTua" 
      : toko_id === 1 
        ? "coklatTua" 
        : toko_id === 2 
          ? "primary" 
          : "hitam")
  : (isAdminGudang || isHeadGudang || isKaryawanProduksi) 
    ? 'coklatTua' 
    : (isManajer || isOwner || isFinance) 
      ? "biruTua" 
      : (isAdmin && userData?.userId !== 1 && userData?.userId !== 2)
        ? "hitam"
        : "primary";

console.log(themeColor)

const getIconWarna = (basePath) => {
  const lastDotIndex = basePath.lastIndexOf('.');
  const pathWithoutExt = basePath.substring(0, lastDotIndex);
  const extension = basePath.substring(lastDotIndex);

  if (themeColor === 'biruTua') {
    return `${pathWithoutExt}_non${extension}`;
  } else if (themeColor === 'coklatTua') {
    return `${pathWithoutExt}_gudang${extension}`;
  } else if (themeColor === 'hitam') {
    return `${pathWithoutExt}_toko2${extension}`;
  } else {
    return basePath;
  }
};

const applyThemeToMenuIcons = (menuItems) => {
  return menuItems.map(item => {
    const baseIconPath = '/Icon Warna/';
    const iconName = item.iconWarna.replace('/Icon Warna/', '');
    
    if (themeColor === 'biruTua') {
      const lastDotIndex = iconName.lastIndexOf('.');
      const nameWithoutExt = iconName.substring(0, lastDotIndex);
      const extension = iconName.substring(lastDotIndex);
      item.iconWarna = `${baseIconPath}${nameWithoutExt}_non${extension}`;
    } else if (themeColor === 'coklatTua') {
      const lastDotIndex = iconName.lastIndexOf('.');
      const nameWithoutExt = iconName.substring(0, lastDotIndex);
      const extension = iconName.substring(lastDotIndex);
      item.iconWarna = `${baseIconPath}${nameWithoutExt}_gudang${extension}`;
    } else if (themeColor === 'hitam') {
      const lastDotIndex = iconName.lastIndexOf('.');
      const nameWithoutExt = iconName.substring(0, lastDotIndex);
      const extension = iconName.substring(lastDotIndex);
      item.iconWarna = `${baseIconPath}${nameWithoutExt}_toko2${extension}`;
    } else {
      item.iconWarna = `${baseIconPath}${iconName}`;
    }
    
    return item;
  });
};

export const menuItems = [
  {
    label: "Dashboard",
    link: "/dashboard",
    icon: "/Menu/dashboard.svg",
    iconWarna: getIconWarna('/Icon Warna/dashboard.svg'),
    submenu: [
      { label: "Overview", link: "/dashboard" },
      { label: "Produk Terlaris", link: "/dashboard/produk-terlaris" },
      { label: "Cabang Terbaik", link: "/dashboard/cabang-terlaris" },
      { label: "Karyawan Terbaik", link: "/dashboard/karyawan-terbaik" },
      { label: "Hari Terlaris", link: "/dashboard/hari-terlaris" },
    ],
  },
  {
      label: "Persentase HPP Toko",
      link: "/persentase-hpp-toko",
      icon: "/Menu/biayaToko.svg",
      iconWarna: getIconWarna('/Icon Warna/biayaToko.svg'),
  },
  {
      label: "Data Barang",
      link: "/dataBarang",
      icon: "/Menu/dataBarang.svg",
      iconWarna: getIconWarna('/Icon Warna/dataBarang.svg'),
      submenu: [
          { label: "Barang Handmade", link: "/dataBarang/handmade" },
          { label: "Barang Non-Handmade", link: "/dataBarang/non-handmade" },
          { label: "Bahan Custom", link: "/dataBarang/custom" },
          { label: "Packaging", link: "/dataBarang/packaging" },
      ],
  },
  {
      label: "Stok Barang",
      link: "/stokBarang",
      icon: "/Menu/stokBarang.svg",
      iconWarna: getIconWarna('/Icon Warna/stokBarang.svg'),
  },
  {
      label: "Pembelian Stok",
      link: "/pembelianStok",
      icon: "/Menu/pembelianStok.svg",
      iconWarna: getIconWarna('/Icon Warna/pembelianStok.svg'),
  },
  {
      label: "Penjualan",
      link: "/penjualanToko",
      icon: "/Menu/penjualan.svg",
      iconWarna: getIconWarna('/Icon Warna/penjualan.svg'),
  },
  {
      label: "KPI",
      link: "/daftarPenilaianKPI",
      icon: "/Menu/kpi.svg",
      iconWarna: getIconWarna('/Icon Warna/kpi.svg'),
      submenu: [
          {label: "Daftar Penilaian KPI", link: '/daftarPenilaianKPI'},
          {label: "KPI Divisi", link: '/daftarPenilaianKPI/seluruh-divisi'}
        ],
  },
  {
      label: "Karyawan Absensi & Gaji",
      link: "/dataKaryawanAbsenGaji",
      icon: "/Menu/karyawanAbsensi.svg",
      iconWarna: getIconWarna('/Icon Warna/karyawanAbsensi.svg'),
  },
  {
      label: "Akun Karyawan",
      link: "/akunKaryawan",
      icon: "/Menu/akunKaryawan.svg",
      iconWarna: getIconWarna('/Icon Warna/akunKaryawan.svg'),
  },
  {
      label: "Izin/Cuti Karyawan",
      link: "/pengajuanCuti",
      icon: "/Menu/izinCuti.svg",
      iconWarna: getIconWarna('/Icon Warna/izinCuti.svg'),
  },
  {
      label: "Laporan Keuangan Toko",
      link: "/laporanKeuangan",
      icon: "/Menu/laporanKeuangan.svg",
      iconWarna: getIconWarna('/Icon Warna/laporanKeuangan.svg'),
  },
  {
      label: "Cabang",
      link: "/daftarCabang",
      icon: "/Menu/cabang.svg",
      iconWarna: getIconWarna('/Icon Warna/cabang.svg'),
  },
  {
      label: "Target Kasir",
      link: "/target-bulanan",
      icon: "/Menu/targetKasir.svg",
      iconWarna: getIconWarna('/Icon Warna/targetKasir.svg'),
  },
  {
      label: "Master Kategori",
      link: "/master-kategori",
      icon: "/Menu/masterKategori.svg",
      iconWarna: getIconWarna('/Icon Warna/masterKategori.svg'),
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
      label: "Target Kasir",
      link: "/target-bulanan",
      icon: "/Menu/targetKasir.svg",
      iconWarna: '/Icon Warna/targetKasir_gudang.svg',
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
      label: "Persentase HPP",
      link: "/persentase-hpp",
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
      label: "Target Kasir",
      link: "/target-bulanan",
      icon: "/Menu/targetKasir.svg",
      iconWarna: '/Icon Warna/targetKasir_gudang.svg',
    },
    {
      label: "Master Kategori",
      link: "/master-kategori",
      icon: "/Menu/masterKategori.svg",
      iconWarna: '/Icon Warna/masterKategori_gudang.svg',
  },
  ]

  const baseMenuKaryawan = [
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
  ];

  const baseMenuKaryawanTransport = [
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
  ];

  const baseMenuKaryawanProduksi = [
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
  ];

  // Apply theme to menu configurations
  export const menuKaryawan = applyThemeToMenuIcons(baseMenuKaryawan);
  export const menuKaryawanTransport = applyThemeToMenuIcons(baseMenuKaryawanTransport);
  export const menuKaryawanProduksi = applyThemeToMenuIcons(baseMenuKaryawanProduksi);
  
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
      label: "Izin/Cuti Karyawan",
      link: "/pengajuanCuti",
      icon: "/Menu/izinCuti.svg",
      iconWarna: getIconWarna('/Icon Warna/izinCuti_non.svg'),
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
      label: "Stok Barang",
      link: "/stokBarang",
      icon: "/Menu/stokBarang.svg",
      iconWarna: '/Icon Warna/stokBarang_non.svg',
    },
    {
      label: "Catatan",
      link: "/catatan",
      icon: "/Menu/catatan.svg",
      iconWarna: '/Icon Warna/catatan_non.svg',
    },
    {
      label: "Target Kasir",
      link: "/target-bulanan",
      icon: "/Menu/targetKasir.svg",
      iconWarna: '/Icon Warna/targetKasir_non.svg',
    },
    {
      label: "Akun Karyawan",
      link: "/akunKaryawan",
      icon: "/Menu/akunKaryawan.svg",
      iconWarna: '/Icon Warna/akunKaryawan_non.svg',
    },
    {
      label: "Kelola Akun kerja",
      link: "/kelola-akun-kerja",
      icon: "/Menu/akunKerja.svg",
      iconWarna: '/Icon Warna/akunKerja_non.svg',
    },
    {
      label: "Master Kategori",
      link: "/master-kategori",
      icon: "/Menu/masterKategori.svg",
      iconWarna: '/Icon Warna/masterKategori_non.svg',
    },
  ]
  