'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Search, PlusCircle, Edit2, Trash2, AlertTriangle, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

type Berita = {
  id: number;
  judul: string;
  isi: string;
  gambar: string;
  created_at: string;
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [beritaList, setBeritaList] = useState<Berita[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/');
      } else {
        await fetchBerita();
        setLoading(false);
      }
    };
    
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkSession();
    checkScreenSize();
    
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [router]);

  const fetchBerita = async () => {
    const { data, error } = await supabase
      .from('berita')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gagal mengambil data berita:', error.message);
    } else {
      setBeritaList(data);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    
    setConfirmDelete(null);
    const beritaToDelete = beritaList.find((item) => item.id === id);
    if (!beritaToDelete) return;

    const filePath = beritaToDelete.gambar;

    const { error: storageError } = await supabase.storage
      .from('berita-images')
      .remove([filePath]);

    if (storageError) {
      alert('Gagal menghapus gambar: ' + storageError.message);
      return;
    }

    const { error: dbError } = await supabase.from('berita').delete().eq('id', id);

    if (dbError) {
      alert('Gagal menghapus berita: ' + dbError.message);
    } else {
      setBeritaList((prev) => prev.filter((item) => item.id !== id));
    }
  };
  
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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric', 
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  const filteredBerita = beritaList.filter((berita) =>
    berita.judul.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Navbar Component */}
      

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'w-full' : ''}`}>
        {/* Header - Only show on desktop, mobile uses the navbar */}
        {!isMobile && (
          <header className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-6 py-4">
              <h1 className="text-xl font-semibold text-gray-800">Kelola Berita</h1>
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/admin/berita/create')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-sm transition-colors"
                >
                  <PlusCircle size={18} />
                  <span className="ml-2">Tambah Berita</span>
                </motion.button>
                
                {confirmLogout ? (
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
                    >
                      <LogOut size={18} />
                      <span className="ml-2">Konfirmasi Logout</span>
                    </motion.button>
                    <button 
                      onClick={() => setConfirmLogout(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 shadow-sm transition-colors"
                  >
                    <LogOut size={18} />
                    <span className="ml-2">Logout</span>
                  </motion.button>
                )}
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="px-6 pb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari judul berita..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-10 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                />
                {searchTerm && (
                  <button 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                    onClick={() => setSearchTerm('')}
                  >
                    <span className="text-gray-400 hover:text-gray-600">✕</span>
                  </button>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Mobile header with search, add button, and logout button */}
        {isMobile && (
          <div className="bg-white shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari judul berita..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-10 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />
                {searchTerm && (
                  <button 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                    onClick={() => setSearchTerm('')}
                  >
                    <span className="text-gray-400 hover:text-gray-600">✕</span>
                  </button>
                )}
              </div>
              <div className="flex space-x-2 ml-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/admin/berita/create')}
                  className="bg-green-600 p-2 rounded-full text-white shadow-sm"
                >
                  <PlusCircle size={20} />
                </motion.button>
                
                {confirmLogout ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="bg-red-500 p-2 rounded-full text-white shadow-sm"
                    title="Konfirmasi Logout"
                  >
                    <LogOut size={20} />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="bg-gray-100 p-2 rounded-full text-gray-700 shadow-sm"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {filteredBerita.length > 0 ? (
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredBerita.map((berita, index) => {
                const publicUrl = supabase.storage
                  .from('berita-images')
                  .getPublicUrl(berita.gambar).data.publicUrl;

                return (
                  <motion.div
                    key={berita.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-40 md:h-48 overflow-hidden">
                      {publicUrl ? (
                        <img
                          src={publicUrl}
                          alt={berita.judul}
                          className="h-full w-full object-cover transition-transform hover:scale-105 duration-500"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500">
                          Tidak ada gambar
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent py-2 px-4">
                        <p className="text-xs text-white">{formatDate(berita.created_at)}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 h-14">
                        {berita.judul}
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-3 h-18">{berita.isi}</p>
                      <div className="flex justify-between items-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => router.push(`/admin/berita/edit/${berita.id}`)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={16} />
                          <span className="ml-1">Edit</span>
                        </motion.button>
                        {confirmDelete === berita.id ? (
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(berita.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded-md text-sm flex items-center"
                            >
                              <AlertTriangle size={14} className="mr-1" />
                              Konfirmasi
                            </motion.button>
                            <button 
                              onClick={() => setConfirmDelete(null)}
                              className="text-gray-500 text-sm hover:text-gray-700"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(berita.id)}
                            className="flex items-center space-x-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                            <span className="ml-1">Hapus</span>
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64 text-gray-500"
            >
              <Search size={48} className="text-gray-300 mb-4" />
              <p className="text-lg">Tidak ada berita yang ditemukan</p>
              {searchTerm && (
                <p className="text-sm mt-2">
                  Coba ubah kata kunci pencarian atau{" "}
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="text-blue-500 hover:underline"
                  >
                    reset pencarian
                  </button>
                </p>
              )}
            </motion.div>
          )}
        </div>
        
        {/* Footer */}
        <footer className="bg-white border-t py-3 px-6">
          <p className="text-sm text-gray-500 text-center">Admin Dashboard © 2025</p>
        </footer>
      </div>
    </div>
  );
}