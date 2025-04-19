import { useState, useEffect } from 'react';
import moment from 'moment';
import api from "../../../utils/api";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import InputDropdown from "../../../components/InputDropdown";

const ModalEditAbsensi = ({ isOpen, onClose, divisi, absensiData, onSuccess }) => {
  const [formData, setFormData] = useState({
    jamMasuk: '',
    jamKeluar: '',
    totalMenit: '',
    totalMenitRaw: 0, 
    lokasi: '',
    status: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeError, setTimeError] = useState('');
  
  useEffect(() => {
    if (isOpen && absensiData) {
      if (divisi === 'Umum') {
        const totalMenitValue = absensiData["Total Waktu"] 
          ? parseInt(String(absensiData["Total Waktu"]).replace(' Menit', ''))
          : 0;
        
        setFormData({
          jamMasuk: absensiData["Jam Masuk"] === '-' ? '' : absensiData["Jam Masuk"],
          jamKeluar: absensiData["Jam Keluar"] === '-' ? '' : absensiData["Jam Keluar"],
          totalMenit: totalMenitValue.toLocaleString('id-ID'),
          totalMenitRaw: totalMenitValue
        });
        setTimeError('');
      } else if (divisi === 'Transportasi') {
        setFormData({
          lokasi: 'Lokasi',
          status: absensiData.Status || ''
        });
      } else if (divisi === 'Produksi') {
        // Handle Produksi if needed in the future
      }
    }
  }, [isOpen, absensiData, divisi]);
  
  useEffect(() => {
    if (divisi === 'Umum' && formData.jamMasuk && formData.jamKeluar) {
      const masuk = moment(formData.jamMasuk, 'HH:mm');
      const keluar = moment(formData.jamKeluar, 'HH:mm');

      if (masuk.isValid() && keluar.isValid()) {
        if (keluar.isBefore(masuk)) {
          setTimeError('Jam keluar tidak boleh lebih awal dari jam masuk');
          setFormData(prev => ({
            ...prev,
            totalMenit: '',
            totalMenitRaw: 0
          }));
          return;
        } else {
          setTimeError('');
        }

        const diffMinutes = keluar.diff(masuk, 'minutes');
        
        setFormData(prev => ({
          ...prev,
          totalMenit: diffMinutes.toLocaleString('id-ID'),
          totalMenitRaw: diffMinutes
        }));
      }
    }
  }, [formData.jamMasuk, formData.jamKeluar, divisi]);
  
  const handleInputChange = (value, field) => {
    setFormData({
      ...formData,
      [field]: value
    });

    if (error) {
      setError('');
    }
    
    if (field === 'jamMasuk' || field === 'jamKeluar') {
      setTimeError('');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (timeError) {
      return; 
    }
    
    setLoading(true);
    setError('');
    
    try {

      if (divisi === 'Umum') {
        if (!formData.jamMasuk) {
          throw new Error('Jam masuk wajib diisi');
        }
        
        if (formData.jamKeluar) {

          const masuk = moment(formData.jamMasuk, 'HH:mm');
          const keluar = moment(formData.jamKeluar, 'HH:mm');
          
          if (masuk.isValid() && keluar.isValid() && keluar.isBefore(masuk)) {
            throw new Error('Jam keluar tidak boleh lebih awal dari jam masuk');
          }
        }
      } else if (divisi === 'Transportasi') {
        // if (!formData.lokasi) {
        //   throw new Error('Lokasi wajib diisi');
        // }
        if (!formData.status) {
          throw new Error('Status wajib diisi');
        }
      }
      
      let requestData = {};
      
  
      if (divisi === 'Umum') {
        requestData = {
          jam_masuk: formData.jamMasuk,
          jam_keluar: formData.jamKeluar || '',
          total_menit: formData.totalMenitRaw || 0
        };
        

        await api.put(`/absensi-karyawan/${absensiData.id}`, requestData);
      } else if (divisi === 'Transportasi') {
        requestData = {
          lokasi: formData.lokasi,
          status: formData.status
        };

        await api.put(`/absensi-karyawan/${absensiData.id}`, requestData);
      } else if (divisi === 'Produksi') {
        // Handle Produksi API call if needed
      }
      
      // When successful
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating absensi:', err);
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };
  
  const statusOptions = [
    { label: "Antar", value: "Antar" },
    { label: "Jemput", value: "Jemput" }
  ];
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Edit {divisi === 'Umum' ? 'Absensi Karyawan' : divisi === 'Transportasi' ? 'Transportasi' : 'Produksi'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          {/* Form Content Based on Division */}
          {divisi === 'Umum' && (
            <>
              {/* Jam Masuk */}
              <Input
                label="Jam Masuk"
                type1="time"
                value={formData.jamMasuk}
                onChange={(value) => handleInputChange(value, 'jamMasuk')}
                required={true}
              />
              
              {/* Jam Keluar */}
              <Input
                label="Jam Keluar"
                type1="time"
                value={formData.jamKeluar}
                onChange={(value) => handleInputChange(value, 'jamKeluar')}
                required={false}
              />
              
              {/* Time validation error */}
              {timeError && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-lg text-sm">
                  {timeError}
                </div>
              )}
              
              {/* Total Menit (Readonly, calculated automatically) */}
              <Input
                label="Total Menit"
                type1="text"
                value={formData.totalMenit}
                onChange={() => {}} // No manual changes allowed
                placeholder="Dihitung otomatis"
                required={false}
                disabled={true}
              />
            </>
          )}
          
          {divisi === 'Transportasi' && (
            <>
              {/* Lokasi */}
              <Input
                label="Lokasi"
                type1="text"
                value={formData.lokasi}
                onChange={(value) => handleInputChange(value, 'lokasi')}
                placeholder="Masukkan Lokasi"
                required={true}
                disabled={true}
              />
              
              {/* Status */}
              <InputDropdown
                label="Status"
                options={statusOptions}
                value={formData.status}
                onSelect={(option) => handleInputChange(option.value, 'status')}
                required={true}
              />
            </>
          )}
          
          {divisi === 'Produksi' && (
            <>
              {/* Add Produksi specific fields here if needed */}
            </>
          )}
          
          {/* General Error Message */}
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              label="Batal"
              onClick={onClose}
              bgColor="bg-white border border-gray-300"
              textColor="text-black"
              hoverColor="hover:bg-gray-50"
            />
            <Button
              type="submit"
              label={loading ? 'Menyimpan...' : 'Simpan'}
              bgColor="bg-biruTua"
              textColor="text-white"
              hoverColor="hover:bg-opacity-90"
              disabled={!!timeError || loading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditAbsensi;