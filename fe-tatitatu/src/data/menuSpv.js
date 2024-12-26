// src/data/menuData.js
export const menuItems = [
    {
      label: "Dashboard",
      link: "/dashboard",
      icon: "📂",
    //   submenu: [
    //     { label: "Submenu 1", link: "/submenu1" },
    //     { label: "Submenu 2", link: "/submenu2" },
    //   ],
    },
    {
        label: "Pembelian Stok",
        link: "/pembelianStok",
        icon: "📂",
    },
    {
        label: "Laporan Keuangan Toko",
        link: "/laporanKeuangan",
        icon: "📂",
        submenu: [
            { label: "Daftar Pemasukan", link: "/laporanKeuangan/daftarPemasukan" },
            { label: "Daftar Pengeluaran", link: "/laporanKeuangan/daftarPengeluaran" },
        ],
    },
    {
        label: "Daftar Penjualan Toko",
        link: "/penjualanToko",
        icon: "📂",
    },
    {
        label: "Produk Terlaris",
        link: "/produkTerlaris",
        icon: "📂",
    },
    {
        label: "Cabang Terlaris",
        link: "/cabangTerlaris",
        icon: "📂",
    },
    {
        label: "Karyawan Terbaik",
        link: "/karyawanTerbaik",
        icon: "📂",
    },
    {
        label: "Daftar Penilaian KPI",
        link: "/daftarPenilaianKPI",
        icon: "📂",
    },
    {
        label: "KPI Seluruh Divisi",
        link: "/kpiSeluruhDivisi",
        icon: "📂",
    },
    {
        label: "Karyawan, Absensi, dan Gaji",
        link: "/dataKaryawanAbsenGaji",
        icon: "📂",
    },
    {
        label: "Daftar Cabang",
        link: "/daftarCabang",
        icon: "📂",
    },
    {
        label: "Daftar Toko",
        link: "/DaftarToko",
        icon: "📂",
    },
    {
        label: "Biaya Gudang",
        link: "/biayaGudang",
        icon: "📂",
    },
    {
        label: "Data Barang",
        link: "/dataBarang",
        icon: "📂",
        submenu: [
            { label: "Barang Handmade", link: "/dataBarang/handmande" },
            { label: "Barang Non-Handmade", link: "/dataBarang/non-handmade" },
            { label: "Barang Mentah", link: "/dataBarang/mentah" },
            { label: "Packaging", link: "/dataBarang/packaging" },
        ],
    },
    {
        label: "Akun Karyawan",
        link: "/akunKaryawan",
        icon: "📂",
    },
    {
        label: "Stok Barang",
        link: "/stokBarang",
        icon: "📂",
    },
    {
        label: "Pengajuan Cuti",
        link: "/pengajuanCuti",
        icon: "📂",
    },
    {
        label: "Target Bulanan Kasir",
        link: "/target-bulanan-kasir",
        icon: "📂",
    },
  ];
  
  export const userOptions = [
    { label: "Profile", link: "/profile" },
    { label: "Logout", link: "/logout" },
  ];
  