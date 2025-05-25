import React from "react";
import { useVoucher } from "../../context/voucher-context";

const PaymentDetail = () => {
  const { voucher } = useVoucher();

  return (
    <div>
      <h2>Payment Details</h2>
      <p>Voucher Code: {voucher.code}</p>
      <p>Discount: {voucher.discount}%</p>
    </div>
  );
};

export default PaymentDetail;