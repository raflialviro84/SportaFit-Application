import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils';
import AdminLayout from '../../components/AdminLayout';
import { IoTrashOutline, IoPencilSharp } from 'react-icons/io5';

const VoucherDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usersWithVoucher, setUsersWithVoucher] = useState([]);

  // Cek apakah kita berada di halaman users
  const isUsersPage = location.pathname.includes('/users');

  useEffect(() => {
    const fetchVoucherDetails = async () => {
      try {
        setLoading(true);
        console.log('Fetching voucher with ID:', id);
        
        // Fetch voucher details - endpoint admin
        const voucherResponse = await fetch(`/api/vouchers/admin/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!voucherResponse.ok) {
          throw new Error(`HTTP error! status: ${voucherResponse.status}`);
        }
        
        const voucherResult = await voucherResponse.json();
        console.log('Voucher API response:', voucherResult);
        
        // Periksa format respons, bisa data atau langsung objek voucher
        const voucherData = voucherResult.data || voucherResult;
        console.log('Voucher data extracted:', voucherData);
        
        setVoucher(voucherData);
        
        // Fetch users who have this voucher - endpoint admin
        try {
          const usersResponse = await fetch(`/api/vouchers/admin/${id}/users`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('adminToken')}`
            }
          });
          
          if (usersResponse.ok) {
            const usersResult = await usersResponse.json();
            console.log('Users API response:', usersResult);
            
            // Periksa format respons, data.users atau langsung array users
            const usersData = usersResult.data?.users || usersResult.users || usersResult.data || [];
            console.log('Users data extracted:', usersData);
            
            setUsersWithVoucher(usersData);
          } else {
            console.warn(`Could not fetch users with voucher. Status: ${usersResponse.status}`);
            setUsersWithVoucher([]);
          }
        } catch (userError) {
          console.warn('Error fetching users with voucher:', userError);
          setUsersWithVoucher([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching voucher details:", err);
        setError("Failed to load voucher details. Please try again.");
        setLoading(false);
      }
    };

    fetchVoucherDetails();
  }, [id]);

  // Debugging - tambahkan output ke console untuk membantu diagnosa
  useEffect(() => {
    if (voucher) {
      console.log('Voucher state updated:', voucher);
    }
  }, [voucher]);

  if (loading) return (
    <AdminLayout>
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Memuat detail voucher...</span>
      </div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout>
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>{error}</p>
        <Link to="/admin/vouchers" className="text-blue-500 hover:underline">Kembali ke Daftar Voucher</Link>
      </div>
    </AdminLayout>
  );

  if (!voucher) return (
    <AdminLayout>
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <p>Voucher tidak ditemukan.</p>
        <Link to="/admin/vouchers" className="text-blue-500 hover:underline">Kembali ke Daftar Voucher</Link>
      </div>
    </AdminLayout>
  );

  // Ekstrak data voucher dengan mempertimbangkan struktur data yang berbeda
  const getVoucherProperty = (propName, defaultValue = '-') => {
    // Coba akses di level atas dan juga level "data" jika ada
    return voucher[propName] !== undefined 
      ? voucher[propName] 
      : (voucher.data && voucher.data[propName] !== undefined 
        ? voucher.data[propName] 
        : defaultValue);
  };

  // Data voucher yang kita perlukan dengan transformasi nama properti
  const voucherCode = getVoucherProperty('code') || getVoucherProperty('voucherCode');
  const voucherName = getVoucherProperty('title') || getVoucherProperty('name');
  const voucherDesc = getVoucherProperty('description');
  const discountType = getVoucherProperty('discountType') || getVoucherProperty('discount_type');
  const discountValue = getVoucherProperty('discountValue') || getVoucherProperty('discount_value') || 0;
  const validFrom = getVoucherProperty('startDate') || getVoucherProperty('start_date') || getVoucherProperty('validFrom');
  const validUntil = getVoucherProperty('endDate') || getVoucherProperty('end_date') || getVoucherProperty('validUntil');
  const maxUsage = getVoucherProperty('usageLimit') || getVoucherProperty('usage_limit') || getVoucherProperty('maxUsage');
  const currentUsage = getVoucherProperty('usageCount') || getVoucherProperty('usage_count') || getVoucherProperty('currentUsage') || 0;
  const isActive = getVoucherProperty('isActive') || getVoucherProperty('is_active');
  const imageUrl = getVoucherProperty('imageUrl') || getVoucherProperty('image_url');
  const minPurchase = getVoucherProperty('minPurchase') || getVoucherProperty('min_purchase') || 0;

  return (
    <AdminLayout>
      {/* Page Title */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Detail Voucher</h1>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-6">
        <Link 
          to={`/admin/vouchers/edit/${id}`} 
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center"
        >
          <IoPencilSharp className="mr-2" size={16} />
          Edit Voucher
        </Link>
        <Link 
          to="/admin/vouchers" 
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
        >
          Kembali
        </Link>
        <button 
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center justify-center"
          onClick={() => window.confirm('Apakah Anda yakin ingin menghapus voucher ini?')}
        >
          <IoTrashOutline className="mr-2" size={16} />
          Hapus Voucher
        </button>
      </div>

      {/* Informasi Voucher */}
      <div className="bg-white rounded-lg p-5 mb-6">
        <h2 className="text-lg font-medium mb-4">Informasi Voucher</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Kode Voucher
            </h3>
            <p className="font-medium">{voucherCode}</p>
            <p className="text-xs text-gray-500">Kode unik untuk voucher (huruf besar & angka)</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Judul Voucher
            </h3>
            <p className="font-medium">{voucherName}</p>
            <p className="text-xs text-gray-500">Nama yang ditampilkan kepada pengguna</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Deskripsi
            </h3>
            <p>{voucherDesc || '-'}</p>
            <p className="text-xs text-gray-500">Penjelasan detail tentang voucher dan ketentuan penggunaan</p>
          </div>

          {imageUrl && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Gambar Voucher
              </h3>
              <div className="mt-1 mb-2 border rounded overflow-hidden max-w-md">
                <img 
                  src={imageUrl} 
                  alt={voucherName}
                  className="w-full h-auto" 
                  onError={(e) => {
                    e.target.src = '/Voucher1.png'; // Fallback to default image
                  }}
                />
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Status
            </h3>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isActive ? 'Aktif' : 'Tidak Aktif'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pengaturan Diskon */}
      <div className="bg-white rounded-lg p-5 mb-6">
        <h2 className="text-lg font-medium mb-4">Pengaturan Diskon</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Tipe Diskon
            </h3>
            <p>
              {discountType === 'percentage' ? 'Persentase (%)' : 'Nominal (Rp)'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Nilai Diskon
            </h3>
            <p className="font-medium">
              {discountType === 'percentage' 
                ? `${discountValue}%` 
                : `Rp ${parseInt(discountValue).toLocaleString('id-ID')}`}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Minimal Pembelian
            </h3>
            <p>
              {minPurchase > 0 
                ? `Rp ${parseInt(minPurchase).toLocaleString('id-ID')}` 
                : 'Tidak ada minimum'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Batas Penggunaan
            </h3>
            <p>
              {maxUsage ? maxUsage : 'Tidak terbatas'}
            </p>
            <p className="text-sm text-gray-500">
              Digunakan {currentUsage} kali
            </p>
          </div>
        </div>
      </div>

      {/* Periode Berlaku */}
      <div className="bg-white rounded-lg p-5 mb-6">
        <h2 className="text-lg font-medium mb-4">Periode Berlaku</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Tanggal Mulai
            </h3>
            <p>{formatDate(validFrom)}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Tanggal Berakhir
            </h3>
            <p>{formatDate(validUntil)}</p>
          </div>
        </div>
      </div>

      {/* Users with Voucher */}
      <div className="bg-white rounded-lg p-5 mb-6">
        <h2 className="text-lg font-medium mb-4">Pengguna Voucher</h2>
        
        {usersWithVoucher && usersWithVoucher.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Klaim</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Penggunaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usersWithVoucher.map((user) => (
                  <tr key={user.id || user.userId}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{user.id || user.userId}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{user.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{user.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{formatDate(user.claimedDate || user.addedAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {user.usedDate || user.usedAt ? formatDate(user.usedDate || user.usedAt) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Belum ada pengguna yang mengklaim voucher ini.
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default VoucherDetail;