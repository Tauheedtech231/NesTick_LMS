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

interface SocialLink {
  id?: string;
  platform: string;
  url: string;
  icon_name: string;
  bg_color: string;
}

interface QuickLink {
  id?: string;
  title: string;
  url: string;
}

interface Program {
  id?: string;
  title: string;
  url: string;
}

interface ContactInfo {
  id?: string;
  contact_type: string;
  label: string;
  value: string;
  url: string | null;
}

interface FooterData {
  id: string;
  logo_url: string;
  about_text: string;
  copyright_text: string;
  socialLinks: SocialLink[];
  quickLinks: QuickLink[];
  programs: Program[];
  contactInfo: ContactInfo[];
}

export default function FooterManager() {
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    logo_url: '/newlogo.jpg',
    about_text: 'Excellence in education since 2005. Shaping future leaders through quality education and character building.',
    copyright_text: 'MansolHab. All Rights Reserved.'
  });

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: 'facebook', url: 'https://web.facebook.com/profile.php?id=61567152315949', icon_name: 'FaFacebookF', bg_color: '#1877F2' },
    { platform: 'instagram', url: 'https://www.instagram.com/mansol.hab.training.services/?hl=en', icon_name: 'FaInstagram', bg_color: 'gradient' },
    { platform: 'linkedin', url: 'https://www.linkedin.com/in/mansol-hab-traning-services-b7b4b1296/', icon_name: 'FaLinkedinIn', bg_color: '#0A66C2' },
    { platform: 'tiktok', url: 'https://www.tiktok.com/@mansol.skp', icon_name: 'FaTiktok', bg_color: '#000000' }
  ]);

  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([
    { title: 'Home', url: '/' },
    { title: 'Courses', url: '/courses' },
    { title: 'About', url: '/about' },
    { title: 'Contact', url: '/contact' }
  ]);

  const [programs, setPrograms] = useState<Program[]>([
    { title: 'BOSH (Building Operating System Hardware)', url: '/courses/bosh' },
    { title: 'Fire Safety', url: '/courses/fire-safety' },
    { title: 'OSHA (Occupational Safety and Health Administration)', url: '/courses/osha' },
    { title: 'Hole Watcher', url: '/courses/hole-watcher' },
    { title: 'Permit to Work System (PTW System)', url: '/courses/ptw' }
  ]);

  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([
    { contact_type: 'phone', label: 'General', value: '03224700200', url: 'tel:03224700200' },
    { contact_type: 'phone', label: 'Lahore', value: '03104700200', url: 'tel:03104700200' },
    { contact_type: 'phone', label: 'Sheikhupura', value: '03054700202', url: 'tel:03054700202' },
    { contact_type: 'phone', label: 'Rawalpindi', value: '03204700607', url: 'tel:03204700607' },
    { contact_type: 'email', label: 'Email', value: 'info@mansolhab.com', url: 'mailto:info@mansolhab.com' },
    { contact_type: 'whatsapp', label: 'WhatsApp', value: '03224700200', url: 'https://wa.me/923224700200' },
    { contact_type: 'hours', label: 'Office Hours', value: 'Monday to Saturday\n9 to 5', url: null }
  ]);

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/management/footer');
      const data = await response.json();
      if (data.success && data.data) {
        setFooterData(data.data);
        setFormData({
          logo_url: data.data.logo_url || '/newlogo.jpg',
          about_text: data.data.about_text || '',
          copyright_text: data.data.copyright_text || ''
        });
        if (data.data.socialLinks) setSocialLinks(data.data.socialLinks);
        if (data.data.quickLinks) setQuickLinks(data.data.quickLinks);
        if (data.data.programs) setPrograms(data.data.programs);
        if (data.data.contactInfo) setContactInfo(data.data.contactInfo);
      }
    } catch (error) {
      console.error('Error fetching footer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('folder', 'footer');

    try {
      const response = await fetch('/api/management/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      const data = await response.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, logo_url: data.url }));
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const addQuickLink = () => {
    setQuickLinks([...quickLinks, { title: '', url: '' }]);
  };

  const removeQuickLink = (index: number) => {
    setQuickLinks(quickLinks.filter((_, i) => i !== index));
  };

  const updateQuickLink = (index: number, field: keyof QuickLink, value: string) => {
    const newLinks = [...quickLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setQuickLinks(newLinks);
  };

  const addProgram = () => {
    setPrograms([...programs, { title: '', url: '' }]);
  };

  const removeProgram = (index: number) => {
    setPrograms(programs.filter((_, i) => i !== index));
  };

  const updateProgram = (index: number, field: keyof Program, value: string) => {
    const newPrograms = [...programs];
    newPrograms[index] = { ...newPrograms[index], [field]: value };
    setPrograms(newPrograms);
  };

  const addContactInfo = () => {
    setContactInfo([...contactInfo, { contact_type: 'other', label: '', value: '', url: null }]);
  };

  const removeContactInfo = (index: number) => {
    setContactInfo(contactInfo.filter((_, i) => i !== index));
  };

  const updateContactInfo = (index: number, field: keyof ContactInfo, value: string) => {
    const newInfo = [...contactInfo];
    newInfo[index] = { ...newInfo[index], [field]: value };
    setContactInfo(newInfo);
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    const newLinks = [...socialLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setSocialLinks(newLinks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const submitData = {
      id: footerData?.id,
      ...formData,
      socialLinks,
      quickLinks,
      programs,
      contactInfo
    };

    try {
      const response = await fetch('/api/management/footer', {
        method: footerData?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      
      if (response.ok) {
        fetchFooterData();
        alert('Footer saved successfully!');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving footer');
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
          Footer Manager
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage footer content (Logo, Links, Programs, Contact)</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo & About Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>Logo & About</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Logo</label>
              <div className="flex items-center gap-4">
                {formData.logo_url && (
                  <div className="relative w-32 h-16 rounded-lg overflow-hidden border">
                    <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo_url: '' })}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
                <label className="px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  {uploading ? 'Uploading...' : formData.logo_url ? 'Change Logo' : 'Upload Logo'}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">About Text</label>
              <textarea
                rows={3}
                value={formData.about_text}
                onChange={(e) => setFormData({ ...formData, about_text: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Copyright Text</label>
              <input
                type="text"
                value={formData.copyright_text}
                onChange={(e) => setFormData({ ...formData, copyright_text: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>Social Links</h2>
          </div>
          <div className="space-y-4">
            {socialLinks.map((link, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Platform</label>
                    <input
                      type="text"
                      value={link.platform}
                      onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">URL</label>
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>Quick Links</h2>
            <button
              type="button"
              onClick={addQuickLink}
              className="px-3 py-1 text-sm rounded-lg text-white cursor-pointer"
              style={{ backgroundColor: BRAND_COLORS.teal }}
            >
              + Add Link
            </button>
          </div>
          <div className="space-y-4">
            {quickLinks.map((link, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">Link {index + 1}</h3>
                  {quickLinks.length > 1 && (
                    <button type="button" onClick={() => removeQuickLink(index)} className="text-red-500 text-sm">Remove</button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => updateQuickLink(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">URL</label>
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => updateQuickLink(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Programs */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>Programs</h2>
            <button
              type="button"
              onClick={addProgram}
              className="px-3 py-1 text-sm rounded-lg text-white cursor-pointer"
              style={{ backgroundColor: BRAND_COLORS.teal }}
            >
              + Add Program
            </button>
          </div>
          <div className="space-y-4">
            {programs.map((program, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">Program {index + 1}</h3>
                  {programs.length > 1 && (
                    <button type="button" onClick={() => removeProgram(index)} className="text-red-500 text-sm">Remove</button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={program.title}
                      onChange={(e) => updateProgram(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">URL</label>
                    <input
                      type="text"
                      value={program.url}
                      onChange={(e) => updateProgram(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>Contact Information</h2>
            <button
              type="button"
              onClick={addContactInfo}
              className="px-3 py-1 text-sm rounded-lg text-white cursor-pointer"
              style={{ backgroundColor: BRAND_COLORS.teal }}
            >
              + Add Contact
            </button>
          </div>
          <div className="space-y-4">
            {contactInfo.map((info, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">Contact {index + 1}</h3>
                  {contactInfo.length > 1 && (
                    <button type="button" onClick={() => removeContactInfo(index)} className="text-red-500 text-sm">Remove</button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      value={info.contact_type}
                      onChange={(e) => updateContactInfo(index, 'contact_type', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="phone">Phone</option>
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="hours">Hours</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Label</label>
                    <input
                      type="text"
                      value={info.label}
                      onChange={(e) => updateContactInfo(index, 'label', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Value</label>
                    <input
                      type="text"
                      value={info.value}
                      onChange={(e) => updateContactInfo(index, 'value', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">URL (optional)</label>
                    <input
                      type="text"
                      value={info.url || ''}
                      onChange={(e) => updateContactInfo(index, 'url', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="tel:1234567890 or mailto:email@example.com"
                    />
                  </div>
                </div>
              </div>
            ))}
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
              'Save Footer'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}