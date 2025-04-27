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
    status: '',
    id_masuk: null,
    id_keluar: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeError, setTimeError] = useState('');
  
  useEffect(() => {
    if (isOpen && absensiData) {
      console.log("Received absensiData:", absensiData);
      
      if (divisi === 'Umum') {
        let jamMasuk = '';
        let jamKeluar = '';
        let idMasuk = null;
        let idKeluar = null;
        let totalMenitValue = 0;
        
        if (absensiData.raw) {
          const masuk = absensiData.raw.jam_masuk || {};
          const keluar = absensiData.raw.jam_keluar || {};
          
          jamMasuk = masuk.jam && masuk.jam !== '-' ? masuk.jam : '';
          jamKeluar = keluar.jam && keluar.jam !== '-' ? keluar.jam : '';
          idMasuk = masuk.absensi_karyawan_id || null;
          idKeluar = keluar.absensi_karyawan_id || null;
          
          totalMenitValue = parseInt(String(absensiData["Total Waktu"]).replace(' Menit', '')) || 0;
        } 
        else if (absensiData.jam_masuk) {
          const masuk = absensiData.jam_masuk || {};
          const keluar = absensiData.jam_keluar || {};
          
          jamMasuk = masuk.jam && masuk.jam !== '-' ? masuk.jam : '';
          jamKeluar = keluar?.jam && keluar.jam !== '-' ? keluar.jam : '';
          idMasuk = masuk.absensi_karyawan_id || null;
          idKeluar = keluar?.absensi_karyawan_id || null;
          
          totalMenitValue = absensiData.total_menit || 0;
        }
        else if (typeof absensiData["Jam Masuk"] === 'string') {
          jamMasuk = absensiData["Jam Masuk"] === '-' ? '' : absensiData["Jam Masuk"];
          jamKeluar = absensiData["Jam Keluar"] === '-' ? '' : absensiData["Jam Keluar"];
          idMasuk = absensiData.id || null;
          
          totalMenitValue = parseInt(String(absensiData["Total Waktu"]).replace(' Menit', '')) || 0;
        }
        
        setFormData({
          jamMasuk,
          jamKeluar,
          totalMenit: totalMenitValue.toLocaleString('id-ID'),
          totalMenitRaw: totalMenitValue,
          id_masuk: idMasuk,
          id_keluar: idKeluar
        });
        
        setTimeError('');
      } else if (divisi === 'Transportasi') {
        setFormData({
          lokasi: 'Lokasi',
          status: typeof absensiData.Status === 'string' 
            ? absensiData.Status 
            : (absensiData.Status && absensiData.Status.props ? absensiData.Status.props.children : ''),
          id_masuk: absensiData.id || null
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
        
        if (formData.id_masuk) {
          await api.put(`/absensi-karyawan/${formData.id_masuk}`, {
            jam_masuk: formData.jamMasuk
          });
          console.log(`Updated jam masuk with ID ${formData.id_masuk}`);
        }
        
        if (formData.id_keluar && formData.jamKeluar) {
          await api.put(`/absensi-karyawan/${formData.id_keluar}`, {
            jam_keluar: formData.jamKeluar
          });
          console.log(`Updated jam keluar with ID ${formData.id_keluar}`);
        }
      } else if (divisi === 'Transportasi') {
        if (!formData.status) {
          throw new Error('Status wajib diisi');
        }
        
        let requestData = {
          status: formData.status
        };
  
        await api.put(`/absensi-karyawan/${formData.id_masuk}`, requestData);
      } else if (divisi === 'Produksi') {
        // Handle Produksi API if needed
      }
      
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
              
              {timeError && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-lg text-sm">
                  {timeError}
                </div>
              )}
              
              <Input
                label="Total Menit"
                type1="text"
                value={formData.totalMenit}
                onChange={() => {}} 
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