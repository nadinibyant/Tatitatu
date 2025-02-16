import React, { useState } from 'react';
import { Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import InputDropdown from '../components/InputDropdown';
const AuthPages = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const roles = [
    { value: '1', label: 'Owner', storedRole: 'owner' },
    { value: '2', label: 'Finance', storedRole: 'finance' },
    { value: '3', label: 'Manager', storedRole: 'manajer' },
    { value: '4', label: 'Spv', storedRole: 'admin' },
    { value: '5', label: 'Head Gudang', storedRole: 'headgudang' },
    { value: '6', label: 'Admin Gudang', storedRole: 'admingudang' },
    { value: '7', label: 'Kasir', storedRole: 'kasirtoko' },
    { value: '8', label: 'Karyawan Umum', storedRole: 'karyawanumum' },
    { value: '10', label: 'Karyawan Produksi', storedRole: 'karyawanproduksi' },
    { value: '11', label: 'Karyawan Transportasi', storedRole: 'karyawantransportasi' }
  ];

  // Route mapping based on roles
  const routeMapping = {
    'admin': '/dashboard',
    'headgudang': '/dashboard',
    'kasirtoko': '/dashboard-kasir',
    'admingudang': '/dashboard-admin-gudang',
    'karyawanumum': '/izin-cuti-karyawan',
    'karyawanproduksi': '/izin-cuti-karyawan',
    'karyawanlogistik': '/izin-cuti-karyawan',
    'karyawantransportasi': '/izin-cuti-karyawan',
    'owner': '/dashboard',
    'finance': '/laporanKeuangan',
    'manajer': '/dashboard'
  };

  const handleRoleSelect = (selectedOption) => {
    setSelectedRole(selectedOption.value);
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const selectedRoleObj = roles.find(r => r.value === selectedRole);
    const storedRoleName = selectedRoleObj?.storedRole || '';

    try {
      const response = await api.post('/login', {
        email,
        password,
        role: selectedRole 
      });

      const { data } = response;
      
      const userData = {
        ...data.data, 
        role: storedRoleName 
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('token', data.data.token); 

      const targetRoute = routeMapping[storedRoleName];
      if (targetRoute) {
        navigate(targetRoute);
      } else {
        navigate('/dashboard');
      }
      
    } catch (err) {
      setError('Email atau kata sandi tidak valid');
    }
  };

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
              Selamat Datang Kembali!
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
              Masuk
            </h3>
            
            {error && (
              <div className="bg-red-50 text-red-500 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}
            
            <form className="space-y-4" onSubmit={handleLogin}>
              <InputDropdown
                label="Role"
                options={roles}
                value={selectedRole}
                onSelect={handleRoleSelect}
                required={true}
              />

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

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#7B0C42] hover:bg-[#C21747] text-white font-medium rounded-lg transition-colors duration-200"
              >
                Masuk
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPages;