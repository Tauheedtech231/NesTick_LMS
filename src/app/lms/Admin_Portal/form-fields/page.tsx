// app/lms/Admin_Portal/form-fields/page.tsx
'use client';
/* eslint-disable */
import { useState, useEffect } from 'react';
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiRefresh,
  HiCheck,
  HiX,
  HiEye,
  HiEyeOff,
  HiArrowUp,
  HiArrowDown,
  HiDocumentText,
  HiTemplate
} from 'react-icons/hi';
import { Loader2 } from 'lucide-react';

const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  teal: '#1FB6CB'
};

interface FormField {
  id: string;
  label: string;
  name: string;
  type: 'text' | 'email' | 'number' | 'file' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';
  placeholder: string;
  required: boolean;
  order: number;
  options: string[] | null;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

type FieldType = FormField['type'];

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'file', label: 'File Upload' },
  { value: 'date', label: 'Date Picker' }
];

export default function FormFieldsPage() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [formData, setFormData] = useState<Partial<FormField>>({
    label: '',
    name: '',
    type: 'text',
    placeholder: '',
    required: true,
    order: 1,
    options: [],
    status: 'active'
  });
  const [optionsText, setOptionsText] = useState('');

  // Load fields on mount
  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch('/api/admin/form-fields');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load fields');
      }

      if (result.success) {
        setFields(result.data);
      }
    } catch (error: any) {
      console.error('Error loading fields:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadFields(true);
  };

  const openCreateModal = () => {
    setEditingField(null);
    setFormData({
      label: '',
      name: '',
      type: 'text',
      placeholder: '',
      required: true,
      order: fields.length + 1,
      options: [],
      status: 'active'
    });
    setOptionsText('');
    setShowModal(true);
  };

  const openEditModal = (field: FormField) => {
    setEditingField(field);
    setFormData({
      label: field.label,
      name: field.name,
      type: field.type,
      placeholder: field.placeholder || '',
      required: field.required,
      order: field.order,
      options: field.options || [],
      status: field.status
    });
    setOptionsText(field.options?.join('\n') || '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingField(null);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as FieldType;
    setFormData({ 
      ...formData, 
      type: newType,
      // Clear options if not needed
      options: ['select', 'radio', 'checkbox'].includes(newType) ? formData.options : []
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!formData.label || !formData.name || !formData.type) {
      setError('Label, name, and type are required');
      return;
    }

    // Validate name format (no spaces, only letters, numbers, underscore)
    const nameRegex = /^[a-z_][a-z0-9_]*$/i;
    if (!nameRegex.test(formData.name)) {
      setError('Name must start with a letter and contain only letters, numbers, and underscores');
      return;
    }

    // Parse options for select/radio/checkbox
    let options: string[] | null = null;
    if (['select', 'radio', 'checkbox'].includes(formData.type || '')) {
      options = optionsText
        .split('\n')
        .map(opt => opt.trim())
        .filter(opt => opt.length > 0);
      
      if (options.length === 0) {
        setError('Please provide at least one option for this field type');
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        options,
        order: formData.order || 1,
        required: formData.required ? 1 : 0
      };

      let response;
      if (editingField) {
        // Update
        response = await fetch(`/api/admin/form-fields?id=${editingField.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create
        response = await fetch('/api/admin/form-fields', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save field');
      }

      if (result.success) {
        setSuccess(editingField ? 'Field updated successfully!' : 'Field created successfully!');
        setTimeout(() => setSuccess(null), 3000);
        closeModal();
        loadFields();
      }
    } catch (error: any) {
      console.error('Error saving field:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this field? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/form-fields?id=${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete field');
      }

      if (result.success) {
        setSuccess('Field deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
        loadFields();
      }
    } catch (error: any) {
      console.error('Error deleting field:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (field: FormField) => {
    const newStatus = field.status === 'active' ? 'inactive' : 'active';

    try {
      const response = await fetch(`/api/admin/form-fields?id=${field.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status');
      }

      if (result.success) {
        setFields(fields.map(f => 
          f.id === field.id ? { ...f, status: newStatus } : f
        ));
      }
    } catch (error: any) {
      console.error('Error toggling status:', error);
      setError(error.message);
    }
  };

  const moveOrder = async (field: FormField, direction: 'up' | 'down') => {
    const currentIndex = fields.findIndex(f => f.id === field.id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === fields.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const otherField = fields[newIndex];

    try {
      // Swap orders
      await Promise.all([
        fetch(`/api/admin/form-fields?id=${field.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: otherField.order })
        }),
        fetch(`/api/admin/form-fields?id=${otherField.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: field.order })
        })
      ]);

      // Update local state
      const newFields = [...fields];
      newFields[currentIndex] = { ...field, order: otherField.order };
      newFields[newIndex] = { ...otherField, order: field.order };
      newFields.sort((a, b) => a.order - b.order);
      setFields(newFields);
    } catch (error: any) {
      console.error('Error reordering fields:', error);
      setError(error.message);
    }
  };

  const getTypeLabel = (type: FieldType) => {
    return FIELD_TYPES.find(t => t.value === type)?.label || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: BRAND_COLORS.deepRed }} />
          <p className="text-gray-600">Loading form fields...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div 
            className="rounded-xl p-6 text-white"
            style={{ 
              background: `linear-gradient(135deg, ${BRAND_COLORS.darkRoyalBlue} 0%, ${BRAND_COLORS.darkNavy} 100%)`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${BRAND_COLORS.white}20` }}>
                  <HiTemplate className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-2">Form Fields Management</h1>
                  <p style={{ color: `${BRAND_COLORS.white}CC` }}>
                    Configure dynamic fields for the enrollment form
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
                  style={{ backgroundColor: `${BRAND_COLORS.white}20` }}
                >
                  <HiRefresh className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:opacity-90 transition-colors"
                  style={{ backgroundColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.white }}
                >
                  <HiPlus className="w-4 h-4" />
                  Add New Field
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <HiX className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <HiCheck className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Fields Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fields.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      <HiDocumentText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No form fields found. Click "Add New Field" to create one.</p>
                    </td>
                  </tr>
                ) : (
                  fields.map((field, index) => (
                    <tr key={field.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-900">{field.order}</span>
                          <div className="flex flex-col ml-2">
                            <button
                              onClick={() => moveOrder(field, 'up')}
                              disabled={index === 0}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            >
                              <HiArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => moveOrder(field, 'down')}
                              disabled={index === fields.length - 1}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            >
                              <HiArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">{field.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{field.name}</code>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full" style={{
                          backgroundColor: `${BRAND_COLORS.teal}15`,
                          color: BRAND_COLORS.teal
                        }}>
                          {getTypeLabel(field.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {field.required ? (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">Required</span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">Optional</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleStatus(field)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            field.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {field.status === 'active' ? (
                            <>
                              <HiEye className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <HiEyeOff className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(field)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <HiPencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(field.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                {editingField ? 'Edit Form Field' : 'Create New Form Field'}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="label"
                  value={formData.label || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Full Name"
                  required
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="e.g., full_name"
                  required
                  pattern="[a-z_][a-z0-9_]*"
                  title="Must start with a letter and contain only letters, numbers, and underscores"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used in code. Must be unique, lowercase, no spaces.
                </p>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleTypeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {FIELD_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Placeholder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placeholder
                </label>
                <input
                  type="text"
                  name="placeholder"
                  value={formData.placeholder || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Enter your full name"
                />
              </div>

              {/* Options for select/radio/checkbox */}
              {['select', 'radio', 'checkbox'].includes(formData.type || '') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Options <span className="text-red-500">*</span> (one per line)
                  </label>
                  <textarea
                    value={optionsText}
                    onChange={(e) => setOptionsText(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    required={['select', 'radio', 'checkbox'].includes(formData.type || '')}
                  />
                </div>
              )}

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order || 1}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Required Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="required"
                  id="required"
                  checked={formData.required || false}
                  onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="required" className="text-sm font-medium text-gray-700">
                  This field is required
                </label>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 flex items-center gap-2"
                  style={{ backgroundColor: BRAND_COLORS.deepRed }}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingField ? 'Update Field' : 'Create Field'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}