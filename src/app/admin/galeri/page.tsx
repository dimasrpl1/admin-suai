/* eslint-disable @next/next/no-img-element */
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/app/components/Navbar';
import { Search, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type GaleriItem = {
  id: string;
  judul: string | null;
  gambar: string | null;
  created_at: string;
};

export default function GaleriPage() {
  const [galeri, setGaleri] = useState<GaleriItem[]>([]);
  const [filteredGaleri, setFilteredGaleri] = useState<GaleriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Handle responsive state for Navbar
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchGaleri();
  }, []);

  const fetchGaleri = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('galeri')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching galeri:', error.message);
    } else {
      setGaleri(data);
      setFilteredGaleri(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredGaleri(galeri);
    } else {
      const filtered = galeri.filter((item) =>
        item.judul?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGaleri(filtered);
    }
  }, [searchQuery, galeri]);

  const getImageUrl = (path: string) => {
    const { data } = supabase.storage.from('galeri-images').getPublicUrl(path);
    return data?.publicUrl || '';
  };

  const handleDelete = async (item: GaleriItem) => {
    const confirmed = confirm(`Yakin ingin menghapus galeri "${item.judul}"?`);
    if (!confirmed) return;

    // Delete image from storage
    if (item.gambar) {
      const { error: deleteImageError } = await supabase.storage
        .from('galeri-images')
        .remove([item.gambar]);
      if (deleteImageError) {
        console.error('Gagal hapus gambar:', deleteImageError.message);
      }
    }

    // Delete from table
    const { error: deleteError } = await supabase
      .from('galeri')
      .delete()
      .eq('id', item.id);

    if (deleteError) {
      console.error('Gagal hapus galeri:', deleteError.message);
    } else {
      // Refresh data
      fetchGaleri();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isMobile={isMobile} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pt-8">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan judul..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <a
            href="/admin/galeri/create"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-md text-center md:text-left whitespace-nowrap"
          >
            + Tambah Galeri
          </a>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredGaleri.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            {searchQuery ? (
              <p className="text-gray-500">
                Tidak ada gambar yang sesuai dengan pencarian &quot;{searchQuery}&quot;
              </p>
            ) : (
              <p className="text-gray-500">Belum ada gambar di galeri.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGaleri.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition group"
              >
                <div className="relative overflow-hidden w-full h-56">
                  {item.gambar ? (
                    <img
                      src={getImageUrl(item.gambar)}
                      alt={item.judul || 'Gambar galeri'}
                      loading="lazy"
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    {item.judul || 'Tanpa Judul'}
                  </h2>
                  <p className="text-sm text-gray-500 mb-3">
                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push(`/admin/galeri/edit/${item.id}`)}
                      className="flex items-center gap-1 text-sm px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-white transition"
                    >
                      <Pencil size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="flex items-center gap-1 text-sm px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white transition"
                    >
                      <Trash2 size={16} /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
