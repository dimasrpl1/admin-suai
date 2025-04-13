/* eslint-disable @next/next/no-img-element */
'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditGaleriPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [judul, setJudul] = useState('');
  const [gambar, setGambar] = useState<File | null>(null);
  const [currentGambar, setCurrentGambar] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchGaleri = async () => {
      try {
        const { data, error } = await supabase
          .from('galeri')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching galeri:', error.message);
          return;
        }

        setJudul(data.judul || '');
        setCurrentGambar(data.gambar);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchGaleri();
  }, [id]);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      setGambar(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let gambarPath = currentGambar;

      // Upload new image if provided
      if (gambar) {
        const fileName = `${Date.now()}_${gambar.name}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('galeri-images')
          .upload(filePath, gambar);

        if (uploadError) {
          throw new Error(`Upload error: ${uploadError.message}`);
        }

        gambarPath = filePath;
      }

      // Update galeri data
      const { error: updateError } = await supabase
        .from('galeri')
        .update({ judul, gambar: gambarPath })
        .eq('id', id);

      if (updateError) {
        throw new Error(`Update error: ${updateError.message}`);
      }

      router.push('/admin/galeri');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const getImageUrl = (path: string) => {
    const { data } = supabase.storage.from('galeri-images').getPublicUrl(path);
    return data?.publicUrl || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/admin/galeri" 
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Kembali ke Galeri</span>
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Edit Gambar Galeri</h1>
            <p className="text-indigo-100 text-sm mt-1">Perbarui informasi dan gambar</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Judul Gambar</label>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Masukkan judul gambar"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gambar</label>
              
              {preview ? (
                <div className="mb-4 relative">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full max-h-80 object-contain rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setGambar(null);
                      setPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : currentGambar ? (
                <div className="mb-4 relative">
                  <img
                    src={getImageUrl(currentGambar)}
                    alt="Current"
                    className="w-full max-h-80 object-contain rounded-lg border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white bg-black bg-opacity-50 px-3 py-1 rounded-md text-sm">
                      Gambar saat ini
                    </p>
                  </div>
                </div>
              ) : null}
              
              <div 
                className={`border-2 border-dashed rounded-lg ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'} transition-all`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div 
                  className="py-6 px-4 flex flex-col items-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="p-3 rounded-full bg-indigo-50 mb-3">
                    <ImageIcon className="h-7 w-7 text-indigo-600" />
                  </div>
                  <p className="text-gray-700 font-medium text-center">
                    {preview ? 'Ganti gambar' : 'Klik atau drag & drop untuk mengganti gambar'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG, JPEG hingga 10MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="hidden"
                  ref={fileInputRef}
                />
              </div>
            </div>

            <div className="pt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/admin/galeri"
                  className="py-3 px-4 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors sm:flex-1"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center sm:flex-1 disabled:opacity-70"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}