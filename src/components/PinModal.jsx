import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import PropTypes from 'prop-types'; // Import PropTypes

const PinModal = ({ isOpen, onClose, onSubmit, title = "Masukkan PIN Anda", isNewPin = false, externalError = '', isProcessing = false }) => {
  console.log('[DEBUG] PinModal component rendered. Props:', { isOpen, title, isNewPin, externalError, isProcessing });
  const [pin, setPin] = useState(Array(6).fill(''));
  const [error, setError] = useState('');
  const inputRefs = useRef([]); // Initialize useRef

  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  useEffect(() => {
    if (isOpen) {
      console.log('[DEBUG] PinModal: isOpen is true, focusing first input.');
      inputRefs.current[0]?.focus();
      setPin(Array(6).fill('')); // Clear PIN on open
      setError(''); // Clear error on open
    }
  }, [isOpen]); // Dependency on isOpen

  const handleChange = (e, index) => {
    const { value } = e.target;
    if (/^[0-9]$/.test(value) || value === '') {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);
      setError(''); // Clear error on change

      // Fokus ke input berikutnya jika value diisi dan bukan input terakhir
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      e.preventDefault(); // Mencegah perilaku default backspace (navigasi)
      const newPin = [...pin];
      if (newPin[index]) {
        newPin[index] = '';
        setPin(newPin);
        // Fokus ke input sebelumnya jika bukan input pertama
        if (index > 0) {
          // inputRefs.current[index - 1].focus(); // Dihapus agar tidak otomatis pindah saat menghapus
        }
      } else if (index > 0) {
        // Jika input saat ini kosong dan ada input sebelumnya, pindah fokus dan hapus input sebelumnya
        inputRefs.current[index - 1].focus();
        newPin[index - 1] = '';
        setPin(newPin);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    console.log('[DEBUG] PinModal handleSubmit called. PIN:', pin.join(''));
    const pinString = pin.join('');
    if (pinString.length !== 6) {
      setError("PIN harus 6 digit.");
      return;
    }
    setError('');
    onSubmit(pinString);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    if (pasteData.length === 6) {
      setPin(pasteData.split(''));
      inputRefs.current[5]?.focus(); // Fokus ke input terakhir setelah paste
      setError('');
    } else {
      setError('PIN yang dinputkan harus 6 digit angka.');
    }
  };

  if (!isOpen) {
    console.log('[DEBUG] PinModal: isOpen is false, returning null.');
    return null;
  }

  console.log('[DEBUG] PinModal: About to return JSX. PIN state:', pin, 'Error state:', error);
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50" onClick={onClose}> {/* Close on overlay click */}
      <div className="p-6 bg-white rounded-lg shadow-xl w-full max-w-md mx-auto" onClick={(e) => e.stopPropagation()}> {/* Prevent close on modal content click */}
        <h2 className="text-xl font-semibold text-center mb-2">{title}</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          {isNewPin ? "Buat 6 digit PIN untuk keamanan akun Anda." : "Masukkan 6 digit PIN untuk konfirmasi pembayaran"}
        </p>
        <form onSubmit={handleSubmit}> {/* Form element added */}
          <div className="flex justify-center space-x-2 mb-4" onPaste={handlePaste}> {/* Added onPaste here */}
            {pin.map((digit, index) => (
              <input
                key={index}
                type="password" // Changed to password for masking
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputRefs.current[index] = el)}
                maxLength="1"
                className="w-12 h-14 text-center text-2xl border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isProcessing}
                autoComplete="one-time-code" // Added for better UX with password managers
              />
            ))}
          </div>
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          {externalError && <p className="text-red-500 text-sm text-center mb-4">{externalError}</p>}
          <div className="flex justify-around mt-6">
            <button
              type="button"
              onClick={() => {
                console.log('[DEBUG] PinModal Batal clicked');
                onClose();
              }}
              className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isProcessing}
            >
              Batal
            </button>
            <button
              type="submit"
              className="py-2 px-6 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
              disabled={isProcessing || pin.join('').length !== 6}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                title.includes("Konfirmasi PIN Baru") ? "Konfirmasi PIN" : "Memproses" // Adjusted button text logic
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

PinModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
  isNewPin: PropTypes.bool,
  externalError: PropTypes.string,
  isProcessing: PropTypes.bool,
};

export default PinModal;
