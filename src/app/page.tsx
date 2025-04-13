'use client';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Lock, Mail, LogIn } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMsg('');
    
    // Basic validation
    if (!email || !password) {
      setErrorMsg('Email dan password wajib diisi!');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg('Login gagal. Periksa kembali email dan password Anda.');
    } else {
      setErrorMsg('');
      router.push('/admin');
    }
    setLoading(false);
  };

  const handleKeyPress = (e: { key: string; }) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-stretch">
      {/* Left panel - decorative on larger screens, hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-700 opacity-20">
          {/* Background pattern - dots grid */}
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 2px, transparent 2px)', 
            backgroundSize: '30px 30px' 
          }}></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-xl opacity-90">Selamat datang kembali! Silahkan login untuk melanjutkan.</p>
        </div>
        
        <div className="relative z-10 space-y-6">
        <div className="bg-blue-500 bg-opacity-30 p-6 rounded-lg backdrop-blur-sm">
  <p className="text-lg">
    Akses panel admin untuk mengelola berita dan galeri.
    <br />
    Kunjungi website publik di{" "}
    <a
      href="https://subang-autocomp-profile.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-700 underline hover:text-blue-900 transition-colors"
    >
      subang-autocomp-profile.vercel.app
    </a>
  </p>
</div>

          
          <p className="text-sm opacity-80">© 2025 Admin Dashboard System</p>
        </div>
      </div>
      
      {/* Right panel - login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
                <Lock size={28} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Login Admin</h2>
              <p className="text-gray-500 mt-1">Masukkan kredensial Anda</p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
                {errorMsg}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    className="w-full text-black pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full text-black pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                </div>
              </div>
              
              <button
                onClick={handleLogin}
                disabled={loading}
                className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center transition-all ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:from-blue-700 hover:to-blue-800'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Login <LogIn size={18} className="ml-2" />
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile only info box */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100 md:hidden">
            <p className="text-blue-700 text-sm">Akses panel admin untuk mengelola berita dan galeri.</p>
            <a
      href="https://subang-autocomp-profile.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-700 underline hover:text-blue-900 transition-colors"
    >
      subang-autocomp-profile.vercel.app
    </a>
          </div>
        </div>
      </div>
    </main>
  );
}