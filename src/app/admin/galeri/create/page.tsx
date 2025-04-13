/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateGaleriPage() {
  const [judul, setJudul] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
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
    if (!file) {
      alert('Silakan pilih gambar terlebih dahulu.');
      return;
    }

    setLoading(true);

    try {
      const filename = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase
        .storage
        .from('galeri-images')
        .upload(filename, file);

      if (uploadError) {
        throw new Error('Gagal upload gambar: ' + uploadError.message);
      }

      const { error: insertError } = await supabase
        .from('galeri')
        .insert([{ judul, gambar: filename }]);

      if (insertError) {
        throw new Error('Gagal simpan ke database: ' + insertError.message);
      }

      router.push('/admin/galeri');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Tambah Gambar Baru</h1>
            <p className="text-blue-100 text-sm mt-1">Unggah gambar baru ke galeri</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Judul Gambar</label>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="w-full text-black border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Masukkan judul gambar"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Gambar</label>
              <div 
                className={`border-2 border-dashed rounded-lg ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} transition-all`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {preview ? (
                  <div className="relative p-2">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="mx-auto max-h-64 rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                      className="absolute top-4 right-4 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div 
                    className="py-8 px-4 flex flex-col items-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="p-3 rounded-full bg-blue-50 mb-3">
                      <ImageIcon className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-gray-700 font-medium text-center">Klik atau drag & drop untuk memilih gambar</p>
                    <p className="text-sm text-gray-500 mt-1">PNG, JPG, JPEG hingga 10MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="hidden"
                  ref={fileInputRef}
                  required={!file}
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
                  disabled={loading}
                  className="py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center sm:flex-1 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      <span>Upload & Simpan</span>
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