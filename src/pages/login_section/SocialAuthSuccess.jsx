import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function SocialAuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Ambil token dari query string
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      // Fetch user profile with credentials: 'include'
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          // Optionally: set user in context if available
          // Redirect ke halaman home
          navigate('/home');
        })
        .catch(err => {
          console.error('Error fetching user data:', err);
          navigate('/home'); // Redirect meskipun ada error
        });
    } else {
      // Jika tidak ada token, redirect ke halaman login
      navigate('/login');
    }
  }, [location, navigate]);
  
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#F9FAFB]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-sporta-blue mb-4">Login Berhasil</h2>
        <p className="text-gray-600 mb-8">Anda akan dialihkan dalam beberapa saat...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sporta-blue mx-auto"></div>
      </div>
    </div>
  );
}

export default SocialAuthSuccess;
