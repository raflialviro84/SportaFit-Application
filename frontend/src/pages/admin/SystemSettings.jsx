import React, { useState, useEffect } from 'react';
import {
  FaSave,
  FaSync,
  FaLock,
  FaEnvelope,
  FaCreditCard,
  FaClock,
  FaBell,
  FaServer,
  FaCog,
  FaExclamationTriangle,
  FaCheck,
  FaDatabase
} from 'react-icons/fa';
import { 
  FaGoogle, 
  FaFacebook, 
  FaTwitter,
  FaWhatsapp,
  FaInstagram
} from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';

export default function SystemSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'SportaFit',
    siteDescription: 'Platform booking lapangan badminton terpercaya',
    siteUrl: 'https://sportafit.com',
    adminEmail: 'admin@sportafit.com',
    supportEmail: 'support@sportafit.com',
    phone: '+62 812-3456-7890',
    address: 'Jl. Olahraga No. 123, Jakarta',
    timezone: 'Asia/Jakarta',
    language: 'id',
    currency: 'IDR',
    maintenanceMode: false
  });

  // Booking Settings
  const [bookingSettings, setBookingSettings] = useState({
    maxAdvanceBookingDays: 30,
    minAdvanceBookingHours: 2,
    maxBookingDuration: 4,
    cancellationDeadlineHours: 24,
    autoConfirmBooking: true,
    requirePaymentConfirmation: true,
    serviceFeePercentage: 5,
    protectionFeeAmount: 10000,
    operatingHours: {
      start: '06:00',
      end: '22:00'
    },
    weekendPriceMultiplier: 1.2
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    enabledMethods: ['bank_transfer', 'qris', 'ewallet'],
    bankAccounts: [
      { bank: 'BCA', accountNumber: '1234567890', accountName: 'SportaFit' },
      { bank: 'Mandiri', accountNumber: '0987654321', accountName: 'SportaFit' }
    ],
    qrisEnabled: true,
    ewalletProviders: ['gopay', 'ovo', 'dana'],
    paymentDeadlineHours: 24,
    autoExpireUnpaidBookings: true
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    smtpEncryption: 'tls',
    fromEmail: 'noreply@sportafit.com',
    fromName: 'SportaFit',
    enableBookingConfirmation: true,
    enablePaymentReminder: true,
    enableCancellationNotice: true
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    enablePushNotifications: true,
    notifyNewBooking: true,
    notifyPaymentReceived: true,
    notifyBookingCancellation: true,
    notifySystemMaintenance: true,
    adminNotificationEmail: 'admin@sportafit.com'
  });

  // Social Media Settings
  const [socialSettings, setSocialSettings] = useState({
    facebook: 'https://facebook.com/sportafit',
    instagram: 'https://instagram.com/sportafit',
    twitter: 'https://twitter.com/sportafit',
    whatsapp: '+62812-3456-7890',
    enableSocialLogin: true,
    googleClientId: '',
    facebookAppId: ''
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    enableTwoFactor: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    requireStrongPassword: true,
    enableCaptcha: true,
    allowedIpAddresses: '',
    enableAuditLog: true
  });

  const tabs = [
    { id: 'general', label: 'Umum', icon: FaCog },
    { id: 'booking', label: 'Booking', icon: FaClock },
    { id: 'payment', label: 'Pembayaran', icon: FaCreditCard },
    { id: 'email', label: 'Email', icon: FaEnvelope },
    { id: 'notifications', label: 'Notifikasi', icon: FaBell },
    { id: 'social', label: 'Media Sosial', icon: FaInstagram },
    { id: 'security', label: 'Keamanan', icon: FaLock },
    { id: 'system', label: 'Sistem', icon: FaServer }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load settings from localStorage or API
      const savedSettings = localStorage.getItem('systemSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setGeneralSettings(prev => ({ ...prev, ...parsed.general }));
        setBookingSettings(prev => ({ ...prev, ...parsed.booking }));
        setPaymentSettings(prev => ({ ...prev, ...parsed.payment }));
        setEmailSettings(prev => ({ ...prev, ...parsed.email }));
        setNotificationSettings(prev => ({ ...prev, ...parsed.notifications }));
        setSocialSettings(prev => ({ ...prev, ...parsed.social }));
        setSecuritySettings(prev => ({ ...prev, ...parsed.security }));
      }
    } catch (error) {
      setError('Gagal memuat pengaturan sistem');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const allSettings = {
        general: generalSettings,
        booking: bookingSettings,
        payment: paymentSettings,
        email: emailSettings,
        notifications: notificationSettings,
        social: socialSettings,
        security: securitySettings
      };

      // Save to localStorage (replace with actual API call)
      localStorage.setItem('systemSettings', JSON.stringify(allSettings));
      
      setSuccess('Pengaturan berhasil disimpan');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan ke pengaturan default?')) {
      // Reset all settings to default values
      localStorage.removeItem('systemSettings');
      loadSettings();
      setSuccess('Pengaturan dikembalikan ke default');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const testEmail = async () => {
    try {
      setSuccess('Mengirim email test...');
      // Simulate email test
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess('Email test berhasil dikirim!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Gagal mengirim email test');
      setTimeout(() => setError(''), 3000);
    }
  };

  const clearCache = async () => {
    try {
      setSuccess('Membersihkan cache...');
      // Simulate cache clearing
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess('Cache berhasil dibersihkan!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Gagal membersihkan cache');
      setTimeout(() => setError(''), 3000);
    }
  };

  const backupDatabase = async () => {
    try {
      setSuccess('Memulai backup database...');
      // Simulate database backup
      await new Promise(resolve => setTimeout(resolve, 3000));
      setSuccess('Backup database berhasil!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Gagal melakukan backup database');
      setTimeout(() => setError(''), 3000);
    }
  };

  const healthCheck = async () => {
    try {
      setSuccess('Melakukan health check...');
      // Simulate health check
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess('System health check completed - All systems operational!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Health check gagal');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sporta-blue"></div>
          <span className="ml-3 text-gray-600">Memuat pengaturan sistem...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-3">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="p-3 sm:p-4">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Pengaturan Sistem</h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Kelola konfigurasi dan pengaturan aplikasi SportaFit
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={resetToDefaults}
                className="flex items-center justify-center px-2 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-xs sm:text-sm"
              >
                <FaSync className="mr-1.5" size={12} />
                Reset Default
              </button>
              <button
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center justify-center px-2 py-1.5 bg-sporta-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 text-xs sm:text-sm"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-1.5" size={12} />
                    Simpan Semua
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-2 sm:p-3">
            <div className="flex items-start">
              <FaCheck className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={14} />
              <p className="text-green-800 text-xs sm:text-sm">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2 sm:p-3">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-red-500 mr-2 mt-0.5 flex-shrink-0" size={14} />
              <p className="text-red-800 text-xs sm:text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Tabs Navigation - Make sure it's scrollable on mobile */}
        <div className="bg-white rounded-md shadow-sm overflow-auto scrollbar-hide">
          <div className="border-b border-gray-200 flex whitespace-nowrap min-w-full">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-2 text-xs sm:text-sm font-medium flex items-center border-b-2 flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-sporta-blue text-sporta-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={12} className="mr-1 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-md shadow-sm">
          <div className="p-3 sm:p-4">
            {activeTab === 'general' && (
              <div className="space-y-3">
                <h3 className="text-sm sm:text-base font-medium text-gray-900">Pengaturan Umum</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nama Situs
                    </label>
                    <input
                      type="text"
                      value={generalSettings.siteName}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      URL Situs
                    </label>
                    <input
                      type="url"
                      value={generalSettings.siteUrl}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Deskripsi Situs
                    </label>
                    <textarea
                      value={generalSettings.siteDescription}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email Admin
                    </label>
                    <input
                      type="email"
                      value={generalSettings.adminEmail}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email Support
                    </label>
                    <input
                      type="email"
                      value={generalSettings.supportEmail}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      value={generalSettings.phone}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Zona Waktu
                    </label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    >
                      <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                      <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                      <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Alamat
                    </label>
                    <textarea
                      value={generalSettings.address}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, address: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="maintenanceMode"
                        checked={generalSettings.maintenanceMode}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                        className="h-4 w-4 text-sporta-blue focus:ring-sporta-blue border-gray-300 rounded"
                      />
                      <label htmlFor="maintenanceMode" className="ml-2 block text-xs text-gray-900">
                        Mode Maintenance
                      </label>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 ml-6">
                      Aktifkan untuk menonaktifkan sementara akses publik ke situs
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'booking' && (
              <div className="space-y-3">
                <h3 className="text-sm sm:text-base font-medium text-gray-900">Pengaturan Booking</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Maksimal Booking di Muka (Hari)
                    </label>
                    <input
                      type="number"
                      value={bookingSettings.maxAdvanceBookingDays}
                      onChange={(e) => setBookingSettings(prev => ({ ...prev, maxAdvanceBookingDays: parseInt(e.target.value) }))}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Minimal Booking di Muka (Jam)
                    </label>
                    <input
                      type="number"
                      value={bookingSettings.minAdvanceBookingHours}
                      onChange={(e) => setBookingSettings(prev => ({ ...prev, minAdvanceBookingHours: parseInt(e.target.value) }))}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Maksimal Durasi Booking (Jam)
                    </label>
                    <input
                      type="number"
                      value={bookingSettings.maxBookingDuration}
                      onChange={(e) => setBookingSettings(prev => ({ ...prev, maxBookingDuration: parseInt(e.target.value) }))}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Batas Pembatalan (Jam)
                    </label>
                    <input
                      type="number"
                      value={bookingSettings.cancellationDeadlineHours}
                      onChange={(e) => setBookingSettings(prev => ({ ...prev, cancellationDeadlineHours: parseInt(e.target.value) }))}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Jam Operasional Mulai
                    </label>
                    <input
                      type="time"
                      value={bookingSettings.operatingHours.start}
                      onChange={(e) => setBookingSettings(prev => ({
                        ...prev,
                        operatingHours: { ...prev.operatingHours, start: e.target.value }
                      }))}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Jam Operasional Selesai
                    </label>
                    <input
                      type="time"
                      value={bookingSettings.operatingHours.end}
                      onChange={(e) => setBookingSettings(prev => ({
                        ...prev,
                        operatingHours: { ...prev.operatingHours, end: e.target.value }
                      }))}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Biaya Layanan (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={bookingSettings.serviceFeePercentage}
                      onChange={(e) => setBookingSettings(prev => ({ ...prev, serviceFeePercentage: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Multiplier Harga Weekend
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={bookingSettings.weekendPriceMultiplier}
                      onChange={(e) => setBookingSettings(prev => ({ ...prev, weekendPriceMultiplier: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoConfirmBooking"
                        checked={bookingSettings.autoConfirmBooking}
                        onChange={(e) => setBookingSettings(prev => ({ ...prev, autoConfirmBooking: e.target.checked }))}
                        className="h-4 w-4 text-sporta-blue focus:ring-sporta-blue border-gray-300 rounded"
                      />
                      <label htmlFor="autoConfirmBooking" className="ml-2 block text-xs text-gray-900">
                        Konfirmasi Booking Otomatis
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requirePaymentConfirmation"
                        checked={bookingSettings.requirePaymentConfirmation}
                        onChange={(e) => setBookingSettings(prev => ({ ...prev, requirePaymentConfirmation: e.target.checked }))}
                        className="h-4 w-4 text-sporta-blue focus:ring-sporta-blue border-gray-300 rounded"
                      />
                      <label htmlFor="requirePaymentConfirmation" className="ml-2 block text-xs text-gray-900">
                        Wajib Konfirmasi Pembayaran
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="space-y-3">
                <h3 className="text-sm sm:text-base font-medium text-gray-900">Pengaturan Pembayaran</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Metode Pembayaran yang Diaktifkan
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'bank_transfer', label: 'Transfer Bank' },
                        { id: 'qris', label: 'QRIS' },
                        { id: 'ewallet', label: 'E-Wallet' },
                        { id: 'credit_card', label: 'Kartu Kredit' }
                      ].map((method) => (
                        <div key={method.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={method.id}
                            checked={paymentSettings.enabledMethods.includes(method.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPaymentSettings(prev => ({
                                  ...prev,
                                  enabledMethods: [...prev.enabledMethods, method.id]
                                }));
                              } else {
                                setPaymentSettings(prev => ({
                                  ...prev,
                                  enabledMethods: prev.enabledMethods.filter(m => m !== method.id)
                                }));
                              }
                            }}
                            className="h-3 w-3 text-sporta-blue focus:ring-sporta-blue border-gray-300 rounded"
                          />
                          <label htmlFor={method.id} className="ml-1.5 block text-xs text-gray-900">
                            {method.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Rekening Bank
                    </label>
                    <div className="space-y-2">
                      {paymentSettings.bankAccounts.map((account, index) => (
                        <div key={index} className="p-2 border border-gray-200 rounded-md space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Nama Bank</label>
                            <input
                              type="text"
                              placeholder="Nama Bank"
                              value={account.bank}
                              onChange={(e) => {
                                const newAccounts = [...paymentSettings.bankAccounts];
                                newAccounts[index].bank = e.target.value;
                                setPaymentSettings(prev => ({ ...prev, bankAccounts: newAccounts }));
                              }}
                              className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Nomor Rekening</label>
                            <input
                              type="text"
                              placeholder="Nomor Rekening"
                              value={account.accountNumber}
                              onChange={(e) => {
                                const newAccounts = [...paymentSettings.bankAccounts];
                                newAccounts[index].accountNumber = e.target.value;
                                setPaymentSettings(prev => ({ ...prev, bankAccounts: newAccounts }));
                              }}
                              className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Nama Pemilik</label>
                            <input
                              type="text"
                              placeholder="Nama Pemilik"
                              value={account.accountName}
                              onChange={(e) => {
                                const newAccounts = [...paymentSettings.bankAccounts];
                                newAccounts[index].accountName = e.target.value;
                                setPaymentSettings(prev => ({ ...prev, bankAccounts: newAccounts }));
                              }}
                              className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Batas Waktu Pembayaran (Jam)
                    </label>
                    <input
                      type="number"
                      value={paymentSettings.paymentDeadlineHours}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, paymentDeadlineHours: parseInt(e.target.value) }))}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center mt-3">
                    <input
                      type="checkbox"
                      id="autoExpireUnpaidBookings"
                      checked={paymentSettings.autoExpireUnpaidBookings}
                      onChange={(e) => setPaymentSettings(prev => ({ ...prev, autoExpireUnpaidBookings: e.target.checked }))}
                      className="h-4 w-4 text-sporta-blue focus:ring-sporta-blue border-gray-300 rounded"
                    />
                    <label htmlFor="autoExpireUnpaidBookings" className="ml-2 block text-xs text-gray-900">
                      Auto Expire Booking Belum Bayar
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Pengaturan Email</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={emailSettings.smtpHost}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      value={emailSettings.smtpUsername}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Password
                    </label>
                    <input
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={emailSettings.fromEmail}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={emailSettings.fromName}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <h4 className="text-md font-medium text-gray-900">Notifikasi Email</h4>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableBookingConfirmation"
                        checked={emailSettings.enableBookingConfirmation}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, enableBookingConfirmation: e.target.checked }))}
                        className="h-4 w-4 text-sporta-blue focus:ring-sporta-blue border-gray-300 rounded"
                      />
                      <label htmlFor="enableBookingConfirmation" className="ml-2 block text-sm text-gray-900">
                        Konfirmasi Booking
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enablePaymentReminder"
                        checked={emailSettings.enablePaymentReminder}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, enablePaymentReminder: e.target.checked }))}
                        className="h-4 w-4 text-sporta-blue focus:ring-sporta-blue border-gray-300 rounded"
                      />
                      <label htmlFor="enablePaymentReminder" className="ml-2 block text-sm text-gray-900">
                        Pengingat Pembayaran
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableCancellationNotice"
                        checked={emailSettings.enableCancellationNotice}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, enableCancellationNotice: e.target.checked }))}
                        className="h-4 w-4 text-sporta-blue focus:ring-sporta-blue border-gray-300 rounded"
                      />
                      <label htmlFor="enableCancellationNotice" className="ml-2 block text-sm text-gray-900">
                        Pemberitahuan Pembatalan
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Pengaturan Notifikasi</h3>

                <div className="space-y-4 md:space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Jenis Notifikasi</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="enableEmailNotifications"
                          checked={notificationSettings.enableEmailNotifications}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, enableEmailNotifications: e.target.checked }))}
                          className="h-4 w-4 text-sporta-blue focus:ring-sporta-blue border-gray-300 rounded"
                        />
                        <label htmlFor="enableEmailNotifications" className="ml-2 block text-sm text-gray-900">
                          Notifikasi Email
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="enableSmsNotifications"
                          checked={notificationSettings.enableSmsNotifications}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, enableSmsNotifications: e.target.checked }))}
                          className="h-4 w-4 text-sporta-blue focus:ring-sporta-blue border-gray-300 rounded"
                        />
                        <label htmlFor="enableSmsNotifications" className="ml-2 block text-sm text-gray-900">
                          Notifikasi SMS
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="enablePushNotifications"
                          checked={notificationSettings.enablePushNotifications}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, enablePushNotifications: e.target.checked }))}
                          className="h-4 w-4 text-sporta-blue focus:ring-sporta-blue border-gray-300 rounded"
                        />
                        <label htmlFor="enablePushNotifications" className="ml-2 block text-sm text-gray-900">
                          Push Notifications
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Event Notifikasi</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="notifyNewBooking"
                          checked={notificationSettings.notifyNewBooking}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, notifyNewBooking: e.target.checked }))}
                          className="h-4 w-4 text-sporta-blue focus:ring-sporta-blue border-gray-300 rounded"
                        />
                        <label htmlFor="notifyNewBooking" className="ml-2 block text-sm text-gray-900">
                          Booking Baru
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="notifyPaymentReceived"
                          checked={notificationSettings.notifyPaymentReceived}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, notifyPaymentReceived: e.target.checked }))}
                          className="h-4 w-4 text-sporta-blue focus:ring-sporta-blue border-gray-300 rounded"
                        />
                        <label htmlFor="notifyPaymentReceived" className="ml-2 block text-sm text-gray-900">
                          Pembayaran Diterima
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="notifyBookingCancellation"
                          checked={notificationSettings.notifyBookingCancellation}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, notifyBookingCancellation: e.target.checked }))}
                          className="h-4 w-4 text-sporta-blue focus:ring-sporta-blue border-gray-300 rounded"
                        />
                        <label htmlFor="notifyBookingCancellation" className="ml-2 block text-sm text-gray-900">
                          Pembatalan Booking
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="notifySystemMaintenance"
                          checked={notificationSettings.notifySystemMaintenance}
                          onChange={(e) => setNotificationSettings(prev => ({ ...prev, notifySystemMaintenance: e.target.checked }))}
                          className="h-4 w-4 text-sporta-blue focus:ring-sporta-blue border-gray-300 rounded"
                        />
                        <label htmlFor="notifySystemMaintenance" className="ml-2 block text-sm text-gray-900">
                          Maintenance Sistem
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Notifikasi Admin
                    </label>
                    <input
                      type="email"
                      value={notificationSettings.adminNotificationEmail}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, adminNotificationEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Pengaturan Media Sosial</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaFacebook className="inline mr-2" />
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={socialSettings.facebook}
                      onChange={(e) => setSocialSettings(prev => ({ ...prev, facebook: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                      placeholder="https://facebook.com/sportafit"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaInstagram className="inline mr-2" />
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={socialSettings.instagram}
                      onChange={(e) => setSocialSettings(prev => ({ ...prev, instagram: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                      placeholder="https://instagram.com/sportafit"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaTwitter className="inline mr-2" />
                      Twitter
                    </label>
                    <input
                      type="url"
                      value={socialSettings.twitter}
                      onChange={(e) => setSocialSettings(prev => ({ ...prev, twitter: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                      placeholder="https://twitter.com/sportafit"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaWhatsapp className="inline mr-2" />
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={socialSettings.whatsapp}
                      onChange={(e) => setSocialSettings(prev => ({ ...prev, whatsapp: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                      placeholder="+62812-3456-7890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaGoogle className="inline mr-2" />
                      Google Client ID
                    </label>
                    <input
                      type="text"
                      value={socialSettings.googleClientId}
                      onChange={(e) => setSocialSettings(prev => ({ ...prev, googleClientId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                      placeholder="Google OAuth Client ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaFacebook className="inline mr-2" />
                      Facebook App ID
                    </label>
                    <input
                      type="text"
                      value={socialSettings.facebookAppId}
                      onChange={(e) => setSocialSettings(prev => ({ ...prev, facebookAppId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                      placeholder="Facebook App ID"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableSocialLogin"
                        checked={socialSettings.enableSocialLogin}
                        onChange={(e) => setSocialSettings(prev => ({ ...prev, enableSocialLogin: e.target.checked }))}
                        className="h-4 w-4 text-sporta-blue focus:ring-sporta-blue border-gray-300 rounded"
                      />
                      <label htmlFor="enableSocialLogin" className="ml-2 block text-sm text-gray-900">
                        Aktifkan Login dengan Media Sosial
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Pengaturan Keamanan</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (Menit)
                    </label>
                    <input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maksimal Percobaan Login
                    </label>
                    <input
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durasi Lockout (Menit)
                    </label>
                    <input
                      type="number"
                      value={securitySettings.lockoutDuration}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, lockoutDuration: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IP Address yang Diizinkan (pisahkan dengan koma)
                    </label>
                    <textarea
                      value={securitySettings.allowedIpAddresses}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, allowedIpAddresses: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sporta-blue focus:border-transparent"
                      placeholder="192.168.1.1, 10.0.0.1 (kosongkan untuk mengizinkan semua IP)"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableTwoFactor"
                        checked={securitySettings.enableTwoFactor}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, enableTwoFactor: e.target.checked }))}
                        className="h-4 w-4 text-sporta-blue focus:ring-sporta-blue border-gray-300 rounded"
                      />
                      <label htmlFor="enableTwoFactor" className="ml-2 block text-sm text-gray-900">
                        Aktifkan Two-Factor Authentication
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requireStrongPassword"
                        checked={securitySettings.requireStrongPassword}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, requireStrongPassword: e.target.checked }))}
                        className="h-4 w-4 text-sporta-blue focus:ring-sporta-blue border-gray-300 rounded"
                      />
                      <label htmlFor="requireStrongPassword" className="ml-2 block text-sm text-gray-900">
                        Wajib Password Kuat
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableCaptcha"
                        checked={securitySettings.enableCaptcha}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, enableCaptcha: e.target.checked }))}
                        className="h-4 w-4 text-sporta-blue focus:ring-sporta-blue border-gray-300 rounded"
                      />
                      <label htmlFor="enableCaptcha" className="ml-2 block text-sm text-gray-900">
                        Aktifkan CAPTCHA
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableAuditLog"
                        checked={securitySettings.enableAuditLog}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, enableAuditLog: e.target.checked }))}
                        className="h-4 w-4 text-sporta-blue focus:ring-sporta-blue border-gray-300 rounded"
                      />
                      <label htmlFor="enableAuditLog" className="ml-2 block text-sm text-gray-900">
                        Aktifkan Audit Log
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-3">
                <h3 className="text-sm sm:text-base font-medium text-gray-900">Informasi Sistem</h3>

                <div className="space-y-3">
                  <div className="bg-gray-50 p-2 sm:p-3 rounded-md">
                    <h4 className="text-xs font-medium text-gray-900 mb-1.5">Status Sistem</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Status Server:</span>
                        <span className="text-xs font-medium text-green-600">Online</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Database:</span>
                        <span className="text-xs font-medium text-green-600">Connected</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Cache:</span>
                        <span className="text-xs font-medium text-green-600">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Storage:</span>
                        <span className="text-xs font-medium text-yellow-600">75% Used</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-2 sm:p-3 rounded-md">
                    <h4 className="text-xs font-medium text-gray-900 mb-1.5">Versi Aplikasi</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Frontend:</span>
                        <span className="text-xs font-medium">v1.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Backend:</span>
                        <span className="text-xs font-medium">v1.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Database:</span>
                        <span className="text-xs font-medium">MySQL 8.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Node.js:</span>
                        <span className="text-xs font-medium">v18.17.0</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-gray-900 mb-1.5">Aksi Sistem</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={backupDatabase}
                        className="flex items-center px-2 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs justify-center"
                      >
                        <FaDatabase className="mr-1.5" size={10} />
                        Backup Database
                      </button>
                      <button
                        onClick={clearCache}
                        className="flex items-center px-2 py-1.5 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-xs justify-center"
                      >
                        <FaSync className="mr-1.5" size={10} />
                        Clear Cache
                      </button>
                      <button
                        onClick={testEmail}
                        className="flex items-center px-2 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs justify-center"
                      >
                        <FaCheck className="mr-1.5" size={10} />
                        Test Email
                      </button>
                      <button
                        onClick={healthCheck}
                        className="flex items-center px-2 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-xs justify-center"
                      >
                        <FaServer className="mr-1.5" size={10} />
                        System Health Check
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-gray-900 mb-1.5">Log Aktivitas Terbaru</h4>
                    <div className="bg-gray-50 p-2 sm:p-3 rounded-md max-h-36 overflow-y-auto">
                      <div className="space-y-2">
                        <div className="border-b border-gray-200 pb-1.5">
                          <div className="text-xs text-gray-600">[2024-01-15 10:30:25] User login: admin@sportafit.com</div>
                          <div className="text-xs font-medium text-green-600 mt-0.5">SUCCESS</div>
                        </div>
                        <div className="border-b border-gray-200 pb-1.5">
                          <div className="text-xs text-gray-600">[2024-01-15 10:25:12] Database backup completed</div>
                          <div className="text-xs font-medium text-green-600 mt-0.5">SUCCESS</div>
                        </div>
                        <div className="border-b border-gray-200 pb-1.5">
                          <div className="text-xs text-gray-600">[2024-01-15 10:20:45] New booking created: #BK001</div>
                          <div className="text-xs font-medium text-blue-600 mt-0.5">INFO</div>
                        </div>
                        <div className="border-b border-gray-200 pb-1.5">
                          <div className="text-xs text-gray-600">[2024-01-15 10:15:33] Payment received: #PAY001</div>
                          <div className="text-xs font-medium text-green-600 mt-0.5">SUCCESS</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">[2024-01-15 10:10:21] Failed login attempt: user@example.com</div>
                          <div className="text-xs font-medium text-red-600 mt-0.5">WARNING</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
