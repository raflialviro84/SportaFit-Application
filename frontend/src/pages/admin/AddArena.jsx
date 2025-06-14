import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { 
  FaSave, 
  FaTimes, 
  FaUpload, 
  FaPlus, 
  FaMinus,
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaImage
} from 'react-icons/fa';

const initialFormData = {
  name: '',
  description: '',
  address: '',
  city: '',
  opening_hours: '',
  price_per_hour: '',
  phone: '',
  email: '',
  website: '',
  image_url: '',
  status: 'active',
  facilities: [],
  policies: [''],
  courts: [
    { name: 'Lapangan 1', price_per_hour: '', status: 'active' }
  ]
};

const availableFacilities = [
  'AC', 'Parkir', 'Kantin', 'Toilet', 'Shower', 
  'Ruang Ganti', 'WiFi', 'Sound System', 'CCTV',
  'Area Tunggu', 'Locker', 'Cafeteria'
];

const cities = ['Surabaya', 'Malang', 'Jakarta', 'Bandung', 'Yogyakarta', 'Semarang'];

function AddArena() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle facility toggle
  const handleFacilityToggle = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  // Handle policy changes
  const handlePolicyChange = (index, value) => {
    const newPolicies = [...formData.policies];
    newPolicies[index] = value;
    setFormData(prev => ({
      ...prev,
      policies: newPolicies
    }));
  };

  const addPolicy = () => {
    setFormData(prev => ({
      ...prev,
      policies: [...prev.policies, '']
    }));
  };

  const removePolicy = (index) => {
    if (formData.policies.length > 1) {
      setFormData(prev => ({
        ...prev,
        policies: prev.policies.filter((_, i) => i !== index)
      }));
    }
  };

  // Handle court changes
  const handleCourtChange = (index, field, value) => {
    const newCourts = [...formData.courts];
    newCourts[index] = {
      ...newCourts[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      courts: newCourts
    }));
  };

  const addCourt = () => {
    setFormData(prev => ({
      ...prev,
      courts: [...prev.courts, { 
        name: `Lapangan ${prev.courts.length + 1}`, 
        price_per_hour: '', 
        status: 'active' 
      }]
    }));
  };

  const removeCourt = (index) => {
    if (formData.courts.length > 1) {
      setFormData(prev => ({
        ...prev,
        courts: prev.courts.filter((_, i) => i !== index)
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          image_url: reader.result // In real app, this would be uploaded to server
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Nama arena wajib diisi';
    if (!formData.description.trim()) newErrors.description = 'Deskripsi wajib diisi';
    if (!formData.address.trim()) newErrors.address = 'Alamat wajib diisi';
    if (!formData.city) newErrors.city = 'Kota wajib dipilih';
    if (!formData.opening_hours.trim()) newErrors.opening_hours = 'Jam operasional wajib diisi';
    if (!formData.price_per_hour || formData.price_per_hour <= 0) {
      newErrors.price_per_hour = 'Harga per jam harus lebih dari 0';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi';
    if (formData.facilities.length === 0) newErrors.facilities = 'Pilih minimal satu fasilitas';
    
    // Validate policies
    const validPolicies = formData.policies.filter(p => p.trim());
    if (validPolicies.length === 0) newErrors.policies = 'Tambahkan minimal satu kebijakan';

    // Validate courts
    const validCourts = formData.courts.filter(c => c.name.trim() && c.price_per_hour > 0);
    if (validCourts.length === 0) newErrors.courts = 'Tambahkan minimal satu lapangan dengan data lengkap';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real app, make API call here
      console.log('Arena data to submit:', formData);
      
      alert('Arena berhasil ditambahkan!');
      navigate('/admin/arenas');
    } catch (error) {
      alert('Gagal menambahkan arena. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tambah Arena Baru</h1>
            <p className="text-gray-600 mt-1">Lengkapi informasi arena badminton</p>
          </div>
          
          <button
            onClick={() => navigate('/admin/arenas')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={16} />
            Batal
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Arena *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Contoh: Arena Victory Badminton"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi Arena *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Jelaskan tentang arena, fasilitas unggulan, dll..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaMapMarkerAlt className="inline mr-1" />
                  Alamat Lengkap *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Jl. Contoh No. 123"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kota *
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Pilih Kota</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaClock className="inline mr-1" />
                  Jam Operasional *
                </label>
                <input
                  type="text"
                  name="opening_hours"
                  value={formData.opening_hours}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.opening_hours ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="08:00 - 22:00"
                />
                {errors.opening_hours && <p className="text-red-500 text-sm mt-1">{errors.opening_hours}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaDollarSign className="inline mr-1" />
                  Harga per Jam (Rp) *
                </label>
                <input
                  type="number"
                  name="price_per_hour"
                  value={formData.price_per_hour}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.price_per_hour ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="80000"
                  min="0"
                />
                {errors.price_per_hour && <p className="text-red-500 text-sm mt-1">{errors.price_per_hour}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Telepon *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0812-3456-7890"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="arena@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://arena-example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Arena
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Aktif</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <FaImage className="inline mr-2" />
              Foto Arena
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Foto Utama
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FaUpload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG atau JPEG (MAX. 5MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
              
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Fasilitas Arena *</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableFacilities.map(facility => (
                <label key={facility} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.facilities.includes(facility)}
                    onChange={() => handleFacilityToggle(facility)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{facility}</span>
                </label>
              ))}
            </div>
            {errors.facilities && <p className="text-red-500 text-sm mt-2">{errors.facilities}</p>}
          </div>

          {/* Policies */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Kebijakan Arena *</h2>
              <button
                type="button"
                onClick={addPolicy}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
              >
                <FaPlus size={12} />
                Tambah Kebijakan
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.policies.map((policy, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={policy}
                    onChange={(e) => handlePolicyChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Kebijakan ${index + 1}`}
                  />
                  {formData.policies.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePolicy(index)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <FaMinus size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.policies && <p className="text-red-500 text-sm mt-2">{errors.policies}</p>}
          </div>

          {/* Courts */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Daftar Lapangan *</h2>
              <button
                type="button"
                onClick={addCourt}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
              >
                <FaPlus size={12} />
                Tambah Lapangan
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.courts.map((court, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lapangan
                    </label>
                    <input
                      type="text"
                      value={court.name}
                      onChange={(e) => handleCourtChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Lapangan 1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harga/Jam (Rp)
                    </label>
                    <input
                      type="number"
                      value={court.price_per_hour}
                      onChange={(e) => handleCourtChange(index, 'price_per_hour', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="80000"
                      min="0"
                    />
                  </div>
                  
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={court.status}
                        onChange={(e) => handleCourtChange(index, 'status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">Aktif</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="inactive">Nonaktif</option>
                      </select>
                    </div>
                    
                    {formData.courts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCourt(index)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Hapus Lapangan"
                      >
                        <FaMinus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {errors.courts && <p className="text-red-500 text-sm mt-2">{errors.courts}</p>}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin/arenas')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-sporta-blue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSave size={14} />
              {loading ? 'Menyimpan...' : 'Simpan Arena'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default AddArena;