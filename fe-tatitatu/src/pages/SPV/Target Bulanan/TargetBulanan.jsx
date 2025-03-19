import { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import { menuItems, userOptions } from "../../../data/menu";
import ButtonDropdown from "../../../components/ButtonDropdown";
import Input from "../../../components/Input";
import InputDropdown from "../../../components/InputDropdown";
import LayoutWithNav from "../../../components/LayoutWithNav";
import api from "../../../utils/api";
import AlertSuccess from "../../../components/AlertSuccess";
import Spinner from "../../../components/Spinner";
import AlertError from "../../../components/AlertError";

export default function TargetBulanan() {
  const [isLoading, setLoading] = useState(false)
  const [branchList, setBranchList] = useState([]);
  const [storeList, setStoreList] = useState([]);
  const [isAlertSuccess, setAlertSucc] = useState(false)
  const [isErrorAlert, setErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [data, setData] = useState({
    branches: [] 
  });
  const userDataLogin = JSON.parse(localStorage.getItem('userData'));
  const isAdminGudang = userDataLogin?.role === 'admingudang'
  const isHeadGudang = userDataLogin?.role === 'headgudang';
  const isOwner = userDataLogin?.role === 'owner';
  const isManajer = userDataLogin?.role === 'manajer';
  const isAdmin = userDataLogin?.role === 'admin';
  const isFinance = userDataLogin?.role === 'finance'
  const toko_id = userDataLogin.userId
  
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null); 
  const [showModal, setShowModal] = useState(false);
  const [editingMonth, setEditingMonth] = useState(null);
  const [newTarget, setNewTarget] = useState('');
  const [id, setId] = useState('')
  const [month, setMonth] = useState('')
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const themeColor = (isAdminGudang || isHeadGudang) 
  ? 'coklatTua' 
  : (isManajer || isOwner || isFinance) 
    ? "biruTua" 
    : (isAdmin && userDataLogin?.userId !== 1 && userDataLogin?.userId !== 2)
      ? "hitam"
      : "primary";

    const themeColor2 = (isAdminGudang || isHeadGudang) 
  ? 'coklatMuda' 
  : (isManajer || isOwner || isFinance) 
    ? "biruMuda" 
    : (isAdmin && userDataLogin?.userId !== 1 && userDataLogin?.userId !== 2)
      ? "secondary"
      : "pink";

  // const themeColor2 = (isAdminGudang || isHeadGudang) 
  // ? "coklatMuda" 
  // : (isManajer || isOwner || isFinance) 
  //   ? "biruMuda" 
  //   : "pink";

  const formatCurrency = (amount) => {
    return `Rp${amount.toLocaleString('id-ID')}`;
  };

  const calculateProgressWidth = (achieved, target) => {
    if (!target) return '0%';
    return `${Math.min((achieved / target) * 100, 100)}%`;
  };

  const handleEdit = (month) => {
    setId(month.id)
    setMonth(month.name)
    setEditingMonth(month);
    setNewTarget(month.target);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await api.put(`/target-bulanan-kasir/${id}`, {
        cabang_id: selectedBranch,
        bulan: month,
        jumlah_target: newTarget
      })
      if (response.data.success) {
        setAlertSucc(true);
        fetchTargetBulanan()
        setShowModal(false);
      } else {
        setErrorMessage(response.data.message);
        setErrorAlert(true);
      }
    } catch (error) {
      console.error('Kesalahan Server', error);
      setErrorMessage('Terjadi kesalahan saat menyimpan data');
      setErrorAlert(true);
    } finally {
      setLoading(false)
    }
  };

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await api.get('/toko');
      
      if (response.data.success) {
        const options = response.data.data.map(store => ({
          value: store.toko_id,
          label: store.nama_toko
        }));

        setStoreList(options);
        
        if (options.length > 0 && isManajer) {
          setSelectedStore(options[0].value);
        }
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      setErrorMessage('Gagal mengambil data toko');
      setErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      setLoading(true);
      // If manager and "All" is selected, don't fetch branches
      if (isManajer && selectedStore === 'Semua') {
        setBranchList([]);
        setSelectedBranch(null);
        return;
      }
      
      // If manager, use selected store ID, otherwise use logged in user's store ID
      const storeIdToUse = isManajer ? selectedStore : toko_id;
      
      if (!storeIdToUse) {
        setBranchList([]);
        setSelectedBranch(null);
        return;
      }
      
      const response = await api.get(`/cabang?toko_id=${storeIdToUse}`);
      
      if (response.data.success) {
        const options = response.data.data.map(branch => ({
          value: branch.cabang_id,
          label: branch.nama_cabang
        }));

        setBranchList(options);
        
        if (options.length > 0) {
          setSelectedBranch(options[0].value);
        } else {
          setSelectedBranch(null);
        }
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      setErrorMessage('Gagal mengambil data cabang');
      setErrorAlert(true);
      setBranchList([]);
      setSelectedBranch(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTargetBulanan = async () => {
    if (!selectedBranch) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/target-bulanan-kasir?cabang=${selectedBranch}&tahun=${currentYear}`);
      
      if (response.data.success) {
        // Process data with the new API response structure
        const transformedBranches = [];
        
        // Group by branch
        const branchData = {
          id: response.data.data[0]?.cabang_id,
          name: response.data.data[0]?.cabang?.nama_cabang,
          months: response.data.data.map(item => ({
            id: item.target_bulanan_kasir_id,
            name: item.bulan,
            target: item.jumlah_target,
            achieved: item.tercapai || 0,
            remaining: item.jumlah_target - (item.tercapai || 0)
          }))
        };
        
        transformedBranches.push(branchData);
        setData({ branches: transformedBranches });
      } else {
        setData({ branches: [] });
      }
    } catch (error) {
      console.error('Error fetching target bulanan:', error);
      setData({ branches: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isManajer) {
      fetchStores();
    } else {
      fetchBranches();
    }
  }, []);

  useEffect(() => {
    if (isManajer && selectedStore) {
      fetchBranches();
    }
  }, [selectedStore]);

  useEffect(() => {
    if (selectedBranch) {
      fetchTargetBulanan();
    }
  }, [selectedBranch]);

  const handleStoreSelect = (storeName) => {
    if (storeName === 'Semua') {
      setSelectedStore('Semua');
      setSelectedBranch(null);
      setData({ branches: [] });
      setBranchList([]);
    } else {
      const store = storeList.find(s => s.label === storeName);
      if (store) {
        setSelectedStore(store.value);
        setSelectedBranch(null);
        setData({ branches: [] });
      }
    }
  };

  const handleBranchSelect = (branchName) => {
    if (branchName === 'Semua') {
      setSelectedBranch('Semua');
      setData({ branches: [] });
    } else {
      const branch = branchList.find(b => b.label === branchName);
      if (branch) {
        setSelectedBranch(branch.value);
      }
    }
  };

  const renderEmptyState = () => (
    <div className="bg-white rounded-lg p-8 text-center">
      <svg 
        className="mx-auto h-12 w-12 text-gray-400 mb-4" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
        />
      </svg>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data target bulanan</h3>
      <p className="text-gray-500">
        Belum ada target bulanan yang ditambahkan untuk cabang ini
      </p>
    </div>
  );

  return (
    <LayoutWithNav menuItems={menuItems} userOptions={userOptions}>
      <div className="p-5">
        <div className="">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-base font-bold text-${themeColor}`}>Target Bulanan Kasir</h2>
            <div className="flex space-x-4">
              {isManajer && (
                <div className="w-48">
                  <ButtonDropdown
                    options={storeList}
                    selectedStore={
                      selectedStore === 'Semua' 
                        ? 'Semua' 
                        : storeList.find(s => s.value === selectedStore)?.label || 'Pilih Toko'
                    }
                    label="Toko"
                    onSelect={handleStoreSelect}
                    selectedIcon="/icon/toko.svg"
                    showAllOption={true}
                    allOptionLabel="Semua"
                  />
                </div>
              )}
              <div className="w-48">
                <ButtonDropdown
                  options={branchList}
                  selectedStore={
                    selectedBranch === 'Semua'
                      ? 'Semua'
                      : branchList.find(b => b.value === selectedBranch)?.label || 
                        (branchList.length > 0 ? branchList[0].label : 'Cabang')
                  }
                  label="Cabang"
                  onSelect={handleBranchSelect}
                  selectedIcon="/icon/toko.svg"
                  showAllOption={true}
                  allOptionLabel="Semua"
                  disabled={isManajer && !selectedStore}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {selectedBranch ? (
              data.branches.length > 0 ? (
                data.branches
                  .find(branch => branch.id === selectedBranch)
                  ?.months.map((month, index) => (
                    <div key={index} className="bg-white rounded-lg py-4">
                      <div className="flex items-start px-4">
                        <div className="w-1/4">
                          <div className="text-gray-500 text-sm">Bulan</div>
                          <div className="font-bold text-black">{month.name}</div>
                        </div>
                        <div className="w-1/3 text-left">
                          <div className="text-gray-500 text-sm">Jumlah Target</div>
                          <div className="font-bold text-black">{formatCurrency(month.target)}</div>
                        </div>
                        <div className="flex-grow"></div>
                        {!isAdminGudang && (
                          <button 
                            onClick={() => handleEdit(month)}
                            className="text-orange-500 border border-orange-500 rounded-md px-4 py-1.5 hover:bg-orange-50 flex items-center gap-2"
                          >
                            <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" clipRule="evenodd" d="M8.32 3.17554H2C0.895 3.17554 0 4.12454 0 5.29354V15.8815C0 17.0515 0.895 17.9995 2 17.9995H13C14.105 17.9995 15 17.0515 15 15.8815V8.13154L11.086 12.2755C10.7442 12.641 10.2991 12.8936 9.81 12.9995L7.129 13.5675C5.379 13.9375 3.837 12.3045 4.187 10.4525L4.723 7.61354C4.82 7.10154 5.058 6.63054 5.407 6.26154L8.32 3.17554Z" fill="#DA5903"/>
                              <path fillRule="evenodd" clipRule="evenodd" d="M16.8457 1.31753C16.7446 1.06156 16.5964 0.826833 16.4087 0.62553C16.2242 0.428659 16.0017 0.271165 15.7547 0.16253C15.5114 0.0556667 15.2485 0.000488281 14.9827 0.000488281C14.7169 0.000488281 14.454 0.0556667 14.2107 0.16253C13.9637 0.271165 13.7412 0.428659 13.5567 0.62553L13.0107 1.20353L15.8627 4.22353L16.4087 3.64453C16.5983 3.44476 16.7468 3.20962 16.8457 2.95253C17.0517 2.427 17.0517 1.84306 16.8457 1.31753ZM14.4497 5.72053L11.5967 2.69953L6.8197 7.75953C6.74922 7.83462 6.70169 7.92831 6.6827 8.02953L6.1467 10.8695C6.0767 11.2395 6.3857 11.5655 6.7347 11.4915L9.4167 10.9245C9.51429 10.9028 9.60311 10.8523 9.6717 10.7795L14.4497 5.72053Z" fill="#DA5903"/>
                            </svg>
                            Edit
                          </button>
                        )}
                      </div>

                      <div className="mt-4 px-4">
                        <div className="flex justify-between text-sm mb-2">
                          <div className={`text-${themeColor} font-medium`}>
                            {formatCurrency(month.achieved)} Tercapai
                          </div>
                          <div className={`text-${themeColor} font-bold`}>
                            {formatCurrency(month.remaining)} Tersisa
                          </div>
                        </div>

                        <div className={`h-3 w-full bg-${themeColor2} rounded-full overflow-hidden`}>
                          <div
                            className={`h-full bg-${themeColor} rounded-full transition-all duration-300`}
                            style={{ width: calculateProgressWidth(month.achieved, month.target) }}
                          />
                        </div>
                      </div>
                    </div>
                  )) || renderEmptyState()
              ) : renderEmptyState()
            ) : (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-500">
                  {isManajer && !selectedStore 
                    ? "Silakan pilih toko terlebih dahulu" 
                    : "Silakan pilih cabang terlebih dahulu"}
                </p>
              </div>
            )}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Edit Target Bulanan</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <Input
                label="Jumlah Target"
                type="number"
                value={newTarget}
                onChange={setNewTarget}
                required={true}
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className={`px-4 py-2 bg-${themeColor} text-white rounded-md hover:bg-${themeColor}/90`}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}

        {isAlertSuccess && (
          <AlertSuccess
            title="Berhasil!!"
            description="Data Berhasil Diperbaharui"
            confirmLabel="Ok"
            onConfirm={() => setAlertSucc(false)}
          />
        )}

        {isLoading && <Spinner />}

        {isErrorAlert && (
          <AlertError
            title="Gagal!!"
            description={errorMessage}
            confirmLabel="Ok"
            onConfirm={() => setErrorAlert(false)}
          />
        )}
      </div>
    </LayoutWithNav>
  );
}