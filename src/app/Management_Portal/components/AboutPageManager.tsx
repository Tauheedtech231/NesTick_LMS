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
  teal: '#14B8A6'
};

interface AboutData {
  id?: string;
  hero_heading: string;
  hero_description: string;
  hero_button_text: string;
  hero_button_link: string;
  hero_video_url: string;
  mission_title: string;
  vision_title: string;
  why_choose_heading: string;
  why_choose_subheading: string;
  mission_items: string[];
  vision_items: string[];
  why_choose_items: { title: string; description: string }[];
}

export default function AboutPageManager() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'main' | 'mission' | 'vision' | 'why'>('main');

  const [formData, setFormData] = useState<AboutData>({
    hero_heading: 'About Mansol Hab',
    hero_description: '',
    hero_button_text: 'Explore Our Courses',
    hero_button_link: '/courses',
    hero_video_url: '/about.mp4',
    mission_title: 'Our Mission',
    vision_title: 'Our Vision',
    why_choose_heading: 'Why Choose Mansol',
    why_choose_subheading: '',
    mission_items: ['Industry-aligned technical education', 'Hands-on practical training', 'Foster innovation and creativity', 'Promote safety standards', 'Develop professional ethics', 'Prepare for real-world challenges'],
    vision_items: ['Global recognition in technical education', 'Community of skilled professionals', 'Priority on safety and integrity', 'Continuous innovation', 'Industry partnership and collaboration', 'Excellence in training delivery'],
    why_choose_items: [
      { title: 'Industry-aligned curriculum with practical exposure', description: 'Our curriculum is developed in collaboration with industry experts to ensure you learn exactly what employers need.' },
      { title: 'Certified and experienced instructors', description: 'Learn from professionals who have years of industry experience.' },
      { title: 'Focus on safety standards and professional ethics', description: 'Safety is at the core of everything we teach.' },
      { title: 'Career-oriented training and recognized certifications', description: 'Our certifications are recognized by leading employers.' }
    ]
  });

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const response = await fetch('/api/management/about-pg');
      const data = await response.json();
      if (data.success && data.data) {
        setAboutData(data.data);
        setFormData(data.data);
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/management/about-pg', {
        method: aboutData?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        alert('About section saved successfully!');
        fetchAboutData();
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addMissionItem = () => {
    setFormData({ ...formData, mission_items: [...formData.mission_items, ''] });
  };

  const updateMissionItem = (index: number, value: string) => {
    const newItems = [...formData.mission_items];
    newItems[index] = value;
    setFormData({ ...formData, mission_items: newItems });
  };

  const removeMissionItem = (index: number) => {
    setFormData({ ...formData, mission_items: formData.mission_items.filter((_, i) => i !== index) });
  };

  const addVisionItem = () => {
    setFormData({ ...formData, vision_items: [...formData.vision_items, ''] });
  };

  const updateVisionItem = (index: number, value: string) => {
    const newItems = [...formData.vision_items];
    newItems[index] = value;
    setFormData({ ...formData, vision_items: newItems });
  };

  const removeVisionItem = (index: number) => {
    setFormData({ ...formData, vision_items: formData.vision_items.filter((_, i) => i !== index) });
  };

  const addWhyChooseItem = () => {
    setFormData({ ...formData, why_choose_items: [...formData.why_choose_items, { title: '', description: '' }] });
  };

  const updateWhyChooseItem = (index: number, field: 'title' | 'description', value: string) => {
    const newItems = [...formData.why_choose_items];
    newItems[index][field] = value;
    setFormData({ ...formData, why_choose_items: newItems });
  };

  const removeWhyChooseItem = (index: number) => {
    setFormData({ ...formData, why_choose_items: formData.why_choose_items.filter((_, i) => i !== index) });
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
          About Page Manager
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage About Us page content</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b flex-wrap">
        <button onClick={() => setActiveTab('main')} className={`px-4 py-2 font-medium transition-colors cursor-pointer ${activeTab === 'main' ? 'border-b-2' : ''}`} style={activeTab === 'main' ? { color: BRAND_COLORS.deepRed, borderBottomColor: BRAND_COLORS.deepRed } : { color: '#6B7280' }}>Main Content</button>
        <button onClick={() => setActiveTab('mission')} className={`px-4 py-2 font-medium transition-colors cursor-pointer ${activeTab === 'mission' ? 'border-b-2' : ''}`} style={activeTab === 'mission' ? { color: BRAND_COLORS.deepRed, borderBottomColor: BRAND_COLORS.deepRed } : { color: '#6B7280' }}>Mission Items</button>
        <button onClick={() => setActiveTab('vision')} className={`px-4 py-2 font-medium transition-colors cursor-pointer ${activeTab === 'vision' ? 'border-b-2' : ''}`} style={activeTab === 'vision' ? { color: BRAND_COLORS.deepRed, borderBottomColor: BRAND_COLORS.deepRed } : { color: '#6B7280' }}>Vision Items</button>
        <button onClick={() => setActiveTab('why')} className={`px-4 py-2 font-medium transition-colors cursor-pointer ${activeTab === 'why' ? 'border-b-2' : ''}`} style={activeTab === 'why' ? { color: BRAND_COLORS.deepRed, borderBottomColor: BRAND_COLORS.deepRed } : { color: '#6B7280' }}>Why Choose Items</button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
        {activeTab === 'main' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>Hero Section</h2>
            <div><label className="block text-sm font-medium mb-1">Hero Heading</label><input type="text" value={formData.hero_heading} onChange={(e) => setFormData({ ...formData, hero_heading: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" required /></div>
            <div><label className="block text-sm font-medium mb-1">Hero Description</label><textarea rows={3} value={formData.hero_description} onChange={(e) => setFormData({ ...formData, hero_description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required /></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">Button Text</label><input type="text" value={formData.hero_button_text} onChange={(e) => setFormData({ ...formData, hero_button_text: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium mb-1">Button Link</label><input type="text" value={formData.hero_button_link} onChange={(e) => setFormData({ ...formData, hero_button_link: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div></div>
            <div><label className="block text-sm font-medium mb-1">Video URL</label><input type="text" value={formData.hero_video_url} onChange={(e) => setFormData({ ...formData, hero_video_url: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
            
            <div className="border-t pt-4 mt-4"><h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>Section Titles</h2></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">Mission Title</label><input type="text" value={formData.mission_title} onChange={(e) => setFormData({ ...formData, mission_title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium mb-1">Vision Title</label><input type="text" value={formData.vision_title} onChange={(e) => setFormData({ ...formData, vision_title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div></div>
            <div><label className="block text-sm font-medium mb-1">Why Choose Heading</label><input type="text" value={formData.why_choose_heading} onChange={(e) => setFormData({ ...formData, why_choose_heading: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Why Choose Subheading</label><textarea rows={2} value={formData.why_choose_subheading} onChange={(e) => setFormData({ ...formData, why_choose_subheading: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
          </div>
        )}

        {activeTab === 'mission' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>Mission Items</h2><button type="button" onClick={addMissionItem} className="px-3 py-1 text-sm rounded-lg text-white" style={{ backgroundColor: BRAND_COLORS.teal }}>+ Add Item</button></div>
            {formData.mission_items.map((item, idx) => (<div key={idx} className="flex gap-2 items-start"><input type="text" value={item} onChange={(e) => updateMissionItem(idx, e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" placeholder={`Mission item ${idx + 1}`} /><button type="button" onClick={() => removeMissionItem(idx)} className="text-red-500">Remove</button></div>))}
          </div>
        )}

        {activeTab === 'vision' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>Vision Items</h2><button type="button" onClick={addVisionItem} className="px-3 py-1 text-sm rounded-lg text-white" style={{ backgroundColor: BRAND_COLORS.teal }}>+ Add Item</button></div>
            {formData.vision_items.map((item, idx) => (<div key={idx} className="flex gap-2 items-start"><input type="text" value={item} onChange={(e) => updateVisionItem(idx, e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" placeholder={`Vision item ${idx + 1}`} /><button type="button" onClick={() => removeVisionItem(idx)} className="text-red-500">Remove</button></div>))}
          </div>
        )}

        {activeTab === 'why' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>Why Choose Items</h2><button type="button" onClick={addWhyChooseItem} className="px-3 py-1 text-sm rounded-lg text-white" style={{ backgroundColor: BRAND_COLORS.teal }}>+ Add Item</button></div>
            {formData.why_choose_items.map((item, idx) => (<div key={idx} className="border rounded-lg p-4 space-y-2"><div className="flex justify-between"><h3 className="font-medium">Item {idx + 1}</h3><button type="button" onClick={() => removeWhyChooseItem(idx)} className="text-red-500 text-sm">Remove</button></div><input type="text" value={item.title} onChange={(e) => updateWhyChooseItem(idx, 'title', e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Title" /><textarea rows={3} value={item.description} onChange={(e) => updateWhyChooseItem(idx, 'description', e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Description" /></div>))}
          </div>
        )}

        <div className="flex justify-end mt-6 pt-4 border-t">
          <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-lg text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer" style={{ backgroundColor: BRAND_COLORS.deepRed }}>{isSaving ? 'Saving...' : 'Save About Section'}</button>
        </div>
      </form>
    </div>
  );
}