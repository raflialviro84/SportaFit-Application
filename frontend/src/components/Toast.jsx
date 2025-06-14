import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ type = 'info', message, isVisible, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-xl" />;
      case 'error':
        return <FaExclamationTriangle className="text-xl" />;
      case 'warning':
        return <FaExclamationTriangle className="text-xl" />;
      default:
        return <FaInfoCircle className="text-xl" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideIn">
      <div className={`${getToastStyles()} px-6 py-4 rounded-lg shadow-lg max-w-sm flex items-center gap-3`}>
        {getIcon()}
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default Toast;