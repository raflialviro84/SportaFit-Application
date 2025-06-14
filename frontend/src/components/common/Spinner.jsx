import React from 'react';

const Spinner = ({ size = 'md', color = 'blue' }) => {
  // Determine size class
  const sizeClass = {
    'sm': 'h-4 w-4',
    'md': 'h-8 w-8',
    'lg': 'h-12 w-12',
    'xl': 'h-16 w-16'
  }[size] || 'h-8 w-8';

  // Determine color class
  const colorClass = {
    'blue': 'border-blue-500',
    'red': 'border-red-500',
    'green': 'border-green-500',
    'yellow': 'border-yellow-500',
    'purple': 'border-purple-500',
    'gray': 'border-gray-500',
    'white': 'border-white'
  }[color] || 'border-blue-500';

  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClass} border-4 ${colorClass} border-t-transparent rounded-full animate-spin`}></div>
    </div>
  );
};

export default Spinner;