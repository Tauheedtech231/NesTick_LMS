/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  HiPlus, 
  HiPencil, 
  HiTrash, 
  HiX, 
  HiCheck,
  HiSearch,
  HiRefresh,
  HiGift as HiPackage,
  HiBookOpen,
  HiTag,
  HiAcademicCap,
  HiEye,
  HiUpload,
  HiPhotograph
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
  teal: '#1FB6CB',
  success: '#10B981',
  warning: '#F59E0B',
  purple: '#8B5CF6'
};

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dfp9qc0gu';
const CLOUDINARY_UPLOAD_PRESET = 'lms_upload';

interface Course {
  id: string;
  title: string;
  price: number;
  image?: string;
  category?: string;
  duration?: string;
  level?: string;
}

interface Bundle {
  id: string;
  title: string;
  description: string;
  image?: string;
  discount_percentage: number;
  discounted_price: number;
  original_price: number;
  total_courses: number;
  status: 'active' | 'inactive';
  created_by: string;
  created_at: string;
  updated_at: string;
  courses?: Course[];
}

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete' | 'view'>('create');
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    original_price: 0,
    discounted_price: 0,
    selectedCourses: [] as string[],
    status: 'active' as 'active' | 'inactive'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch bundles and courses
  const fetchData = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Fetch bundles
      const bundlesRes = await fetch('/api/admin/bundles');
      const bundlesData = await bundlesRes.json();
      if (bundlesData.success) {
        setBundles(bundlesData.data);
      }
      
      // Fetch all courses
      const coursesRes = await fetch('/api/admin/allcourses');
      const coursesData = await coursesRes.json();
      if (coursesData.success) {
        const coursesWithNumberPrice = coursesData.data.map((course: any) => ({
          ...course,
          price: typeof course.price === 'number' ? course.price : Number(course.price) || 0
        }));
        setAllCourses(coursesWithNumberPrice);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'lms/bundles');

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    return result.secure_url;
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const imageUrl = await uploadImageToCloudinary(file);
      setFormData(prev => ({ ...prev, image: imageUrl }));
      
    } catch (error: any) {
      console.error('Image upload error:', error);
      setError(error.message || 'Failed to upload image');
      setImagePreview('');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateBundle = () => {
    setModalMode('create');
    setSelectedBundle(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      original_price: 0,
      discounted_price: 0,
      selectedCourses: [],
      status: 'active'
    });
    setImagePreview('');
    setError('');
    setShowModal(true);
  };

  const handleEditBundle = (bundle: Bundle) => {
    setModalMode('edit');
    setSelectedBundle(bundle);
    setFormData({
      title: bundle.title,
      description: bundle.description || '',
      image: bundle.image || '',
      original_price: bundle.original_price,
      discounted_price: bundle.discounted_price,
      selectedCourses: bundle.courses?.map(c => c.id) || [],
      status: bundle.status
    });
    setImagePreview(bundle.image || '');
    setError('');
    setShowModal(true);
  };

  const handleViewBundle = (bundle: Bundle) => {
    setModalMode('view');
    setSelectedBundle(bundle);
    setShowModal(true);
  };

  const handleDeleteBundle = (bundle: Bundle) => {
    setModalMode('delete');
    setSelectedBundle(bundle);
    setShowModal(true);
  };

  // Calculate savings (auto)
  const getSavingsAmount = () => {
    const save = formData.original_price - formData.discounted_price;
    return isNaN(save) || save < 0 ? 0 : save;
  };

  // Calculate discount percentage (auto)
  const getDiscountPercentage = () => {
    if (formData.original_price <= 0) return 0;
    const discount = (getSavingsAmount() / formData.original_price) * 100;
    return Math.round(discount);
  };

  const handleCourseSelection = (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(courseId)
        ? prev.selectedCourses.filter(id => id !== courseId)
        : [...prev.selectedCourses, courseId]
    }));
  };

  const handleSubmit = async () => {
    if (modalMode === 'view') {
      setShowModal(false);
      return;
    }

    if (modalMode !== 'delete' && !formData.title.trim()) {
      setError('Bundle title is required');
      return;
    }

    if (modalMode !== 'delete' && formData.selectedCourses.length === 0) {
      setError('Please select at least one course');
      return;
    }

    if (modalMode !== 'delete' && formData.original_price <= 0) {
      setError('Total original price must be greater than 0');
      return;
    }

    if (modalMode !== 'delete' && formData.discounted_price <= 0) {
      setError('Discounted price must be greater than 0');
      return;
    }

    if (modalMode !== 'delete' && formData.discounted_price > formData.original_price) {
      setError('Discounted price cannot be greater than original price');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      let url = '/api/admin/bundles';
      let method = 'POST';
      let body: any = {};
      
      if (modalMode === 'edit' && selectedBundle) {
        url = `/api/admin/bundles?id=${selectedBundle.id}`;
        method = 'PUT';
        body = {
          title: formData.title,
          description: formData.description,
          image: formData.image,
          original_price: formData.original_price,
          discounted_price: formData.discounted_price,
          discount_percentage: getDiscountPercentage(),
          course_ids: formData.selectedCourses,
          status: formData.status,
          created_by: 'admin'
        };
      } else if (modalMode === 'delete' && selectedBundle) {
        url = `/api/admin/bundles?id=${selectedBundle.id}`;
        method = 'DELETE';
        body = {};
      } else {
        body = {
          title: formData.title,
          description: formData.description,
          image: formData.image,
          original_price: formData.original_price,
          discounted_price: formData.discounted_price,
          discount_percentage: getDiscountPercentage(),
          course_ids: formData.selectedCourses,
          status: formData.status,
          created_by: 'admin'
        };
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowModal(false);
        fetchData(true);
      } else {
        setError(result.error || 'Operation failed');
      }
    } catch (error: any) {
      setError(error.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><HiCheck className="w-3 h-3 mr-1" /> Active</span>;
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"><HiX className="w-3 h-3 mr-1" /> Inactive</span>;
  };

  const filteredBundles = bundles.filter(bundle =>
    bundle.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: BRAND_COLORS.deepRed }} />
          <p className="text-gray-600">Loading bundles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-red-50 to-white rounded-xl p-6 border border-red-100">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <HiPackage className="w-6 h-6" style={{ color: BRAND_COLORS.deepRed }} />
                </div>
                <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>Course Bundles</h1>
              </div>
              <p className="text-gray-500">Create and manage discounted course packages</p>
            </div>
            <button
              onClick={handleCreateBundle}
              className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:shadow-lg"
              style={{ backgroundColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.white }}
            >
              <HiPlus className="w-5 h-5" />
              Create Bundle
            </button>
          </div>
        </div>
      </div>

      {/* Search and Refresh Bar */}
      <div className="mb-6 flex justify-between items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search bundles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <HiRefresh className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Bundles Table */}
      {filteredBundles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <HiPackage className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Bundles Found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'No bundles match your search' : 'Create your first course bundle to offer discounts'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreateBundle}
              className="px-4 py-2 rounded-lg inline-flex items-center gap-2"
              style={{ backgroundColor: BRAND_COLORS.deepRed, color: BRAND_COLORS.white }}
            >
              <HiPlus className="w-5 h-5" />
              Create Bundle
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Bundle</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Courses</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Original</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Discount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Bundle Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBundles.map((bundle) => (
                  <tr key={bundle.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {bundle.image ? (
                          <img 
                            src={bundle.image} 
                            alt={bundle.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <HiPackage className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{bundle.title}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-xs">
                            {bundle.description || 'No description'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <HiBookOpen className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{bundle.total_courses} courses</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 line-through">
                        PKR {bundle.original_price.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100" style={{ color: BRAND_COLORS.deepRed }}>
                        <HiTag className="w-3 h-3 mr-1" />
                        Save PKR {(bundle.original_price - bundle.discounted_price).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-base font-bold" style={{ color: BRAND_COLORS.deepRed }}>
                        PKR {bundle.discounted_price.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(bundle.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewBundle(bundle)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <HiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditBundle(bundle)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Bundle"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBundle(bundle)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Bundle"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal - Create/Edit/Delete/View */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center" style={{ backgroundColor: BRAND_COLORS.deepRed }}>
              <h3 className="text-lg font-semibold text-white">
                {modalMode === 'create' && 'Create New Bundle'}
                {modalMode === 'edit' && 'Edit Bundle'}
                {modalMode === 'delete' && 'Delete Bundle'}
                {modalMode === 'view' && 'Bundle Details'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <HiX className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="p-6 overflow-auto max-h-[calc(90vh-100px)]">
              {modalMode === 'delete' ? (
                <div className="text-center">
                  <HiTrash className="w-16 h-16 mx-auto text-red-500 mb-4" />
                  <p className="text-gray-700 mb-2">
                    Are you sure you want to delete <strong>{selectedBundle?.title}</strong>?
                  </p>
                  <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
                  {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={submitting} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Delete'}
                    </button>
                  </div>
                </div>
              ) : modalMode === 'view' && selectedBundle ? (
                <div>
                  {/* Bundle Image in View Mode */}
                  {selectedBundle.image && (
                    <div className="mb-4">
                      <div className="rounded-lg overflow-hidden">
                        <img 
                          src={selectedBundle.image} 
                          alt={selectedBundle.title}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Bundle Name</h4>
                    <p className="text-gray-900 font-medium">{selectedBundle.title}</p>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Description</h4>
                    <p className="text-gray-700">{selectedBundle.description || 'No description'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Original Price</h4>
                      <p className="text-gray-900">PKR {selectedBundle.original_price.toLocaleString()}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Discounted Price</h4>
                      <p className="text-xl font-bold" style={{ color: BRAND_COLORS.deepRed }}>PKR {selectedBundle.discounted_price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">You Save</h4>
                    <p className="text-green-600 font-semibold">PKR {(selectedBundle.original_price - selectedBundle.discounted_price).toLocaleString()}</p>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Courses ({selectedBundle.total_courses})</h4>
                    <div className="space-y-2">
                      {selectedBundle.courses?.map((course) => (
                        <div key={course.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <HiBookOpen className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{course.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {error && <p className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">{error}</p>}
                  
                  {/* Bundle Image Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Image</label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Bundle preview"
                            className="w-full h-full object-cover"
                          />
                        ) : formData.image ? (
                          <img 
                            src={formData.image} 
                            alt="Bundle preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <HiPhotograph className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                          id="bundle-image"
                        />
                        <label
                          htmlFor="bundle-image"
                          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          {uploadingImage ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <HiUpload className="w-4 h-4" />
                          )}
                          {uploadingImage ? 'Uploading...' : 'Upload Image'}
                        </label>
                        {(imagePreview || formData.image) && (
                          <button
                            onClick={handleRemoveImage}
                            className="ml-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Recommended size: 400x400px. Max size: 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      placeholder="e.g., Professional Safety Pack"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      placeholder="Describe what makes this bundle special..."
                    />
                  </div>
                  
                  {/* Manual Price Inputs - NEW */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Original Price (PKR) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.original_price}
                        onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        placeholder="e.g., 50000.00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price (PKR) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.discounted_price}
                        onChange={(e) => setFormData({ ...formData, discounted_price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        placeholder="e.g., 35000.00"
                      />
                    </div>
                  </div>
                  
                  {/* Auto-calculated Savings */}
                  {formData.original_price > 0 && formData.discounted_price > 0 && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-700">💰 You Save:</span>
                        <span className="text-lg font-bold text-green-700">
                          PKR {getSavingsAmount().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-green-600">Discount:</span>
                        <span className="text-sm font-semibold text-green-600">{getDiscountPercentage()}% OFF</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Courses *</label>
                    <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                      {allCourses.length === 0 ? (
                        <p className="text-gray-500 text-sm">No courses available</p>
                      ) : (
                        allCourses.map((course) => (
                          <label key={course.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                            <div className="flex items-center gap-3 flex-1">
                              <input
                                type="checkbox"
                                checked={formData.selectedCourses.includes(course.id)}
                                onChange={() => handleCourseSelection(course.id)}
                                className="w-4 h-4 text-red-600 focus:ring-red-500"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800">{course.title}</p>
                                <p className="text-xs text-gray-400">Course ID: {course.id.substring(0, 8)}...</p>
                              </div>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formData.selectedCourses.length} courses selected</p>
                    <p className="text-xs text-gray-400 mt-1">Note: Courses are for reference only. Price is manually set above.</p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.status === 'active'}
                          onChange={() => setFormData({ ...formData, status: 'active' })}
                          className="w-4 h-4 text-red-600"
                        />
                        <span className="text-sm">Active</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.status === 'inactive'}
                          onChange={() => setFormData({ ...formData, status: 'inactive' })}
                          className="w-4 h-4 text-red-600"
                        />
                        <span className="text-sm">Inactive</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={submitting} className="flex-1 px-4 py-2 rounded-lg text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-colors hover:opacity-90" style={{ backgroundColor: BRAND_COLORS.deepRed }}>
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <HiCheck className="w-4 h-4" />}
                      {submitting ? 'Saving...' : (modalMode === 'edit' ? 'Update Bundle' : 'Create Bundle')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}