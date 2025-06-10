import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { LocationProvider } from './context/LocationContext'
import { PaymentProvider } from './context/PaymentContext'
import { AuthProvider } from './context/AuthContext'
import { VoucherProvider } from './context/VoucherProvider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LocationProvider>
        <PaymentProvider>
          <AuthProvider>
            <VoucherProvider>
              <App />
            </VoucherProvider>
          </AuthProvider>
        </PaymentProvider>
      </LocationProvider>
    </BrowserRouter>
  </React.StrictMode>
)
