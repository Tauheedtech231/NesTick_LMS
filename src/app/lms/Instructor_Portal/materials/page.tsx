// app/lms/Instructor_Portal/materials/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, Upload, Download, FileText, Video, Image, MoreVertical, Trash2, Eye } from 'lucide-react';
import { getMaterials } from '../utils/demoData';
/* eslint-disable */

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const loadedMaterials = getMaterials();
    setMaterials(loadedMaterials);
    setFilteredMaterials(loadedMaterials);
  }, []);

  useEffect(() => {
    let filtered = materials;
    
    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.course.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(material => material.type === typeFilter);
    }
    
    if (courseFilter !== 'all') {
      filtered = filtered.filter(material => material.course === courseFilter);
    }
    
    setFilteredMaterials(filtered);
  }, [searchTerm, typeFilter, courseFilter, materials]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['application/pdf', 'video/mp4', 'application/vnd.ms-powerpoint', 'application/msword'];
    if (!validTypes.some(type => file.type.includes(type))) {
      alert('Please upload only PDF, video, slides, or document files');
      return;
    }

    setIsUploading(true);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Add to materials
          const newMaterial = {
            id: Date.now().toString(),
            title: file.name,
            type: getFileType(file.type),
            course: 'Mathematics - 10th Grade',
            module: 'New Module',
            uploadDate: new Date().toISOString().split('T')[0],
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            downloads: 0,
          };
          
          setMaterials([newMaterial, ...materials]);
          localStorage.setItem('instructor_materials', JSON.stringify([newMaterial, ...materials]));
          
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getFileType = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('video')) return 'video';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'slides';
    return 'document';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-500" />;
      case 'slides':
        return <Image className="w-5 h-5 text-amber-500" />;
      default:
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatFileSize = (size: string) => {
    return size;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Materials</h1>
          <p className="text-gray-600 mt-2">Upload and manage study materials for your courses</p>
        </div>
        <label className="flex items-center gap-2 px-4 py-2.5 bg-[#6B21A8] hover:bg-purple-700 text-white font-medium rounded-lg transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          Upload Material
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.mp4,.ppt,.pptx,.doc,.docx"
          />
        </label>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Uploading Material</h3>
              <span className="text-sm font-medium text-[#6B21A8]">{uploadProgress}%</span>
            </div>
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full rounded-full bg-[#6B21A8] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">Please wait while we upload your file...</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials by title or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="slides">Slides</option>
              <option value="document">Document</option>
            </select>
            
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
            >
              <option value="all">All Courses</option>
              <option value="Mathematics - 10th Grade">Mathematics</option>
              <option value="Physics - 10th Grade">Physics</option>
              <option value="Chemistry - 11th Grade">Chemistry</option>
              <option value="Biology - 12th Grade">Biology</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#6B21A8]">{materials.length}</div>
            <div className="text-sm text-gray-600">Total Materials</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#F59E0B]">
              {materials.filter(m => m.type === 'pdf').length}
            </div>
            <div className="text-sm text-gray-600">PDF Files</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#10B981]">
              {materials.filter(m => m.type === 'video').length}
            </div>
            <div className="text-sm text-gray-600">Videos</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#C4B5FD]">
              {materials.reduce((sum, m) => sum + m.downloads, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Downloads</div>
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <div key={material.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-gray-100 group-hover:bg-purple-50 transition-colors">
                      {getFileIcon(material.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          material.type === 'pdf' ? 'bg-red-100 text-red-800' :
                          material.type === 'video' ? 'bg-purple-100 text-purple-800' :
                          material.type === 'slides' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {material.type.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 line-clamp-1">{material.title}</h3>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Course</span>
                    <span className="font-medium text-gray-900">{material.course}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Module</span>
                    <span className="font-medium text-gray-900">{material.module}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Uploaded</span>
                    <span className="font-medium text-gray-900">{material.uploadDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Size</span>
                    <span className="font-medium text-gray-900">{formatFileSize(material.size)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Downloads</span>
                    <span className="font-medium text-gray-900">{material.downloads}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6B21A8] hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button className="p-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No materials found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your filters or upload new materials</p>
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-[#6B21A8] hover:bg-purple-700 text-white font-medium rounded-lg transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Upload Your First Material
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.mp4,.ppt,.pptx,.doc,.docx"
            />
          </label>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-4">Upload Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-purple-800 mb-3">Supported Formats</h4>
            <ul className="space-y-2 text-purple-700">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>PDF documents (max 10MB)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>MP4 videos (max 100MB)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>PowerPoint slides</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Word documents</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-purple-800 mb-3">Best Practices</h4>
            <ul className="space-y-2 text-purple-700">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Use descriptive file names</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Organize by module and topic</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Include clear instructions</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Update materials regularly</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}