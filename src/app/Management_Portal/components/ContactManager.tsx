'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  teal: '#14B8A6'
};

interface Card {
  id?: string;
  card_type: 'email' | 'phone' | 'hours';
  title: string;
  value: string;
  icon_name: string;
  display_order: number;
}

interface InfoItem {
  id?: string;
  info_type: 'address' | 'phone' | 'email' | 'hours' | 'whatsapp';
  title: string;
  value: string;
  display_order: number;
}

interface ContactData {
  id: string;
  hero_heading: string;
  hero_description: string;
  hero_button_text: string;
  hero_background_image: string;
  map_embed_url: string;
  cards: Card[];
  info: InfoItem[];
}

export default function ContactManager() {
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    hero_heading: 'Get in Touch',
    hero_description: 'Have questions about our training programs? We\'re here to help you start your journey in technical education.',
    hero_button_text: 'Find Us on Map',
    hero_background_image: '',
    map_embed_url: ''
  });

  const [cards, setCards] = useState<Card[]>([
    { card_type: 'email', title: 'Email Us', value: 'info@mansolhab.com', icon_name: 'HiMail', display_order: 0 },
    { card_type: 'phone', title: 'Call Us', value: '0322-4700200', icon_name: 'HiPhone', display_order: 1 },
    { card_type: 'hours', title: 'Office Hours', value: 'Mon-Sat: 9:00 AM - 5:00 PM', icon_name: 'HiClock', display_order: 2 }
  ]);

  const [infoItems, setInfoItems] = useState<InfoItem[]>([
    { info_type: 'address', title: 'Office Address', value: '123 Business Avenue, Main Boulevard\nLahore, Punjab 54000\nPakistan', display_order: 0 },
    { info_type: 'phone', title: 'Phone Numbers', value: 'General: 0322-4700200\nLahore: 0310-4700200\nSheikhupura: 0305-4700202\nRawalpindi: 0320-4700607', display_order: 1 },
    { info_type: 'email', title: 'Email', value: 'info@mansolhab.com', display_order: 2 },
    { info_type: 'hours', title: 'Office Hours', value: 'Monday - Saturday: 9:00 AM - 5:00 PM\nSunday: Closed', display_order: 3 },
    { info_type: 'whatsapp', title: 'WhatsApp', value: '+92 322 4700200', display_order: 4 }
  ]);

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/management/contact');
      const data = await response.json();
      if (data.success && data.data) {
        setContactData(data.data);
        setFormData({
          hero_heading: data.data.hero_heading || 'Get in Touch',
          hero_description: data.data.hero_description || '',
          hero_button_text: data.data.hero_button_text || 'Find Us on Map',
          hero_background_image: data.data.hero_background_image || '',
          map_embed_url: data.data.map_embed_url || ''
        });
        if (data.data.cards) setCards(data.data.cards);
        if (data.data.info) setInfoItems(data.data.info);
      }
    } catch (error) {
      console.error('Error fetching contact data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('folder', 'contact-section');

    try {
      const response = await fetch('/api/management/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      const data = await response.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, hero_background_image: data.url }));
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const updateCard = (index: number, field: keyof Card, value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  const updateInfoItem = (index: number, field: keyof InfoItem, value: string) => {
    const newInfo = [...infoItems];
    newInfo[index] = { ...newInfo[index], [field]: value };
    setInfoItems(newInfo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const submitData = {
      id: contactData?.id,
      ...formData,
      cards,
      info: infoItems
    };

    try {
      const response = await fetch('/api/management/contact', {
        method: contactData?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      
      if (response.ok) {
        fetchContactData();
        alert('Contact section saved successfully!');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving contact section');
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
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
          Contact Section Manager
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage contact page content (Hero, Cards, Info, Map)</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>Hero Section</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hero Heading *</label>
              <input
                type="text"
                value={formData.hero_heading}
                onChange={(e) => setFormData({ ...formData, hero_heading: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Hero Description *</label>
              <textarea
                rows={3}
                value={formData.hero_description}
                onChange={(e) => setFormData({ ...formData, hero_description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Button Text *</label>
              <input
                type="text"
                value={formData.hero_button_text}
                onChange={(e) => setFormData({ ...formData, hero_button_text: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Hero Background Image</label>
              <div className="flex items-center gap-4">
                {formData.hero_background_image && (
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden">
                    <img src={formData.hero_background_image} alt="Hero" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, hero_background_image: '' })}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
                <label className="px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  {uploading ? 'Uploading...' : formData.hero_background_image ? 'Change Image' : 'Upload Image'}
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-1">Recommended size: 1920x1080px</p>
            </div>
          </div>
        </div>

        {/* Contact Cards (Hover Effect Cards) */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>Contact Cards (Hover Reveal)</h2>
          <div className="space-y-4">
            {cards.map((card, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => updateCard(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Value (Email/Phone/Hours)</label>
                    <input
                      type="text"
                      value={card.value}
                      onChange={(e) => updateCard(index, 'value', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info (Left Column Details) */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>Contact Information Details</h2>
          <div className="space-y-4">
            {infoItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateInfoItem(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Value (use \n for line breaks)</label>
                    <textarea
                      rows={4}
                      value={item.value}
                      onChange={(e) => updateInfoItem(index, 'value', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>Google Map Embed URL</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Map Embed URL</label>
            <textarea
              rows={3}
              value={formData.map_embed_url}
              onChange={(e) => setFormData({ ...formData, map_embed_url: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
            <p className="text-xs text-gray-400 mt-1">Get embed URL from Google Maps → Share → Embed a map</p>
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
              'Save Contact Section'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}