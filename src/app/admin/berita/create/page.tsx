/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

export default function CreateBeritaPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [gambar, setGambar] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.03, transition: { duration: 0.2 } },
    tap: { scale: 0.97, transition: { duration: 0.2 } }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGambar(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setGambar(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
    }
  };

  const handleRemoveImage = () => {
    setGambar(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (!judul || !isi || !gambar) {
        throw new Error('Judul, isi, dan gambar berita harus diisi.');
      }

      // Upload gambar ke Supabase Storage
      const fileExt = gambar.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`; // Simpan nama file saja

      const { error: uploadError } = await supabase.storage
        .from('berita-images')
        .upload(filePath, gambar);

      if (uploadError) {
        throw new Error(`Gagal upload gambar: ${uploadError.message}`);
      }

      // Simpan data ke tabel 'berita' dengan hanya menyimpan path gambar
      const { error: insertError } = await supabase.from('berita').insert([
        {
          judul,
          isi,
          gambar: filePath, // Hanya path/nama file
        },
      ]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      setSuccessMsg('✅ Berita berhasil ditambahkan!');
      setJudul('');
      setIsi('');
      setGambar(null);
      setPreviewImage(null);
      setTimeout(() => {
        router.push('/admin');
      }, 1200);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Show confirmation dialog if form has data
    if (judul || isi || gambar) {
      if (confirm('Apakah Anda yakin ingin membatalkan? Data yang telah diisi akan hilang.')) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6">
      <motion.div 
        className="w-full max-w-4xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Card Container */}
        <motion.div 
          className="bg-white shadow-xl rounded-3xl overflow-hidden"
          variants={itemVariants}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 py-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center">Tambah Berita</h1>
          </div>

          {/* Content */}
          <div className="p-5 md:p-8">
            {!showPreview && (
              <motion.p 
                variants={itemVariants}
                className="text-center text-gray-500 mb-6"
              >
                Tulis berita terbaru dan unggah gambar untuk ditampilkan.
              </motion.p>
            )}

            {/* Alerts */}
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 text-red-600 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg"
              >
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                  </svg>
                  <p>{errorMsg}</p>
                </div>
              </motion.div>
            )}

            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 text-green-600 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg"
              >
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <p>{successMsg}</p>
                </div>
              </motion.div>
            )}

            {/* Preview Mode */}
            {showPreview ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-md">
                  {previewImage && (
                     
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="w-full h-64 object-cover object-center"
                    />
                  )}
                  <div className="p-6">
                    <h2 className="text-2xl text-black font-bold mb-4">{judul || 'Judul Berita'}</h2>
                    <div className="prose max-w-none">
                      {isi ? (
                        isi.split('\n').map((paragraph, idx) => (
                          <p key={idx} className="mb-4 text-black">{paragraph}</p>
                        ))
                      ) : (
                        <p className="text-gray-400 italic">Isi berita belum diisi...</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-center mt-4">
                  <motion.button
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={togglePreview}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-all flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    Kembali ke Mode Edit
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Judul</label>
                  <input
                    type="text"
                    placeholder="Masukkan judul berita"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    className="w-full text-black border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Isi</label>
                  <textarea
                    placeholder="Tulis isi berita di sini..."
                    value={isi}
                    onChange={(e) => setIsi(e.target.value)}
                    className="w-full text-black border border-gray-300 rounded-xl p-3 h-48 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y"
                    required
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gambar</label>
                  
                  {/* Drag & Drop Area */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewImage ? (
                      <div className="relative">
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="mx-auto max-h-80 rounded-lg object-contain"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage();
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-blue-600">Klik untuk upload</span> atau drag & drop
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF hingga 10MB
                        </p>
                      </div>
                    )}
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      required={!gambar}
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row pt-2 gap-4">
                  <motion.button
                    type="button"
                    onClick={togglePreview}
                    disabled={!judul && !isi && !previewImage}
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    className={`w-full sm:w-auto order-3 sm:order-1 px-6 py-3 
                      ${(!judul && !isi && !previewImage) 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} 
                      font-medium rounded-xl transition-all flex items-center justify-center`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    Preview
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={handleCancel}
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full sm:w-auto order-2 px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl transition-all flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Batal
                  </motion.button>
                  
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full sm:flex-1 order-1 sm:order-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl transition-all flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Simpan Berita
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </form>
            )}
          </div>
        </motion.div>

       
      </motion.div>
    </div>
  );
}