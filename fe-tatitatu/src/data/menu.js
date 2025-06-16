import { useState, useEffect } from 'react';

export const getUserData = () => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  return userData || {};
};
export const calculateThemeColor = () => {
  const userData = getUserData();
  const userId = userData?.userId ? Number(userData.userId) : null;
  const isManajer = userData?.role === 'manajer';
  const isKasirToko = userData?.role === 'kasirtoko';
  const isAdminGudang = userData?.role === 'admingudang';
  const isHeadGudang = userData?.role === 'headgudang';
  const isOwner = userData?.role === 'owner';
  const isAdmin = userData?.role === 'admin';
  const isFinance = userData?.role === 'finance';
  const isKaryawanProduksi = userData?.role === 'karyawanproduksi';
  const toko_id = userData?.tokoId;
  
  const currentPath = window.location.pathname;
  const isAbsensiRoute = 
    currentPath === '/absensi-karyawan' || 
    currentPath === '/absensi-karyawan-transport' || 
    currentPath === '/absensi-karyawan-produksi' ||
    currentPath === '/izin-cuti-karyawan' ||
    currentPath.startsWith('/absensi-karyawan-produksi/tambah');

  if (isAbsensiRoute) {
    if (!toko_id) return "biruTua";
    if (toko_id === 1) return "coklatTua";
    if (toko_id === 2) return "primary";
    return "hitam";
  } else {
    if (isAdminGudang || isHeadGudang || isKaryawanProduksi || toko_id === 1) {
      return 'coklatTua';
    } else if (isManajer || isOwner || isFinance) {
      return "biruTua";
    } else if ((isAdmin && userId !== 1 && userId !== 2) || 
               (isKasirToko && toko_id !== undefined && toko_id !== null && toko_id !== 1 && toko_id !== 2)) {
      return "hitam";
    } else {
      return "primary";
    }
  }
};

const getTimestamp = () => Date.now();

if (!localStorage.getItem('iconTimestamp')) {
  localStorage.setItem('iconTimestamp', getTimestamp());
}

export const getIconWarna = (basePath, currentTheme) => {
  const theme = currentTheme || calculateThemeColor();
  const baseIconPath = '/Icon Warna/';
  let iconName = basePath.replace('/Icon Warna/', '');
  iconName = iconName.replace(/_gudang|_non|_toko2/g, '');
  
  const lastDotIndex = iconName.lastIndexOf('.');
  const nameWithoutExt = iconName.substring(0, lastDotIndex);
  const extension = iconName.substring(lastDotIndex);
  
  let themedPath;
  console.log(theme)
  if (theme === 'biruTua') {
    themedPath = `${baseIconPath}${nameWithoutExt}_non${extension}`;
  } else if (theme === 'coklatTua') {
    themedPath = `${baseIconPath}${nameWithoutExt}_gudang${extension}`;
  } else if (theme === 'hitam') {
    themedPath = `${baseIconPath}${nameWithoutExt}_toko2${extension}`;
  } else {
    themedPath = `${baseIconPath}${iconName}`;
  }
  
  const timestamp = localStorage.getItem('iconTimestamp');
  return `${themedPath}?v=${timestamp}`;
};

export const applyThemeToMenuItems = (menuItems, currentTheme) => {
  return menuItems.map(item => {
    if (item.iconWarna) {
      if (item.iconWarna.includes('/Icon Warna/')) {
        item.iconWarna = getIconWarna(item.iconWarna, currentTheme);
      } else {
        item.iconWarna = getIconWarna(`/Icon Warna/${item.iconWarna}`, currentTheme);
      }
    }
    
    if (item.submenu && Array.isArray(item.submenu)) {
      item.submenu = item.submenu.map(subItem => {
        if (subItem.iconWarna) {
          subItem.iconWarna = getIconWarna(subItem.iconWarna, currentTheme);
        }
        return subItem;
      });
    }
    
    return item;
  });
};

const baseMenuItems = [
  {
    label: "Dashboard",
    link: "/dashboard",
    icon: "/Menu/dashboard.svg",
    iconWarna: "/Icon Warna/dashboard.svg",
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
    iconWarna: "/Icon Warna/biayaToko.svg",
  },
  {
    label: "Data Barang",
    link: "/dataBarang",
    icon: "/Menu/dataBarang.svg",
    iconWarna: "/Icon Warna/dataBarang.svg",
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
    iconWarna: "/Icon Warna/stokBarang.svg",
  },
  {
    label: "Pembelian Stok",
    link: "/pembelianStok",
    icon: "/Menu/pembelianStok.svg",
    iconWarna: "/Icon Warna/pembelianStok.svg",
  },
  {
    label: "Penjualan",
    link: "/penjualanToko",
    icon: "/Menu/penjualan.svg",
    iconWarna: "/Icon Warna/penjualan.svg",
  },
  {
    label: "KPI",
    link: "/daftarPenilaianKPI",
    icon: "/Menu/kpi.svg",
    iconWarna: "/Icon Warna/kpi.svg",
    submenu: [
      {label: "Daftar Penilaian KPI", link: '/daftarPenilaianKPI'},
      {label: "KPI Divisi", link: '/daftarPenilaianKPI/seluruh-divisi'}
    ],
  },
  {
    label: "Karyawan Absensi & Gaji",
    link: "/dataKaryawanAbsenGaji",
    icon: "/Menu/karyawanAbsensi.svg",
    iconWarna: "/Icon Warna/karyawanAbsensi.svg",
  },
  {
    label: "Akun Karyawan",
    link: "/akunKaryawan",
    icon: "/Menu/akunKaryawan.svg",
    iconWarna: "/Icon Warna/akunKaryawan.svg",
  },
  {
    label: "Izin/Cuti Karyawan",
    link: "/pengajuanCuti",
    icon: "/Menu/izinCuti.svg",
    iconWarna: "/Icon Warna/izinCuti.svg",
  },
  {
    label: "Laporan Keuangan Toko",
    link: "/laporanKeuangan",
    icon: "/Menu/laporanKeuangan.svg",
    iconWarna: "/Icon Warna/laporanKeuangan.svg",
  },
  {
    label: "Cabang",
    link: "/daftarCabang",
    icon: "/Menu/cabang.svg",
    iconWarna: "/Icon Warna/cabang.svg",
  },
  {
    label: "Target Kasir",
    link: "/target-bulanan",
    icon: "/Menu/targetKasir.svg",
    iconWarna: "/Icon Warna/targetKasir.svg",
  },
  {
    label: "Master Kategori",
    link: "/master-kategori",
    icon: "/Menu/masterKategori.svg",
    iconWarna: "/Icon Warna/masterKategori.svg",
  },
];

const baseMenuHeadGudang = [
  {
    label: "Dashboard",
    link: "/dashboard",
    icon: "/Menu/dashboard.svg",
    iconWarna: "/Icon Warna/dashboard.svg",
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
    iconWarna: "/Icon Warna/laporanKeuangan.svg",
  },
  {
    label: "KPI",
    link: "/daftarPenilaianKPI",
    icon: "/Menu/kpi.svg",
    iconWarna: "/Icon Warna/kpi.svg",
    submenu: [
      {label: "Daftar Penilaian KPI", link: '/daftarPenilaianKPI'},
      {label: "KPI Seluruh Divisi", link: '/daftarPenilaianKPI/seluruh-divisi'}
    ],
  },
  {
    label: "Karyawan Absensi & Gaji",
    link: "/dataKaryawanAbsenGaji",
    icon: "/Menu/karyawanAbsensi.svg",
    iconWarna: "/Icon Warna/karyawanAbsensi.svg",
  },
  {
    label: "Akun Karyawan",
    link: "/akunKaryawan",
    icon: "/Menu/akunKaryawan.svg",
    iconWarna: "/Icon Warna/akunKaryawan.svg",
  },
  {
    label: "Izin/Cuti Karyawan",
    link: "/pengajuanCuti",
    icon: "/Menu/izinCuti.svg",
    iconWarna: "/Icon Warna/izinCuti.svg",
  },
  {
    label: "Target Kasir",
    link: "/target-bulanan",
    icon: "/Menu/targetKasir.svg",
    iconWarna: "/Icon Warna/targetKasir.svg",
  },
  {
    label: "Master Kategori",
    link: "/master-kategori",
    icon: "/Menu/masterKategori.svg",
    iconWarna: "/Icon Warna/masterKategori.svg",
  },
];

// Kasir toko menu
const baseMenuKasirToko = [
  {
    label: "Dashboard",
    link: "/dashboard-kasir",
    icon: "/Menu/dashboard.svg",
    iconWarna: "/Icon Warna/dashboard.svg",
  },
  {
    label: "Stok Barang",
    link: "/stokBarang",
    icon: "/Menu/stokBarang.svg",
    iconWarna: "/Icon Warna/stokBarang.svg",
  },
  {
    label: "Penjualan",
    link: "/penjualan-kasir",
    icon: "/Menu/penjualan.svg",
    iconWarna: "/Icon Warna/penjualan.svg",
  },
  {
    label: "Master Kategori",
    link: "/master-kategori",
    icon: "/Menu/masterKategori.svg",
    iconWarna: "/Icon Warna/masterKategori.svg",
  },
];

// Admin gudang menu
const baseMenuAdminGudang = [
  {
    label: "Dashboard",
    link: "/dashboard-admin-gudang",
    icon: "/Menu/dashboard.svg",
    iconWarna: "/Icon Warna/dashboard.svg",
  },
  {
    label: "Persentase HPP",
    link: "/persentase-hpp",
    icon: "/Menu/biayaToko.svg",
    iconWarna: "/Icon Warna/biayaToko.svg",
  },
  {
    label: "Data Barang",
    link: "/dataBarang",
    icon: "/Menu/dataBarang.svg",
    iconWarna: "/Icon Warna/dataBarang.svg",
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
    iconWarna: "/Icon Warna/stokBarang.svg",
  },
  {
    label: "Penjualan",
    link: "/penjualan-admin-gudang",
    icon: "/Menu/penjualan.svg",
    iconWarna: "/Icon Warna/penjualan.svg",
  },
  {
    label: "Pembelian Stok",
    link: "/pembelianStok",
    icon: "/Menu/pembelianStok.svg",
    iconWarna: "/Icon Warna/pembelianStok.svg",
  },
  {
    label: "Pengajuan Absensi",
    link: "/pengajuanAbsensi",
    icon: "/Menu/absensi.svg",
    iconWarna: "/Icon Warna/absensi.svg",
  },
  {
    label: "Target Kasir",
    link: "/target-bulanan",
    icon: "/Menu/targetKasir.svg",
    iconWarna: "/Icon Warna/targetKasir.svg",
  },
  {
    label: "Master Kategori",
    link: "/master-kategori",
    icon: "/Menu/masterKategori.svg",
    iconWarna: "/Icon Warna/masterKategori.svg",
  },
];

// Karyawan menus
const baseMenuKaryawan = [
  {
    label: "Absensi",
    link: "/absensi-karyawan",
    icon: "/Menu/absensi.svg",
    iconWarna: "/Icon Warna/absensi.svg",
  },
  {
    label: "Izin/Cuti Karyawan",
    link: "/izin-cuti-karyawan",
    icon: "/Menu/izinCuti.svg",
    iconWarna: "/Icon Warna/izinCuti.svg",
  },
];

const baseMenuKaryawanTransport = [
  {
    label: "Absensi",
    link: "/absensi-karyawan-transport",
    icon: "/Menu/absensi.svg",
    iconWarna: "/Icon Warna/absensi.svg",
  },
  {
    label: "Izin/Cuti Karyawan",
    link: "/izin-cuti-karyawan",
    icon: "/Menu/izinCuti.svg",
    iconWarna: "/Icon Warna/izinCuti.svg",
  },
];

const baseMenuKaryawanProduksi = [
  {
    label: "Absensi",
    link: "/absensi-karyawan-produksi",
    icon: "/Menu/absensi.svg",
    iconWarna: "/Icon Warna/absensi.svg",
  },
  {
    label: "Izin/Cuti Karyawan",
    link: "/izin-cuti-karyawan",
    icon: "/Menu/izinCuti.svg",
    iconWarna: "/Icon Warna/izinCuti.svg",
  },
];

const baseMenurKaryawanHybrid = [
  {
    label: "Absensi",
    link: "/absensi-tim-hybrid",
    icon: "/Menu/absensi.svg",
    iconWarna: "/Icon Warna/absensi.svg",
  },
  {
    label: "Izin/Cuti Karyawan",
    link: "/izin-cuti-karyawan",
    icon: "/Menu/izinCuti.svg",
    iconWarna: "/Icon Warna/izinCuti.svg",
  },
];

// Owner menu
const baseMenuOwner = [
  {
    label: "Dashboard",
    link: "/dashboard",
    icon: "/Menu/dashboard.svg",
    iconWarna: "/Icon Warna/dashboard.svg",
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
    iconWarna: "/Icon Warna/laporanKeuangan.svg",
  },
  {
    label: "Catatan dari Manajer",
    link: "/catatan",
    icon: "/Menu/catatan.svg",
    iconWarna: "/Icon Warna/catatan.svg",
  },
];

// Finance menu
const baseMenuFinance = [
  {
    label: "Laporan Keuangan Perusahaan",
    link: "/laporanKeuangan",
    icon: "/Menu/laporanKeuangan.svg",
    iconWarna: "/Icon Warna/laporanKeuangan.svg",
  },
  {
    label: "Pemasukan",
    link: "/pemasukan",
    icon: "/Menu/pemasukan.svg",
    iconWarna: "/Icon Warna/pemasukan.svg",
  },
  {
    label: "Pengeluaran",
    link: "/pengeluaran",
    icon: "/Menu/pengeluaran.svg",
    iconWarna: "/Icon Warna/pengeluaran.svg",
  },
  {
    label: "Master Kategori",
    link: "/master-kategori",
    icon: "/Menu/masterKategori.svg",
    iconWarna: "/Icon Warna/masterKategori.svg",
  },
];

// Manajer menu
const baseMenuManajer = [
  {
    label: "Dashboard",
    link: "/dashboard",
    icon: "/Menu/dashboard.svg",
    iconWarna: "/Icon Warna/dashboard.svg",
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
    iconWarna: "/Icon Warna/kpi.svg",
    submenu: [
      {label: "Daftar Penilaian KPI", link: '/daftarPenilaianKPI'},
      {label: "KPI Seluruh Divisi", link: '/daftarPenilaianKPI/seluruh-divisi'}
    ],
  },
  {
    label: "Karyawan Absensi & Gaji",
    link: "/karyawan-absen-gaji",
    icon: "/Menu/karyawanAbsensi.svg",
    iconWarna: "/Icon Warna/karyawanAbsensi.svg",
  },
  {
    label: "Izin/Cuti Karyawan",
    link: "/pengajuanCuti",
    icon: "/Menu/izinCuti.svg",
    iconWarna: "/Icon Warna/izinCuti.svg",
  },
  {
    label: "Laporan Keuangan Perusahaan",
    link: "/laporanKeuangan",
    icon: "/Menu/laporanKeuangan.svg",
    iconWarna: "/Icon Warna/laporanKeuangan.svg",
  },
  {
    label: "Toko",
    link: "/toko",
    icon: "/Menu/toko.svg",
    iconWarna: "/Icon Warna/toko.svg",
  },
  {
    label: "Stok Barang",
    link: "/stokBarang",
    icon: "/Menu/stokBarang.svg",
    iconWarna: "/Icon Warna/stokBarang.svg",
  },
  {
    label: "Catatan",
    link: "/catatan",
    icon: "/Menu/catatan.svg",
    iconWarna: "/Icon Warna/catatan.svg",
  },
  {
    label: "Target Kasir",
    link: "/target-bulanan",
    icon: "/Menu/targetKasir.svg",
    iconWarna: "/Icon Warna/targetKasir.svg",
  },
  {
    label: "Akun Karyawan",
    link: "/akunKaryawan",
    icon: "/Menu/akunKaryawan.svg",
    iconWarna: "/Icon Warna/akunKaryawan.svg",
  },
  {
    label: "Kelola Akun kerja",
    link: "/kelola-akun-kerja",
    icon: "/Menu/akunKerja.svg",
    iconWarna: "/Icon Warna/akunKerja.svg",
  },
  {
    label: "Master Kategori",
    link: "/master-kategori",
    icon: "/Menu/masterKategori.svg",
    iconWarna: "/Icon Warna/masterKategori.svg",
  },
];

export const updateMenuIcons = () => {
  localStorage.setItem('iconTimestamp', getTimestamp());
  
  const event = new CustomEvent('menuThemeChanged', { detail: calculateThemeColor() });
  window.dispatchEvent(event);
};

export const useMenuTheme = () => {
  const [themeColor, setThemeColor] = useState(calculateThemeColor());
  
  useEffect(() => {
    const handleStorageChange = () => {
      setThemeColor(calculateThemeColor());
      updateMenuIcons();
    };
    
    const handlePathChange = () => {
      setThemeColor(calculateThemeColor());
    };
    
    const handleThemeChange = () => {
      setThemeColor(calculateThemeColor());
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('popstate', handlePathChange);
    window.addEventListener('menuThemeChanged', handleThemeChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('popstate', handlePathChange);
      window.removeEventListener('menuThemeChanged', handleThemeChange);
    };
  }, []);
  
  return {
    themeColor,
    updateMenuIcons,
  };
};

export const getMenuItems = () => applyThemeToMenuItems(baseMenuItems, calculateThemeColor());
export const getMenuHeadGudang = () => applyThemeToMenuItems(baseMenuHeadGudang, calculateThemeColor());
export const getMenuKasirToko = () => applyThemeToMenuItems(baseMenuKasirToko, calculateThemeColor());
export const getMenuAdminGudang = () => applyThemeToMenuItems(baseMenuAdminGudang, calculateThemeColor());
export const getMenuKaryawan = () => applyThemeToMenuItems(baseMenuKaryawan, calculateThemeColor());
export const getMenuKaryawanTransport = () => applyThemeToMenuItems(baseMenuKaryawanTransport, calculateThemeColor());
export const getMenuKaryawanProduksi = () => applyThemeToMenuItems(baseMenuKaryawanProduksi, calculateThemeColor());
export const getMenuOwner = () => applyThemeToMenuItems(baseMenuOwner, calculateThemeColor());
export const getMenuFinance = () => applyThemeToMenuItems(baseMenuFinance, calculateThemeColor());
export const getMenuManajer = () => applyThemeToMenuItems(baseMenuManajer, calculateThemeColor());
export const getMenuKaryawanHybrid = () => applyThemeToMenuItems(baseMenurKaryawanHybrid, calculateThemeColor());

export const menuItems = getMenuItems();
export const menuHeadGudang = getMenuHeadGudang();
export const menuKasirToko = getMenuKasirToko();
export const menuAdminGudang = getMenuAdminGudang();
export const menuKaryawan = getMenuKaryawan();
export const menuKaryawanTransport = getMenuKaryawanTransport();
export const menuKaryawanProduksi = getMenuKaryawanProduksi();
export const menuOwner = getMenuOwner();
export const menuFinance = getMenuFinance();
export const menuManajer = getMenuManajer();
export const menuKaryawanHybrid = getMenuKaryawanHybrid();

export const userOptions = [
  { label: "Profile", link: "/profile" },
  { label: "Logout", link: "/logout" },
];