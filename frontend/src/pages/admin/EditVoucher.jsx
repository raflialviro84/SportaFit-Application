import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { IoSave, IoTrash, IoCalendarOutline, IoTicketOutline, IoWarningOutline } from 'react-icons/io5';
import AdminLayout from '../../components/AdminLayout';

export default function EditVoucher() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    imageUrl: '',
    usageLimit: '',
    isActive: true
  });

  // Fetch voucher data
  useEffect(() => {
    fetchVoucherData();
  }, [id]);

  const fetchVoucherData = async () => {
    try {
      setFetchLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/vouchers/admin/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const voucher = data.data || data;
        
        // Format dates for datetime-local input
        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16);
        };

        setFormData({
          code: voucher.code || '',
          title: voucher.title || '',
          description: voucher.description || '',
          discountType: voucher.discountType || voucher.discount_type || 'percentage',
          discountValue: (voucher.discountValue || voucher.discount_value || '').toString(),
          minPurchase: (voucher.minPurchase || voucher.min_purchase || '').toString(),
          maxDiscount: (voucher.maxDiscount || voucher.max_discount || '').toString(),
          startDate: formatDateForInput(voucher.startDate || voucher.start_date),
          endDate: formatDateForInput(voucher.endDate || voucher.end_date),
          imageUrl: voucher.imageUrl || voucher.image_url || '',
          usageLimit: (voucher.usageLimit || voucher.usage_limit || '').toString(),
          isActive: voucher.isActive || voucher.is_active || true
        });
      } else {
        setError('Gagal memuat data voucher');
      }
    } catch (error) {
      console.error('Error fetching voucher:', error);
      setError('Terjadi kesalahan saat memuat data voucher');
    } finally {
      setFetchLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Generate voucher code
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({
      ...prev,
      code: result
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/vouchers/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          discountValue: parseFloat(formData.discountValue),
          minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : 0,
          maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null
        })
      });

      if (response.ok) {
        navigate('/admin/vouchers');
      } else {
        const data = await response.json();
        setError(data.message || 'Gagal mengupdate voucher');
      }
    } catch (error) {
      console.error('Error updating voucher:', error);
      setError('Terjadi kesalahan saat mengupdate voucher');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete voucher
  const handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus voucher ini?')) {
      return;
    }

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/vouchers/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        navigate('/admin/vouchers');
      } else {
        const data = await response.json();
        setError(data.message || 'Gagal menghapus voucher');
      }
    } catch (error) {
      console.error('Error deleting voucher:', error);
      setError('Terjadi kesalahan saat menghapus voucher');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Memuat data voucher...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Voucher</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {deleteLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menghapus...
              </>
            ) : (
              <>
                <IoTrash className="mr-2" size={18} />
                Hapus Voucher
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
          <IoWarningOutline className="text-red-600 mt-0.5 mr-3 flex-shrink-0" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Informasi Voucher</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Voucher Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kode Voucher <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan kode voucher"
                />
                <button
                  type="button"
                  onClick={generateCode}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Generate
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Kode unik untuk voucher (huruf besar & angka)</p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Voucher <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan judul voucher"
              />
              <p className="mt-1 text-xs text-gray-500">Nama yang akan ditampilkan kepada pengguna</p>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan deskripsi voucher"
              />
              <p className="mt-1 text-xs text-gray-500">Penjelasan detail tentang voucher dan ketentuan penggunaan</p>
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Gambar
              </label>
              <div className="flex flex-col sm:flex-row sm:space-x-4">
                <div className="flex-1 mb-4 sm:mb-0">
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-500">Gambar banner untuk voucher (opsional)</p>
                </div>
                {formData.imageUrl && (
                  <div className="w-full sm:w-40 h-32 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.target.src = '/Voucher1.png'; // Fallback to default image
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Active Status */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Voucher Aktif
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500 pl-6">Jika tidak dicentang, voucher tidak akan dapat digunakan</p>
            </div>
          </div>
        </div>

        {/* Discount Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Pengaturan Diskon</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Discount Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Diskon <span className="text-red-500">*</span>
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="percentage">Persentase (%)</option>
                <option value="fixed">Nominal (Rp)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Pilih cara perhitungan diskon</p>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nilai Diskon <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleChange}
                  required
                  min="0"
                  step={formData.discountType === 'percentage' ? '1' : '1000'}
                  max={formData.discountType === 'percentage' ? '100' : undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={formData.discountType === 'percentage' ? 'Contoh: 25' : 'Contoh: 50000'}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">
                    {formData.discountType === 'percentage' ? '%' : 'Rp'}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {formData.discountType === 'percentage' 
                  ? 'Persentase dari total transaksi (maks. 100%)' 
                  : 'Nilai tetap dalam Rupiah'}
              </p>
            </div>

            {/* Min Purchase */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimal Pembelian (Rp)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="minPurchase"
                  value={formData.minPurchase}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-8"
                  placeholder="Contoh: 100000"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">Rp</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">Total transaksi minimum untuk menggunakan voucher</p>
            </div>

            {/* Max Discount */}
            {formData.discountType === 'percentage' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maksimal Diskon (Rp)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="maxDiscount"
                    value={formData.maxDiscount}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-8"
                    placeholder="Contoh: 100000"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">Rp</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Batas maksimal nilai diskon dalam Rupiah</p>
              </div>
            )}

            {/* Usage Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batas Penggunaan
              </label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Kosongkan untuk unlimited"
              />
              <p className="mt-1 text-xs text-gray-500">Jumlah maksimal voucher dapat digunakan</p>
            </div>
          </div>
        </div>

        {/* Date Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 text-blue-700 p-2 rounded-full mr-3">
              <IoCalendarOutline size={20} />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Periode Berlaku</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">Waktu voucher mulai dapat digunakan</p>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Berakhir <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">Waktu voucher tidak dapat digunakan lagi</p>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={() => navigate('/admin/vouchers')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <IoSave className="mr-2" size={18} />
                Update Voucher
              </>
            )}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}