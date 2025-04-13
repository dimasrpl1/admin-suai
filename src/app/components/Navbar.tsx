/* eslint-disable jsx-a11y/alt-text */
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { LogOut, Menu, X, Image, Newspaper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type NavbarProps = {
  isMobile: boolean;
}

export default function Navbar({ isMobile }: NavbarProps) {
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  
  const handleLogout = async () => {
    if (!confirmLogout) {
      setConfirmLogout(true);
      return;
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert('Gagal logout: ' + error.message);
    } else {
      router.push('/');
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const navigateTo = (path: string) => {
    router.push(path);
    setMenuOpen(false);
  };

  return (
    <>
      <div className="w-full bg-white shadow-sm px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* KIRI - Judul */}
          <h1 className="text-xl font-semibold text-gray-800">Kelola Berita dan Galeri</h1>

          {/* KANAN - Semua tombol */}
          <div className="flex items-center space-x-3">
            {isMobile && (
              <button 
                onClick={toggleMenu} 
                className="p-1 rounded-md hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}

            {!isMobile && (
              <>
                <Link 
                  href="/admin" 
                  className="px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center text-gray-700"
                >
                  <Newspaper size={18} className="mr-2" />
                  <span>Berita</span>
                </Link>
                <Link 
                  href="/admin/galeri" 
                  className="px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center text-gray-700"
                >
                  <Image size={18} className="mr-2" />
                  <span>Galeri</span>
                </Link>
              </>
            )}

            {confirmLogout ? (
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className={`bg-red-500 hover:bg-red-600 text-white ${isMobile ? 'p-2 rounded-full' : 'px-4 py-2 rounded-lg'} flex items-center shadow-sm transition-colors`}
                >
                  <LogOut size={isMobile ? 20 : 18} />
                  {!isMobile && <span className="ml-2">Konfirmasi Logout</span>}
                </motion.button>
                {!isMobile && (
                  <button 
                    onClick={() => setConfirmLogout(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Batal
                  </button>
                )}
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className={`${isMobile ? 'bg-gray-100 p-2 rounded-full' : 'bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg'} text-gray-700 flex items-center space-x-2 shadow-sm transition-colors`}
              >
                <LogOut size={isMobile ? 20 : 18} />
                {!isMobile && <span className="ml-2">Logout</span>}
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobile && menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-t border-b shadow-md overflow-hidden"
          >
            <div className="px-4 py-2">
              <button 
                onClick={() => navigateTo('/admin')}
                className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-100 flex items-center text-gray-700"
              >
                <Newspaper size={18} className="mr-3" />
                <span>Berita</span>
              </button>
              <button 
                onClick={() => navigateTo('/admin/galeri')}
                className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-100 flex items-center text-gray-700"
              >
                <Image size={18} className="mr-3" />
                <span>Galeri</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
