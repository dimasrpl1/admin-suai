// components/Navbar.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { LogOut, Newspaper, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type NavbarProps = {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if the screen is mobile
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener for resize
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
      {/* Desktop Navigation - Sidebar */}
      {!isMobile && (
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 240, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="bg-gradient-to-b from-blue-700 to-blue-900 text-white flex flex-col shadow-lg z-10 h-screen fixed left-0"
        >
          <div className="p-5 border-b border-blue-600">
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold"
            >
              Admin Panel
            </motion.h1>
          </div>

          <div className="flex-1 overflow-y-auto pt-2">
            <motion.div 
              className="py-3 px-4 flex items-center cursor-pointer bg-blue-800 hover:bg-blue-700 transition-colors"
              whileHover={{ x: 5 }}
            >
              <Newspaper size={20} className="mr-3" />
              <span>Kelola Berita</span>
            </motion.div>
          </div>

          <div className="p-4 border-t border-blue-600">
            <button
              onClick={handleLogout}
              className="flex items-center text-red-200 hover:text-white transition-colors"
            >
              <LogOut size={20} className="mr-2" />
              <span>Logout</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Mobile Navigation - Top Bar Only */}
      {isMobile && (
        <header className="sticky top-0 z-20 bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-md w-full">
          <div className="flex items-center justify-between p-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 rounded-md hover:bg-blue-600"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold">{title}</h1>
            <div className="w-6"></div> {/* Empty div for balanced spacing */}
          </div>
        </header>
      )}

      {/* Mobile Navigation - Slide-out Menu */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-30"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Slide-out menu */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 w-64 h-full bg-blue-800 z-40 shadow-lg"
            >
              <div className="p-5 border-b border-blue-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Admin Panel</h2>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white p-1 rounded-full hover:bg-blue-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <nav className="p-4">
                <motion.div 
                  className="py-3 px-2 flex items-center cursor-pointer bg-blue-700 text-white rounded-md my-2"
                  whileHover={{ x: 5 }}
                >
                  <Newspaper size={20} className="mr-3" />
                  <span>Kelola Berita</span>
                </motion.div>
              </nav>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700">
                <button
                  onClick={handleLogout}
                  className="flex items-center text-red-200 hover:text-white transition-colors w-full py-3"
                >
                  <LogOut size={20} className="mr-2" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}