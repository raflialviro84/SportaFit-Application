// src/context/PaymentContext.jsx
import React, { createContext, useState } from "react";

export const PaymentContext = createContext();

export function PaymentProvider({ children }) {
  const [methods] = useState([
    { id: "dana",  name: "DANA",   type: "E-Wallet", balance: 1850429, icon: "/icons/dana.png" },
    { id: "ovo",   name: "OVO",    type: "E-Wallet", balance: 424000, icon: "/icons/ovo.png" },
    { id: "gopay", name: "GoPay",  type: "E-Wallet", balance: 976000, icon: "/icons/gopay.png" },
  ]);

  return (
    <PaymentContext.Provider value={{ methods }}>
      {children}
    </PaymentContext.Provider>
  );
}
