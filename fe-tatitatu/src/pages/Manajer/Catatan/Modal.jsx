import React, { useState } from 'react';
import Input from '../../../components/Input';
import TextArea from '../../../components/Textarea';
import api from '../../../utils/api';
import Spinner from '../../../components/Spinner';
import AlertSuccess from '../../../components/AlertSuccess';
import AlertError from '../../../components/AlertError';
import { useNavigate } from 'react-router-dom';
import { useRefresh } from '../../../context/RefreshContext';

const Modal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [isAlertSuccess, setAlertSucc] = useState(false);
  const [isErrorAlert, setErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate()
  const userData = JSON.parse(localStorage.getItem('userData'));
  const isManajer = userData?.role === 'manajer';
   const refresh = isManajer ? useRefresh() : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const data = {
        nama: name,
        tanggal: date,
        judul: judul,
        isi: isi
      };
      const response = await api.post('/catatan', data);

      if (response.data.success) {
        setAlertSucc(true);
        if (isManajer && refresh) {
          refresh.triggerRefresh();
        }
      } else {
        setErrorMessage(response.data.message);
        setErrorAlert(true);
      }
    } catch (error) {
      console.error('Error submitting note:', error);
      setErrorMessage('Terjadi kesalahan saat mengirim catatan');
      setErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleConfirm = () => {
    setAlertSucc(false); 
    setName('');        
    setDate('');
    setIsi('');
    setJudul('');
    onClose();          
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Kirim Catatan</h2>
            <button
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={onClose}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex gap-4">
              <Input
                label="Nama"
                value={name}
                onChange={(value) => setName(value)}
                width="w-1/2"
                required
              />
              <Input
                label="Tanggal dan Waktu"
                type1={'datetime-local'}
                value={date}
                onChange={(value) => setDate(value)}
                width="w-1/2"
                required
              />
            </div>
            <Input
              label="Judul"
              value={judul}
              onChange={(value) => setJudul(value)}
              required
            />
            <TextArea
              label="Isi"
              value={isi}
              onChange={(e) => setIsi(e.target.value)} 
              required
            />
            <div className="flex justify-end mt-4">
              <button
                type="button"
                className="border border-secondary text-black hover:bg-[#990D51] hover:text-white px-10 py-2 rounded-lg"
                onClick={onClose}
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-[#7B0C42] hover:bg-[#990D51] text-white px-10 py-2 rounded-lg ml-2"
              >
                Kirim
              </button>
            </div>
          </form>
        </div>
      </div>


      {isAlertSuccess && (
        <AlertSuccess
          title="Berhasil!!"
          description="Catatan berhasil ditambahkan"
          confirmLabel="Ok"
          onConfirm={handleConfirm}
        />
      )}

      {isErrorAlert && (
        <AlertError
          title="Gagal!!"
          description={errorMessage}
          confirmLabel="Ok"
          onConfirm={() => setErrorAlert(false)}
        />
      )}

{isLoading && <Spinner />}

    </>
  );
};

export default Modal;