'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

interface WhyChooseItem {
  id?: string;
  title: string;
  description: string;
  display_order: number;
}

interface AboutData {
  id: string;
  heading: string;
  description: string;
  mission_title: string;
  mission_description: string;
  vision_title: string;
  vision_description: string;
  cta_text: string;
  cta_link: string;
  background_image: string | null;
  why_choose_items: WhyChooseItem[];
}

export default function AboutManager() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    heading: '',
    description: '',
    mission_title: 'Our Mission',
    mission_description: '',
    vision_title: 'Our Vision',
    vision_description: '',
    cta_text: 'Explore Our Courses',
    cta_link: '/courses',
    background_image: ''
  });
  
  const [whyChooseItems, setWhyChooseItems] = useState<WhyChooseItem[]>([
    { title: '', description: '', display_order: 0 }
  ]);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/management/about');
      const data = await response.json();
      if (data.success && data.data) {
        setAboutData(data.data);
        setFormData({
          heading: data.data.heading || '',
          description: data.data.description || '',
          mission_title: data.data.mission_title || 'Our Mission',
          mission_description: data.data.mission_description || '',
          vision_title: data.data.vision_title || 'Our Vision',
          vision_description: data.data.vision_description || '',
          cta_text: data.data.cta_text || 'Explore Our Courses',
          cta_link: data.data.cta_link || '/courses',
          background_image: data.data.background_image || ''
        });
        
        if (data.data.why_choose_items && data.data.why_choose_items.length > 0) {
          setWhyChooseItems(data.data.why_choose_items);
        }
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'about-section');

    try {
      const response = await fetch('/api/management/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, background_image: data.url }));
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const addWhyChooseItem = () => {
    setWhyChooseItems([
      ...whyChooseItems,
      { title: '', description: '', display_order: whyChooseItems.length }
    ]);
  };

  const removeWhyChooseItem = (index: number) => {
    const newItems = whyChooseItems.filter((_, i) => i !== index);
    setWhyChooseItems(newItems.map((item, i) => ({ ...item, display_order: i })));
  };

  const updateWhyChooseItem = (index: number, field: keyof WhyChooseItem, value: string) => {
    const newItems = [...whyChooseItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setWhyChooseItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const submitData = {
      id: aboutData?.id,
      ...formData,
      why_choose_items: whyChooseItems.filter(item => item.title.trim() !== '')
    };

    try {
      const response = await fetch('/api/management/about', {
        method: aboutData?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      
      if (response.ok) {
        fetchAboutData();
        alert('About section saved successfully!');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving about section');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: BRAND_COLORS.deepRed }}></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
          About Section Manager
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage About page content (Mission, Vision, Why Choose)</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Heading */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>Main Heading</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Heading *</label>
            <input
              type="text"
              value={formData.heading}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Background Image (Optional)</label>
            <div className="flex items-center gap-4">
              {formData.background_image && (
                <div className="relative w-32 h-20 rounded-lg overflow-hidden">
                  <img src={formData.background_image} alt="Background" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, background_image: '' })}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              )}
              <label className="px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                {uploading ? 'Uploading...' : formData.background_image ? 'Change Image' : 'Upload Image'}
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-1">Recommended size: 1920x1080px</p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>Mission</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={formData.mission_title}
                onChange={(e) => setFormData({ ...formData, mission_title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                rows={5}
                value={formData.mission_description}
                onChange={(e) => setFormData({ ...formData, mission_description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>Vision</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={formData.vision_title}
                onChange={(e) => setFormData({ ...formData, vision_title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                rows={5}
                value={formData.vision_description}
                onChange={(e) => setFormData({ ...formData, vision_description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Why Choose Items */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>Why Choose Items</h2>
            <button
              type="button"
              onClick={addWhyChooseItem}
              className="px-3 py-1 text-sm rounded-lg text-white cursor-pointer"
              style={{ backgroundColor: BRAND_COLORS.teal }}
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-4">
            {whyChooseItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4 relative"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium">Item {index + 1}</h3>
                  {whyChooseItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWhyChooseItem(index)}
                      className="text-red-500 text-sm cursor-pointer hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateWhyChooseItem(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    rows={3}
                    value={item.description}
                    onChange={(e) => updateWhyChooseItem(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>Call to Action Button</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Button Text *</label>
              <input
                type="text"
                value={formData.cta_text}
                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Button Link *</label>
              <input
                type="text"
                value={formData.cta_link}
                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 rounded-lg text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: BRAND_COLORS.deepRed }}
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              'Save About Section'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}