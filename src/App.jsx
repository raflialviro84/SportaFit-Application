// src/App.jsx

import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/auth-context";
import { useEffect, useState } from "react";

import Login                   from "./pages/login_section/Login";
import Register                from "./pages/login_section/Register";
import Personaldata            from "./pages/login_section/Personaldata";
import ForgotPassword          from "./pages/login_section/ForgotPassword";
import Verification            from "./pages/login_section/Verification";
import NewPassword             from "./pages/login_section/NewPassword";
import Done                    from "./pages/login_section/Done";
import SocialAuthSuccess       from "./pages/login_section/SocialAuthSuccess";

// Auth pages with backend integration
import AuthLogin               from "./pages/auth/Login";
import DemoLogin               from "./pages/auth/DemoLogin";

import HomeGuest               from "./pages/main_menu/HomeGuest";
import HomeMember              from "./pages/main_menu/HomeMember";
import LocationSelector        from "./pages/main_menu/LocationSelector";

import Profil1                 from "./pages/profile/Profil1";
import EditProfil1             from "./pages/profile/EditProfil1";
import Voucher1                from "./pages/profile/Voucher1";
import Voucher2                from "./pages/profile/Voucher2";
import Voucher_SK              from "./pages/profile/Voucher_SK";
import Voucher_CP              from "./pages/profile/Voucher_CP";
import Voucher_Info            from "./pages/profile/Voucher_Info";
import Pemberitahuan1          from "./pages/profile/Pemberitahuan1";
import Pemberitahuan           from "./pages/profile/Pemberitahuan1";
import HapusAkun1           from "./pages/profile/HapusAkun1";
import UbahPin1                from "./pages/profile/UbahPin1";
import KebijakanPrivasi1       from "./pages/profile/KebijakanPrivasi1";
import FAQ1                    from "./pages/profile/FAQ1";
import SetUpPin                from "./pages/profile/SetUpPin";

import Arena                   from "./pages/pemesanan/arena";
import DetailArena             from "./pages/pemesanan/DetailArena";
import LapanganBooking         from "./pages/pemesanan/LapanganBooking";
import PaymentDetail           from "./pages/pemesanan/PaymentDetail";
import PaymentConfirmation     from "./pages/pemesanan/PaymentConfirmation";
import PaymentSuccess          from "./pages/pemesanan/PaymentSuccess";
import ListPemesanan           from "./pages/pemesanan/ListPemesanan";

import Transactions            from "./pages/transaksi/Transactions";
import DetailTransaction       from "./pages/transaksi/DetailTransactions";
import DetailTransactionFailed from "./pages/transaksi/DetailTransactionFailed";
import Invoice                 from "./pages/transaksi/Invoice";
import InvoiceFailed           from "./pages/transaksi/InvoiceFailed";

// Debug pages
import DebugTransactions       from "./pages/debug/DebugTransactions";

import { hasPin } from "./services/pinService";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{textAlign:'center',marginTop:'2rem'}}>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{textAlign:'center',marginTop:'2rem'}}>Loading...</div>;
  return !user ? children : <Navigate to="/home" replace />;
}

// Route guard untuk halaman SetUpPin
function SetUpPinRoute({ children }) {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!user) {
        setAllowed(false);
        setChecking(false);
        return;
      }
      const has = await hasPin();
      setAllowed(!has);
      setChecking(false);
    };
    check();
  }, [user]);

  if (loading || checking) return <div style={{textAlign:'center',marginTop:'2rem'}}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowed) return <Navigate to="/profil" replace />;
  return children;
}

function App() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{textAlign:'center',marginTop:'2rem'}}>Loading...</div>;
  return (
    <Routes>
      {/* Home: Guest vs Member */}
      <Route path="/" element={user ? <HomeMember /> : <HomeGuest />} />
      <Route path="/home" element={user ? <HomeMember /> : <HomeGuest />} />

      {/* Public: List Arena, Detail Arena */}
      <Route path="/arena" element={<Arena />} />
      <Route path="/arena/:id" element={<DetailArena />} />

      {/* Public: Login/Register */}
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/verification" element={<PublicRoute><Verification /></PublicRoute>} />
      <Route path="/new-password" element={<PublicRoute><NewPassword /></PublicRoute>} />

      {/* Private: Booking, Transaksi, Pembayaran, dsb */}
      <Route path="/lapangan-booking/:id" element={<PrivateRoute><LapanganBooking /></PrivateRoute>} />
      <Route path="/payment-detail/:id" element={<PrivateRoute><PaymentDetail /></PrivateRoute>} />
      <Route path="/payment-confirmation" element={<PrivateRoute><PaymentConfirmation /></PrivateRoute>} />
      <Route path="/pembayaran-sukses" element={<PrivateRoute><PaymentSuccess /></PrivateRoute>} />
      <Route path="/pemesanan" element={<PrivateRoute><ListPemesanan /></PrivateRoute>} />
      <Route path="/list-pemesanan" element={<PrivateRoute><ListPemesanan /></PrivateRoute>} />
      <Route path="/transaksi" element={<PrivateRoute><Transactions /></PrivateRoute>} />
      <Route path="/transaksi/success/:id" element={<PrivateRoute><DetailTransaction /></PrivateRoute>} />
      <Route path="/transaksi/failed/:id" element={<PrivateRoute><DetailTransactionFailed /></PrivateRoute>} />
      <Route path="/invoice/:id" element={<PrivateRoute><Invoice /></PrivateRoute>} />
      <Route path="/invoice-failed/:id" element={<PrivateRoute><InvoiceFailed /></PrivateRoute>} />
      <Route path="/debug/transactions" element={<PrivateRoute><DebugTransactions /></PrivateRoute>} />

      {/* Private: Profile */}
      <Route path="/profil1" element={<PrivateRoute><Profil1 /></PrivateRoute>} />
      <Route path="/edit-profil1" element={<PrivateRoute><EditProfil1 /></PrivateRoute>} />
      <Route path="/edit-profil" element={<PrivateRoute><EditProfil1 /></PrivateRoute>} />
      <Route path="/voucher1" element={<PrivateRoute><Voucher1 /></PrivateRoute>} />
      <Route path="/voucher2" element={<PrivateRoute><Voucher2 /></PrivateRoute>} />
      <Route path="/voucher-sk" element={<PrivateRoute><Voucher_SK /></PrivateRoute>} />
      <Route path="/voucher-cp" element={<PrivateRoute><Voucher_CP /></PrivateRoute>} />
      <Route path="/voucher-info" element={<PrivateRoute><Voucher_Info /></PrivateRoute>} />
      <Route path="/voucher" element={<PrivateRoute><Voucher1 /></PrivateRoute>} />
      <Route path="/pemberitahuan1" element={<PrivateRoute><Pemberitahuan1 /></PrivateRoute>} />
      <Route path="/pemberitahuan" element={<PrivateRoute><Pemberitahuan /></PrivateRoute>} />
      <Route path="/hapus-akun" element={<PrivateRoute><HapusAkun1 /></PrivateRoute>} /> 
      <Route path="/ubah-pin1" element={<PrivateRoute><UbahPin1 /></PrivateRoute>} />
      <Route path="/ubah-pin" element={<PrivateRoute><UbahPin1 /></PrivateRoute>} />
      <Route path="/kebijakan-privasi1" element={<PrivateRoute><KebijakanPrivasi1 /></PrivateRoute>} />
      <Route path="/kebijakan-privasi" element={<PrivateRoute><KebijakanPrivasi1 /></PrivateRoute>} />
      <Route path="/faq1" element={<PrivateRoute><FAQ1 /></PrivateRoute>} />
      <Route path="/faq" element={<PrivateRoute><FAQ1 /></PrivateRoute>} />
      <Route path="/profil" element={<PrivateRoute><Profil1 /></PrivateRoute>} />
      <Route path="/set-up-pin" element={<SetUpPinRoute><SetUpPin /></SetUpPinRoute>} />
      <Route path="/voucher/:id" element={<PrivateRoute><Voucher2 /></PrivateRoute>} />
      <Route path="/lokasi" element={<LocationSelector />} />
      <Route path="/profile/create-pin" element={<SetUpPin />} />
    </Routes>
  );
}

export default App;
