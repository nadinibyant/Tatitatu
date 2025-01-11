import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthPages = ({ defaultTab = 'login' }) => {
  const [isLogin, setIsLogin] = useState(defaultTab === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Daftar role berdasarkan email
  const roleMapping = {
    'admin@gmail.com': { role: 'admin', route: '/dashboard' },
    'headgudang@gmail.com': { role: 'headgudang', route: '/dashboard' },
    'kasirtoko@gmail.com': { role: 'kasirtoko', route: '/dashboard-kasir' },
    'admingudang@gmail.com': { role: 'admingudang', route: '/dashboard-admin-gudang' },
    'karyawanumum@gmail.com': { role: 'karyawanumum', route: '/izin-cuti-karyawan' },
    'karyawanproduksi@gmail.com': { role: 'karyawanproduksi', route: '/izin-cuti-karyawan' },
    'karyawanlogistik@gmail.com': { role: 'karyawanlogistik', route: '/izin-cuti-karyawan' },
    'karyawantransportasi@gmail.com': { role: 'karyawantransportasi', route: '/izin-cuti-karyawan' },
    'owner@gmail.com': { role: 'owner', route: '/dashboard' },
    'finance@gmail.com': { role: 'finance', route: '/laporanKeuangan' },
  };


  const handleTabChange = (isLoginTab) => {
    setIsLogin(isLoginTab);
    setError(''); 
    navigate(isLoginTab ? '/login' : '/register', { replace: true });
  };

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    
    setError('');

    // More secure role check
    const userConfig = roleMapping[email];
    
    if (userConfig && password === 'password123') { 
      const userData = {
        email,
        role: userConfig.role,
        token: `token-${userConfig.role}-${Date.now()}`, 
      };
      
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Redirect to role-specific route
      navigate(userConfig.route);
    } else {
      setError('Email atau kata sandi tidak valid');
    }
  };

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full bg-[#FFE0ED] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl min-h-[600px] bg-white rounded-2xl shadow-2xl flex overflow-hidden">
        {/* Left Side - Image/Brand Section */}
        <div className="hidden md:flex md:w-1/2 bg-[#7B0C42] flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-10 h-10 text-white" />
            <span className="text-2xl font-bold text-white">Tatitatu</span>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white">
              {isLogin ? "Selamat Datang Kembali!" : "Bergabung Dengan Kami"}
            </h2>
            <p className="text-[#FFE0ED]">
              Temukan koleksi aksesoris eksklusif kami yang mendefinisikan keanggunan dan gaya.
            </p>
          </div>

          <div className="text-sm text-[#FFE0ED]">
            © 2025 Tatitatu. Hak Cipta Dilindungi.
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="md:hidden flex items-center gap-3 mb-8">
            <ShoppingBag className="w-8 h-8 text-[#7B0C42]" />
            <span className="text-xl font-bold text-[#7B0C42]">Tatitatu</span>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-[#7B0C42]">
              {isLogin ? "Masuk" : "Daftar Akun"}
            </h3>
            
            {error && (
              <div className="bg-red-50 text-red-500 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}
            
            <form className="space-y-4" onSubmit={handleLogin}>
              {!isLogin && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#7B0C42] focus:border-transparent transition"
                    placeholder="Masukkan nama lengkap Anda"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#7B0C42] focus:border-transparent transition"
                  placeholder="Masukkan email Anda"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Kata Sandi</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#7B0C42] focus:border-transparent transition"
                    placeholder="Masukkan kata sandi"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#7B0C42] focus:ring-[#7B0C42]" />
                    <span className="text-sm text-gray-600">Ingat Saya</span>
                  </label>
                  <button type="button" className="text-sm text-[#7B0C42] hover:text-[#C21747] font-medium">
                    Lupa Kata Sandi?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#7B0C42] hover:bg-[#C21747] text-white font-medium rounded-lg transition-colors duration-200"
              >
                {isLogin ? "Masuk" : "Daftar"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
              <button
                type="button"
                onClick={() => handleTabChange(!isLogin)}
                className="font-medium text-[#7B0C42] hover:text-[#C21747]"
              >
                {isLogin ? "Daftar Sekarang" : "Masuk"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPages;