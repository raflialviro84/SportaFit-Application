import React from 'react';

/**
 * Komponen untuk menampilkan ringkasan pembayaran dengan diskon voucher
 * @param {Object} props - Component properties
 * @param {number} props.subtotal - Total harga sebelum diskon
 * @param {number} props.voucherDiscount - Jumlah diskon dari voucher
 * @param {Object} props.selectedVoucher - Voucher yang dipilih
 * @param {number} props.serviceFee - Biaya layanan (opsional)
 */
const PaymentSummary = ({
  subtotal = 0,
  voucherDiscount = 0,
  selectedVoucher = null,
  serviceFee = 0
}) => {
  // Hitung total pembayaran
  const total = subtotal + serviceFee - voucherDiscount;

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold text-lg mb-4">Ringkasan Pembayaran</h3>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>Rp {subtotal.toLocaleString('id-ID')}</span>
        </div>
        
        {serviceFee > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Biaya Layanan</span>
            <span>Rp {serviceFee.toLocaleString('id-ID')}</span>
          </div>
        )}
        
        {selectedVoucher && voucherDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Diskon Voucher ({selectedVoucher.title})</span>
            <span>- Rp {voucherDiscount.toLocaleString('id-ID')}</span>
          </div>
        )}
      </div>
      
      <div className="border-t pt-3">
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>Rp {total.toLocaleString('id-ID')}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;