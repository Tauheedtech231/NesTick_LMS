/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  teal: '#14B8A6'
};

interface JourneyStep {
  id?: string;
  step_number: number;
  title: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

interface JourneySettings {
  id?: string;
  heading: string;
  heading_highlight: string;
  subheading: string;
}

export default function JourneyManager() {
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [settings, setSettings] = useState<JourneySettings>({
    heading: 'Our',
    heading_highlight: 'Journey',
    subheading: 'A progressive path of growth, innovation, and commitment to excellence.'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showStepModal, setShowStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState<JourneyStep | null>(null);
  const [activeTab, setActiveTab] = useState<'steps' | 'settings'>('steps');

  const [stepFormData, setStepFormData] = useState<JourneyStep>({
    step_number: 1,
    title: '',
    description: '',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchSteps();
    fetchSettings();
  }, []);

  const fetchSteps = async () => {
    try {
      const response = await fetch('/api/management/journey/steps');
      const data = await response.json();
      if (data.success) {
        setSteps(data.data);
      }
    } catch (error) {
      console.error('Error fetching steps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/management/journey/settings');
      const data = await response.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/management/journey/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
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

  const handleStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/management/journey/steps', {
        method: editingStep ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stepFormData),
      });
      
      if (response.ok) {
        setShowStepModal(false);
        resetStepForm();
        fetchSteps();
      }
    } catch (error) {
      console.error('Error saving step:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditStep = (step: JourneyStep) => {
    setEditingStep(step);
    setStepFormData(step);
    setShowStepModal(true);
  };

  const handleDeleteStep = async (id: string) => {
    if (confirm('Are you sure you want to delete this journey step?')) {
      try {
        await fetch(`/api/management/journey/steps?id=${id}`, { method: 'DELETE' });
        fetchSteps();
      } catch (error) {
        console.error('Error deleting step:', error);
      }
    }
  };

  const resetStepForm = () => {
    setEditingStep(null);
    setStepFormData({
      step_number: steps.length + 1,
      title: '',
      description: '',
      display_order: steps.length,
      is_active: true
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
          onClick={() => setActiveTab('steps')}
          className="px-4 py-2 font-medium transition-colors cursor-pointer"
          style={activeTab === 'steps' ? { color: BRAND_COLORS.deepRed, borderBottom: `2px solid ${BRAND_COLORS.deepRed}` } : { color: '#6B7280' }}
        >
          Journey Steps
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className="px-4 py-2 font-medium transition-colors cursor-pointer"
          style={activeTab === 'settings' ? { color: BRAND_COLORS.deepRed, borderBottom: `2px solid ${BRAND_COLORS.deepRed}` } : { color: '#6B7280' }}
        >
          Section Settings
        </button>
      </div>

      {activeTab === 'steps' ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                Journey Steps Manager
              </h1>
              <p className="text-gray-500 text-sm mt-1">Manage the timeline journey steps</p>
            </div>
            <button
              onClick={() => {
                resetStepForm();
                setShowStepModal(true);
              }}
              className="px-4 py-2 rounded-lg text-white font-semibold transition-all hover:opacity-90 cursor-pointer flex items-center gap-2"
              style={{ backgroundColor: BRAND_COLORS.deepRed }}
            >
              <Plus size={18} />
              Add New Step
            </button>
          </div>

          {/* Steps List */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md p-5 border-l-4"
                style={{ borderLeftColor: index % 2 === 0 ? BRAND_COLORS.darkRoyalBlue : BRAND_COLORS.deepRed }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}>
                        {step.step_number}
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: BRAND_COLORS.darkNavy }}>{step.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${step.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {step.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm ml-14">{step.description}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditStep(step)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      style={{ color: BRAND_COLORS.teal }}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteStep(step.id!)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      style={{ color: BRAND_COLORS.deepRed }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {steps.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-lg font-medium text-gray-600">No journey steps yet</h3>
              <p className="text-gray-400 mt-1">Click "Add New Step" to create your journey timeline</p>
            </div>
          )}
        </>
      ) : (
        /* Settings Form */
        <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl">
          <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>Journey Section Settings</h2>
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Heading Text</label>
                <input
                  type="text"
                  value={settings.heading}
                  onChange={(e) => setSettings({ ...settings, heading: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Highlighted Word</label>
                <input
                  type="text"
                  value={settings.heading_highlight}
                  onChange={(e) => setSettings({ ...settings, heading_highlight: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subheading</label>
              <textarea
                rows={3}
                value={settings.subheading}
                onChange={(e) => setSettings({ ...settings, subheading: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
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

      {/* Step Modal */}
      {showStepModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowStepModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingStep ? 'Edit Journey Step' : 'Add New Journey Step'}</h2>
              <button onClick={() => setShowStepModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer">×</button>
            </div>
            <form onSubmit={handleStepSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Step Number</label>
                <input
                  type="number"
                  value={stepFormData.step_number}
                  onChange={(e) => setStepFormData({ ...stepFormData, step_number: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={stepFormData.title}
                  onChange={(e) => setStepFormData({ ...stepFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows={4}
                  value={stepFormData.description}
                  onChange={(e) => setStepFormData({ ...stepFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <input
                  type="number"
                  value={stepFormData.display_order}
                  onChange={(e) => setStepFormData({ ...stepFormData, display_order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={stepFormData.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setStepFormData({ ...stepFormData, is_active: e.target.value === 'active' })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowStepModal(false)} className="flex-1 px-4 py-2 border rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2 rounded-lg text-white font-semibold cursor-pointer" style={{ backgroundColor: BRAND_COLORS.deepRed }}>
                  {isSaving ? 'Saving...' : editingStep ? 'Update' : 'Create'} Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}