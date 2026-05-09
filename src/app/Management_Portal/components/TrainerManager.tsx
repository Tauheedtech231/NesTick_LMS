/* eslint-disable react/no-unescaped-entities */
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

interface Trainer {
  id?: string;
  name: string;
  role: string;
  expertise: string;
  experience: string;
  image_url: string;
  students_trained: string;
  training_style: string;
  display_order: number;
  is_active: boolean;
  certifications: string[];
}

interface FacultySettings {
  id?: string;
  badge_text: string;
  heading_prefix: string;
  heading_highlight: string;
  description: string;
}

export default function TrainerManager() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [settings, setSettings] = useState<FacultySettings>({
    badge_text: 'Expert Faculty',
    heading_prefix: 'Meet Our',
    heading_highlight: 'Trainers',
    description: 'Click on any trainer to view their professional details and expertise'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'trainers' | 'settings'>('trainers');

  const [formData, setFormData] = useState<Trainer>({
    name: '',
    role: '',
    expertise: '',
    experience: '',
    image_url: '',
    students_trained: '',
    training_style: '',
    display_order: 0,
    is_active: true,
    certifications: ['']
  });

  useEffect(() => {
    fetchTrainers();
    fetchSettings();
  }, []);

  const fetchTrainers = async () => {
    try {
      const response = await fetch('/api/management/trainers');
      const data = await response.json();
      if (data.success) {
        setTrainers(data.data);
      }
    } catch (error) {
      console.error('Error fetching trainers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/management/trainers/settings');
      const data = await response.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('folder', 'trainers');

    try {
      const response = await fetch('/api/management/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      const data = await response.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, image_url: data.url }));
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, '']
    }));
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const updateCertification = (index: number, value: string) => {
    const newCerts = [...formData.certifications];
    newCerts[index] = value;
    setFormData(prev => ({ ...prev, certifications: newCerts }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const submitData = {
      ...formData,
      certifications: formData.certifications.filter(c => c.trim() !== '')
    };

    try {
      const response = await fetch('/api/management/trainers', {
        method: editingTrainer ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      
      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchTrainers();
      }
    } catch (error) {
      console.error('Error saving trainer:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const submitData = {
      id: settings.id,
      badge_text: settings.badge_text,
      heading_prefix: settings.heading_prefix,
      heading_highlight: settings.heading_highlight,
      description: settings.description
    };

    try {
      const response = await fetch('/api/management/trainers/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      
      if (response.ok) {
        alert('Settings saved successfully!');
        fetchSettings();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      ...trainer,
      certifications: trainer.certifications || ['']
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this trainer?')) {
      try {
        await fetch(`/api/management/trainers/${id}`, { method: 'DELETE' });
        fetchTrainers();
      } catch (error) {
        console.error('Error deleting trainer:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingTrainer(null);
    setFormData({
      name: '',
      role: '',
      expertise: '',
      experience: '',
      image_url: '',
      students_trained: '',
      training_style: '',
      display_order: 0,
      is_active: true,
      certifications: ['']
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: BRAND_COLORS.deepRed }}></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('trainers')}
          className="px-4 py-2 font-medium transition-colors text-gray-500 hover:text-gray-700"
          style={activeTab === 'trainers' ? { color: BRAND_COLORS.deepRed, borderBottom: `2px solid ${BRAND_COLORS.deepRed}` } : {}}
        >
          Trainers
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className="px-4 py-2 font-medium transition-colors text-gray-500 hover:text-gray-700"
          style={activeTab === 'settings' ? { color: BRAND_COLORS.deepRed, borderBottom: `2px solid ${BRAND_COLORS.deepRed}` } : {}}
        >
          Section Settings
        </button>
      </div>

      {activeTab === 'trainers' ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                Faculty / Trainers Manager
              </h1>
              <p className="text-gray-500 text-sm mt-1">Manage trainer profiles, certifications, and details</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-4 py-2 rounded-lg text-white font-semibold transition-all hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: BRAND_COLORS.deepRed }}
            >
              + Add New Trainer
            </button>
          </div>

          {/* Trainers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((trainer) => (
              <motion.div
                key={trainer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="relative h-48 bg-gray-100">
                  {trainer.image_url && (
                    <img src={trainer.image_url} alt={trainer.name} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${trainer.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                      {trainer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg" style={{ color: BRAND_COLORS.darkNavy }}>{trainer.name}</h3>
                  <p className="text-sm" style={{ color: BRAND_COLORS.deepRed }}>{trainer.role}</p>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">{trainer.experience}</p>
                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <button onClick={() => handleEdit(trainer)} className="flex-1 px-3 py-1.5 rounded-lg text-white text-sm transition-all hover:opacity-80 cursor-pointer" style={{ backgroundColor: BRAND_COLORS.teal }}>Edit</button>
                    <button onClick={() => handleDelete(trainer.id!)} className="flex-1 px-3 py-1.5 rounded-lg text-white text-sm transition-all hover:opacity-80 cursor-pointer" style={{ backgroundColor: BRAND_COLORS.deepRed }}>Delete</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {trainers.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl">
              <div className="text-6xl mb-4">👨‍🏫</div>
              <h3 className="text-lg font-medium text-gray-600">No trainers yet</h3>
              <p className="text-gray-400 mt-1">Click "Add New Trainer" to create your first trainer profile</p>
            </div>
          )}
        </>
      ) : (
        /* Settings Form */
        <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl">
          <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>Faculty Section Settings</h2>
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Badge Text</label>
              <input
                type="text"
                value={settings.badge_text}
                onChange={(e) => setSettings({ ...settings, badge_text: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Heading Prefix</label>
                <input
                  type="text"
                  value={settings.heading_prefix}
                  onChange={(e) => setSettings({ ...settings, heading_prefix: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Heading Highlight</label>
                <input
                  type="text"
                  value={settings.heading_highlight}
                  onChange={(e) => setSettings({ ...settings, heading_highlight: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                rows={3}
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-lg text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: BRAND_COLORS.deepRed }}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      )}

      {/* Trainer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role *</label>
                <input type="text" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expertise *</label>
                <textarea rows={2} value={formData.expertise} onChange={(e) => setFormData({ ...formData, expertise: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Experience *</label>
                  <input type="text" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Students Trained *</label>
                  <input type="text" value={formData.students_trained} onChange={(e) => setFormData({ ...formData, students_trained: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Training Style *</label>
                <input type="text" value={formData.training_style} onChange={(e) => setFormData({ ...formData, training_style: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                <div className="flex items-center gap-4">
                  {formData.image_url && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    {uploading ? 'Uploading...' : formData.image_url ? 'Change Image' : 'Upload Image'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Certifications</label>
                {formData.certifications.map((cert, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" value={cert} onChange={(e) => updateCertification(idx, e.target.value)} className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Certification" />
                    <button type="button" onClick={() => removeCertification(idx)} className="text-red-500 hover:text-red-700 cursor-pointer">Remove</button>
                  </div>
                ))}
                <button type="button" onClick={addCertification} className="text-sm text-blue-500 hover:text-blue-700 cursor-pointer">+ Add Certification</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Display Order</label>
                  <input type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={formData.is_active ? 'active' : 'inactive'} onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2 rounded-lg text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer" style={{ backgroundColor: BRAND_COLORS.deepRed }}>
                  {isSaving ? 'Saving...' : editingTrainer ? 'Update' : 'Create'} Trainer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}