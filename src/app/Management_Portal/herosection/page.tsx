/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  charcoal: '#111111',
  teal: '#14B8A6'
};

interface HeroImage {
  id?: string;
  image_url: string;
  image_type: 'desktop' | 'mobile';
  display_order: number;
}

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cta_text: string;
  cta_link: string;
  slide_order: number;
  is_active: boolean;
  desktop_images: HeroImage[];
  mobile_images: HeroImage[];
}

export default function HeroSectionPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeImageType, setActiveImageType] = useState<'desktop' | 'mobile'>('desktop');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    cta_text: '',
    cta_link: '',
    slide_order: 0,
    is_active: true
  });
  const [desktopImages, setDesktopImages] = useState<string[]>([]);
  const [mobileImages, setMobileImages] = useState<string[]>([]);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/management/hero-slides');
      const data = await response.json();
      if (data.success) {
        setSlides(data.data);
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'hero-slides');

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/management/upload');
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          setUploadProgress(prev => ({ ...prev, [file.name]: percent }));
        }
      };
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
          resolve(data.url);
        } else {
          reject(new Error('Upload failed'));
        }
      };
      
      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.send(formData);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const imageUrl = await uploadImage(file);
        if (imageUrl) {
          if (activeImageType === 'desktop') {
            setDesktopImages(prev => [...prev, imageUrl]);
          } else {
            setMobileImages(prev => [...prev, imageUrl]);
          }
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
    setUploading(false);
  };

  const removeImage = (index: number, type: 'desktop' | 'mobile') => {
    if (type === 'desktop') {
      setDesktopImages(desktopImages.filter((_, i) => i !== index));
    } else {
      setMobileImages(mobileImages.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const slideData = {
      ...(editingSlide && { id: editingSlide.id }),
      title: formData.title,
      subtitle: formData.subtitle,
      description: formData.description,
      cta_text: formData.cta_text,
      cta_link: formData.cta_link,
      slide_order: formData.slide_order,
      is_active: formData.is_active,
      desktop_images: desktopImages,
      mobile_images: mobileImages
    };

    try {
      const response = await fetch('/api/management/hero-slides', {
        method: editingSlide ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slideData),
      });
      
      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchSlides();
      } else {
        const error = await response.json();
        console.error('Error:', error);
      }
    } catch (error) {
      console.error('Error saving slide:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      description: slide.description,
      cta_text: slide.cta_text,
      cta_link: slide.cta_link,
      slide_order: slide.slide_order,
      is_active: slide.is_active
    });
    setDesktopImages(slide.desktop_images.map(img => img.image_url));
    setMobileImages(slide.mobile_images.map(img => img.image_url));
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this slide?')) {
      try {
        await fetch(`/api/management/hero-slides/${id}`, { method: 'DELETE' });
        fetchSlides();
      } catch (error) {
        console.error('Error deleting slide:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingSlide(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      cta_text: '',
      cta_link: '',
      slide_order: 0,
      is_active: true
    });
    setDesktopImages([]);
    setMobileImages([]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 cursor-wait" style={{ borderColor: BRAND_COLORS.deepRed }}></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
            Hero Section Manager
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage homepage hero slides</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 rounded-lg text-white font-semibold transition-all hover:opacity-90 flex items-center gap-2 cursor-pointer"
          style={{ backgroundColor: BRAND_COLORS.deepRed }}
        >
          + Add New Slide
        </button>
      </div>

      {/* Slides Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {slides.map((slide) => (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300"
            >
              {/* Image Preview */}
              <div className="relative h-48 bg-gray-100">
                {slide.desktop_images[0] && (
                  <Image
                    src={slide.desktop_images[0].image_url}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${slide.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {slide.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-lg line-clamp-1" style={{ color: BRAND_COLORS.darkNavy }}>
                  {slide.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2 mt-1">{slide.subtitle}</p>
                <p className="text-gray-600 text-sm line-clamp-2 mt-2">{slide.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    🖼️ {slide.desktop_images.length} desktop
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    📱 {slide.mobile_images.length} mobile
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-3 border-t">
                  <button
                    onClick={() => handleEdit(slide)}
                    className="flex-1 px-3 py-1.5 rounded-lg text-white text-sm transition-all hover:opacity-80 cursor-pointer"
                    style={{ backgroundColor: BRAND_COLORS.teal }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="flex-1 px-3 py-1.5 rounded-lg text-white text-sm transition-all hover:opacity-80 cursor-pointer"
                    style={{ backgroundColor: BRAND_COLORS.deepRed }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {slides.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white rounded-xl">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-lg font-medium text-gray-600">No slides yet</h3>
          <p className="text-gray-400 mt-1">Click "Add New Slide" to create your first hero slide</p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                  {editingSlide ? 'Edit Slide' : 'Add New Slide'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    style={{ borderColor: BRAND_COLORS.softGrey }}
                    required
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-medium mb-1">Subtitle *</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    style={{ borderColor: BRAND_COLORS.softGrey }}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    style={{ borderColor: BRAND_COLORS.softGrey }}
                    required
                  />
                </div>

                {/* CTA Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">CTA Text *</label>
                    <input
                      type="text"
                      value={formData.cta_text}
                      onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                      style={{ borderColor: BRAND_COLORS.softGrey }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CTA Link *</label>
                    <input
                      type="text"
                      value={formData.cta_link}
                      onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                      style={{ borderColor: BRAND_COLORS.softGrey }}
                      required
                    />
                  </div>
                </div>

                {/* Desktop Images */}
                <div>
                  <label className="block text-sm font-medium mb-2">Desktop Images</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {desktopImages.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 group">
                        <Image src={img} alt={`desktop-${idx}`} fill className="object-cover" unoptimized />
                        <button
                          type="button"
                          onClick={() => removeImage(idx, 'desktop')}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                        onClick={(e) => {
                          setActiveImageType('desktop');
                          (e.target as HTMLInputElement).value = '';
                        }}
                      />
                      <span className="text-2xl">+</span>
                      <span className="text-xs text-gray-500">Add</span>
                    </label>
                  </div>
                  
                  {/* Upload Progress */}
                  {uploading && Object.keys(uploadProgress).length > 0 && (
                    <div className="mt-2 space-y-1">
                      {Object.entries(uploadProgress).map(([fileName, progress]) => (
                        <div key={fileName} className="text-xs text-gray-500">
                          <span>{fileName.slice(0, 20)}: </span>
                          <span>{Math.round(progress)}%</span>
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div 
                              className="h-1 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%`, backgroundColor: BRAND_COLORS.deepRed }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Recommended size: 1920x1080px</p>
                </div>

                {/* Mobile Images */}
                <div>
                  <label className="block text-sm font-medium mb-2">Mobile Images</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {mobileImages.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-20 rounded-lg overflow-hidden border-2 border-gray-200 group">
                        <Image src={img} alt={`mobile-${idx}`} fill className="object-cover" unoptimized />
                        <button
                          type="button"
                          onClick={() => removeImage(idx, 'mobile')}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <label className="w-16 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                        onClick={(e) => {
                          setActiveImageType('mobile');
                          (e.target as HTMLInputElement).value = '';
                        }}
                      />
                      <span className="text-2xl">+</span>
                      <span className="text-xs text-gray-500">Add</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Recommended size: 750x1334px</p>
                </div>

                {/* Order and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Slide Order</label>
                    <input
                      type="number"
                      value={formData.slide_order}
                      onChange={(e) => setFormData({ ...formData, slide_order: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      style={{ borderColor: BRAND_COLORS.softGrey }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={formData.is_active ? 'active' : 'inactive'}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                      style={{ borderColor: BRAND_COLORS.softGrey }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 rounded-lg text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    style={{ backgroundColor: BRAND_COLORS.deepRed }}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {editingSlide ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : (
                      editingSlide ? 'Update Slide' : 'Create Slide'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}