import { createContext, useContext } from "react";

export const VoucherContext = createContext();
export const useVoucher = () => useContext(VoucherContext);
