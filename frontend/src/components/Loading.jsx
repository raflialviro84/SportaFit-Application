import React from 'react';
import { FaSpinner } from 'react-icons/fa';

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <FaSpinner 
      className={`animate-spin ${sizeClasses[size]} ${className}`} 
    />
  );
};

// Full Page Loading
export const PageLoading = ({ message = 'Memuat...' }) => {
  return (
    <div className="flex flex-col justify-center items-center h-64 space-y-4">
      <LoadingSpinner size="xl" className="text-sporta-blue" />
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );
};

// Button Loading State
export const ButtonLoading = ({ children, loading = false, ...props }) => {
  return (
    <button {...props} disabled={loading || props.disabled}>
      <div className="flex items-center justify-center gap-2">
        {loading && <LoadingSpinner size="sm" />}
        {children}
      </div>
    </button>
  );
};

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 5 }) => {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded"></div>
        </td>
      ))}
    </tr>
  );
};

// Card Skeleton
export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

// Form Field Skeleton
export const FormFieldSkeleton = () => {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  );
};

export default {
  LoadingSpinner,
  PageLoading,
  ButtonLoading,
  TableRowSkeleton,
  CardSkeleton,
  FormFieldSkeleton
};