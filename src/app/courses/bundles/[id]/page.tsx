/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  HiArrowLeft, 
  HiShoppingBag, 
  HiCheckCircle,
  HiGift,
  HiClock,
  HiAcademicCap,
  HiBookOpen,
  HiStar,
  HiOutlineGift,
  HiChevronDown,
  HiLocationMarker,
  HiMail,
  HiExclamation,
  HiCheck,
  HiX,
  HiTrash
} from "react-icons/hi";
import { MdLanguage } from "react-icons/md";
import { Loader2, GraduationCap, Target, Award } from "lucide-react";

// Interfaces
interface Bundle {
  id: string;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  total_courses: number;
  courses: Course[];
  status: string;
  image: string;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  duration?: string;
  level?: string;
  category?: string;
  price?: number;
}

interface CartItem {
  id: string;
  course_id: string;
  course_title: string;
  course_price: number;
  created_at: string;
  is_bundle_item?: boolean;
  bundle_name?: string;
  bundle_discounted_price?: number;
}

// Email Popup Component (Without Animations)
const EmailPopup = ({ isOpen, onClose, onConfirm, courseTitle, savedEmail }: any) => {
  const [email, setEmail] = useState(savedEmail || '');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (savedEmail) {
        setEmail(savedEmail);
        setIsValid(true);
      }
    } else {
      document.body.style.overflow = 'unset';
      setEmail(savedEmail || '');
      setError('');
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, savedEmail]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setError('Please enter a valid email address');
      setIsValid(false);
    } else if (!value) {
      setError('');
      setIsValid(false);
    } else {
      setError('');
      setIsValid(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(email)) {
      onConfirm(email);
    } else {
      setError('Please enter a valid email address');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-[2000]">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-[#0B1C3D] to-[#1E3A8A] p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiMail className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {savedEmail ? 'Confirm Your Email' : 'Enter Your Email'}
          </h3>
          <p className="text-sm text-blue-100">
            To add <span className="font-semibold">"{courseTitle}"</span> to bag
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="your@email.com"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none ${
                  error ? 'border-red-300 bg-red-50' : isValid ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
                autoFocus={!savedEmail}
                readOnly={!!savedEmail}
              />
              {isValid && <HiCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />}
            </div>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className={`flex-1 px-4 py-3 rounded-xl font-medium text-white transition-all cursor-pointer ${
                isValid ? 'bg-gradient-to-r from-[#B11217] to-[#8f0e12] hover:shadow-lg' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {savedEmail ? 'Confirm & Add to Bag' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Hard-coded curriculum and highlights
const getCourseCurriculum = (courseTitle: string) => {
  const lowerTitle = courseTitle.toLowerCase();
  if (lowerTitle.includes('weld')) {
    return [
      'Week 1-2: Introduction to Welding & Safety Protocols',
      'Week 3-4: Arc Welding (SMAW) - Basics to Advanced',
      'Week 5-6: MIG Welding (GMAW) - Techniques & Applications',
      'Week 7-8: TIG Welding (GTAW) - Precision Welding',
      'Week 9: Pipe Welding & Position Welding',
      'Week 10: Final Project & Certification Exam'
    ];
  }
  if (lowerTitle.includes('pipe')) {
    return [
      'Week 1-2: Pipe Fitting Fundamentals & Safety',
      'Week 3-4: Pipe Materials, Types & Selection',
      'Week 5-6: Pipe Cutting, Threading & Joining',
      'Week 7: Pipe System Design & Layout Planning',
      'Week 8: Practical Workshop & Final Assessment'
    ];
  }
  return [
    'Week 1-2: Introduction to Core Concepts',
    'Week 3-4: Practical Skills Development',
    'Week 5-6: Advanced Techniques & Applications',
    'Week 7-8: Industry Best Practices',
    'Week 9: Project Work & Assessment',
    'Week 10: Final Certification'
  ];
};

const getCourseHighlights = (courseTitle: string): string[] => {
  const lowerTitle = courseTitle.toLowerCase();
  if (lowerTitle.includes('weld')) {
    return [
      'Master MIG, TIG & Arc welding techniques',
      'Hands-on practice with industrial equipment',
      'Weld quality inspection & testing',
      'Safety protocols & PPE usage',
      'Industry-recognized certification'
    ];
  }
  if (lowerTitle.includes('pipe')) {
    return [
      'Pipe cutting, threading & joining techniques',
      'Blueprint reading & interpretation',
      'Pipe system design & layout',
      'Safety standards & compliance',
      'Practical workshop training'
    ];
  }
  return [
    'Comprehensive curriculum covering all essential topics',
    'Hands-on practical training sessions',
    'Expert instructors with industry experience',
    'Industry-recognized certification',
    'Job-ready skills development'
  ];
};

const getCourseDetails = (course: Course) => {
  const lowerTitle = course.title.toLowerCase();
  return {
    duration: lowerTitle.includes('weld') ? '10 Weeks' : lowerTitle.includes('safety') ? '6 Weeks' : '8 Weeks',
    level: 'Intermediate',
    schedule: 'Flexible Schedule',
    location: 'Online & Campus',
    language: 'English & Urdu',
    rating: 4.8
  };
};

export default function BundleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToBag, setAddingToBag] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'curriculum'>('overview');
  
  const [userEmail, setUserEmail] = useState<string>('');
  const [isEmailPopupOpen, setIsEmailPopupOpen] = useState(false);
  const [cartMessage, setCartMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [removingFromCart, setRemovingFromCart] = useState<string | null>(null);

  const bundleId = params.id as string;

  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) setUserEmail(savedEmail);
  }, []);

  useEffect(() => {
    if (userEmail) fetchCartItems();
  }, [userEmail]);

  const fetchCartItems = async () => {
    try {
      const response = await fetch(`/api/student/cart?email=${encodeURIComponent(userEmail)}`);
      const result = await response.json();
      if (result.success) {
        setCartItems(result.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const fetchBundleDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/bundles/${bundleId}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setBundle(result.data);
      } else {
        setError(result.error || 'Bundle not found');
      }
    } catch (err) {
      console.error('Error fetching bundle:', err);
      setError('Failed to load bundle details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBundleDetails();
  }, [bundleId]);

  // Format currency
  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return 'Rs 0';
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('PKR', 'Rs');
  };

  const handleAddToBagClick = () => {
    if (!bundle) return;
    if (userEmail) {
      addBundleToBag(userEmail);
    } else {
      setIsEmailPopupOpen(true);
    }
  };

  const addBundleToBag = async (email: string) => {
    if (!bundle) return;
    setAddingToBag(true);
    setCartMessage(null);

    try {
      let addedCount = 0;
      for (const course of (bundle.courses || [])) {
        const response = await fetch('/api/student/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentEmail: email,
            courseId: course.id,
            courseTitle: course.title,
            coursePrice: 0,
            isBundleItem: true,
            bundleId: bundle.id,
            bundleName: bundle.title,
            bundleDiscountedPrice: bundle.discounted_price
          })
        });
        
        const result = await response.json();
        if (result.success) addedCount++;
      }
      
      if (addedCount > 0) {
        await fetchCartItems();
        setCartMessage({
          type: 'success',
          text: `✓ Bundle added to bag! You pay ${formatCurrency(bundle.discounted_price)} for ${addedCount} courses`
        });
        setTimeout(() => setCartMessage(null), 3000);
      } else {
        setCartMessage({ type: 'error', text: 'Failed to add bundle to bag' });
      }
    } catch (error: any) {
      setCartMessage({ type: 'error', text: error.message || 'Failed to add to bag' });
    } finally {
      setAddingToBag(false);
    }
  };

  const handleRemoveFromCart = async (cartId: string, courseId: string) => {
    if (!userEmail) return;
    
    setRemovingFromCart(cartId);
    try {
      const response = await fetch(
        `/api/student/cart/remove?id=${cartId}&email=${encodeURIComponent(userEmail)}`,
        { method: 'DELETE' }
      );

      const result = await response.json();

      if (result.success) {
        setCartItems(prev => prev.filter(item => item.id !== cartId));
        setCartMessage({
          type: 'success',
          text: 'Item removed from bag'
        });
        setTimeout(() => setCartMessage(null), 3000);
      } else {
        throw new Error(result.error || 'Failed to remove item');
      }
    } catch (error: any) {
      setCartMessage({
        type: 'error',
        text: error.message || 'Failed to remove item'
      });
    } finally {
      setRemovingFromCart(null);
    }
  };

  const handleEmailConfirm = async (email: string) => {
    setIsEmailPopupOpen(false);
    setUserEmail(email);
    localStorage.setItem('userEmail', email);
    await addBundleToBag(email);
  };

  const toggleCourseExpand = (courseId: string) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  // Calculate cart totals from database values
  const cartOriginalTotal = cartItems.reduce((sum, item) => sum + (item.course_price || 0), 0);
  
  // Calculate discounted total for bundle items
  const bundleItems = cartItems.filter(item => item.is_bundle_item);
  const nonBundleItems = cartItems.filter(item => !item.is_bundle_item);
  
  const discountedTotal = (() => {
    let total = nonBundleItems.reduce((sum, item) => sum + (item.course_price || 0), 0);
    // Add bundle discounted prices (each bundle has its own discounted price)
    const bundlePrices = new Map();
    bundleItems.forEach(item => {
      if (item.bundle_discounted_price && !bundlePrices.has(item.bundle_name)) {
        bundlePrices.set(item.bundle_name, item.bundle_discounted_price);
      }
    });
    for (const price of bundlePrices.values()) {
      total += price;
    }
    return total;
  })();
  
  const totalSavings = cartOriginalTotal - discountedTotal;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#B11217] mx-auto" />
          <p className="mt-4 text-gray-500">Loading bundle details...</p>
        </div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-20">
        <div className="text-center max-w-md mx-auto p-6">
          <HiBookOpen className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Bundle Not Found</h2>
          <p className="text-gray-500 mb-6">{error || 'The bundle you are looking for does not exist.'}</p>
          <Link href="/courses" className="inline-flex items-center px-6 py-3 bg-[#B11217] text-white rounded-lg hover:bg-[#8f0e12] transition cursor-pointer">
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const savings = bundle.original_price - bundle.discounted_price;

  return (
    // Added pt-20 to account for fixed navbar height
    <div className="min-h-screen bg-white pt-20">
      {/* Email Popup */}
      {isEmailPopupOpen && (
        <EmailPopup
          isOpen={isEmailPopupOpen}
          onClose={() => setIsEmailPopupOpen(false)}
          onConfirm={handleEmailConfirm}
          courseTitle={bundle.title}
          savedEmail={userEmail}
        />
      )}

      {/* Toast Message - No animations */}
      {cartMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-[1001]"
          style={{
            backgroundColor: cartMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: cartMessage.type === 'success' ? '#166534' : '#991b1b',
            border: cartMessage.type === 'success' ? '1px solid #86efac' : '1px solid #fecaca'
          }}
        >
          {cartMessage.type === 'success' ? <HiCheckCircle className="w-5 h-5 text-green-500" /> : <HiExclamation className="w-5 h-5 text-red-500" />}
          <span className="font-medium text-sm">{cartMessage.text}</span>
        </div>
      )}

      {/* Cart Button - No animations */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[999]">
        <button
          onClick={() => setShowCartSidebar(true)}
          className="relative bg-gradient-to-r from-[#B11217] to-[#8f0e12] text-white p-4 rounded-l-full rounded-r-none shadow-xl hover:shadow-2xl transition cursor-pointer"
        >
          <HiShoppingBag className="w-6 h-6" />
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[24px] h-6 bg-white text-[#B11217] text-xs font-bold rounded-full flex items-center justify-center px-1.5 shadow-lg border-2 border-[#B11217]">
              {cartItems.length > 99 ? '99+' : cartItems.length}
            </span>
          )}
        </button>
      </div>

  {/* Cart Sidebar - With Bundle Page Style Price Section */}
{showCartSidebar && (
  <>
    <div 
      onClick={() => setShowCartSidebar(false)}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[998] cursor-pointer"
    />
    <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto z-[999]">
      <div className="sticky top-0 bg-[#0B1C3D] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Your Bag</h2>
            <p className="text-sm text-white/80">{cartItems.length} {cartItems.length === 1 ? 'Course' : 'Courses'}</p>
          </div>
          <button onClick={() => setShowCartSidebar(false)} className="p-2 hover:bg-white/10 rounded-lg cursor-pointer">
            <HiX className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
      <div className="p-6">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <HiShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your bag is empty</h3>
            <p className="text-gray-500 mb-6">Start adding courses to your learning journey</p>
            <button onClick={() => setShowCartSidebar(false)} className="px-6 py-2 bg-[#B11217] text-white rounded-lg cursor-pointer">
              Browse Courses
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg">
                      <HiBookOpen className="w-5 h-5 text-[#1E3A8A]" />
                    </div>
                    <div className="flex-1">
                      {(item.is_bundle_item === true || item.bundle_name) && (
                        <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full inline-block mb-1">
                          🎁 {item.bundle_name || 'Bundle'} Package
                        </span>
                      )}
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.course_title}</h3>
                      <div className="flex items-center justify-between mt-2">
                        {(item.is_bundle_item === true || item.bundle_name) ? (
                          <span className="text-xs text-green-600 font-medium">✓ Included in bundle</span>
                        ) : (
                          <span className="font-bold text-[#B11217] text-sm">{formatCurrency(item.course_price)}</span>
                        )}
                        <button
                          onClick={() => handleRemoveFromCart(item.id, item.course_id)}
                          disabled={removingFromCart === item.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          {removingFromCart === item.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <HiTrash className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bundle Savings Summary - Like Bundle Page */}
            {(cartItems.some(item => item.is_bundle_item === true) || 
              cartItems.some(item => item.bundle_name)) && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <HiGift className="w-4 h-4 text-green-600" />
                  <p className="text-sm font-semibold text-green-700">
                    Bundle Savings Applied!
                  </p>
                </div>
                <p className="text-xs text-green-600">
                  You only pay the discounted bundle price for all courses in the bundle.
                </p>
              </div>
            )}

            {/* 🎯 PRICE SECTION - Same as Bundle Detail Page */}
            <div className="border-t border-gray-200 pt-6 mt-4">
              {/* Original Price with Strikethrough */}
              {cartOriginalTotal > discountedTotal && (
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm text-gray-500">Original Price:</span>
                  <span className="text-base text-gray-400 line-through">
                    {formatCurrency(cartOriginalTotal)}
                  </span>
                </div>
              )}

              {/* Discounted/Savings Badge */}
              {totalSavings > 0 && (
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-green-600 font-medium">Bundle Savings:</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                    Save {formatCurrency(totalSavings)}
                  </span>
                </div>
              )}


              {/* Additional Savings Message */}
              {totalSavings > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                  <p className="text-xs text-green-700 flex items-center gap-2">
                    <HiCheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>You're saving <strong>{formatCurrency(totalSavings)}</strong> with this bundle!</span>
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setShowCartSidebar(false);
                  router.push('/checkout');
                }}
                className="w-full py-3 bg-gradient-to-r from-[#B11217] to-[#8f0e12] text-white rounded-lg font-semibold hover:shadow-lg transition-all cursor-pointer"
              >
                Proceed to Checkout →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  </>
)}
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button and Add to Bag */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <Link href="/courses" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition cursor-pointer">
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Courses
          </Link>

          <button
            onClick={handleAddToBagClick}
            disabled={addingToBag}
            className="inline-flex items-center px-6 py-2.5 bg-[#B11217] text-white rounded-lg font-semibold hover:bg-[#8f0e12] transition gap-2 cursor-pointer disabled:opacity-50"
          >
            {addingToBag ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <HiShoppingBag className="w-5 h-5" />
                Add Bundle to Bag
              </>
            )}
          </button>
        </div>

        {/* Bundle Header */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            {bundle.image ? (
              <img 
                src={bundle.image} 
                alt={bundle.title}
                className="w-full h-80 object-cover"
              />
            ) : (
              <div className="w-full h-80 bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center">
                <HiOutlineGift className="w-32 h-32 text-yellow-500" />
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{bundle.title}</h1>
            <p className="text-gray-600 text-base mb-6">{bundle.description}</p>
            
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl lg:text-4xl font-bold text-[#B11217]">
                {formatCurrency(bundle.discounted_price)}
              </span>
              <span className="text-base text-gray-400 line-through">
                {formatCurrency(bundle.original_price)}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Save {formatCurrency(savings)}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 text-gray-600">
                <HiBookOpen className="w-5 h-5 text-[#1E3A8A]" />
                <span>{bundle.total_courses} Professional Courses</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <HiStar className="w-5 h-5 text-yellow-500" />
                <span>4.8 Rating</span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-800 flex items-start gap-2">
                <HiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>You only pay <strong>{formatCurrency(bundle.discounted_price)}</strong> for all {bundle.total_courses} courses. That's <strong>Save {formatCurrency(savings)}</strong> compared to buying individually!</span>
              </p>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-[#B11217]" />
              Courses in this Bundle ({bundle.total_courses})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {bundle.courses && bundle.courses.map((course, index) => {
              const isExpanded = expandedCourse === course.id;
              const courseDetails = getCourseDetails(course);
              const curriculum = getCourseCurriculum(course.title);
              const highlights = getCourseHighlights(course.title);
              
              return (
                <div key={course.id} className="p-6 hover:bg-gray-50 transition">
                  <button
                    onClick={() => toggleCourseExpand(course.id)}
                    className="w-full text-left flex items-start justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-8 h-8 bg-[#1E3A8A]/10 rounded-lg flex items-center justify-center font-bold text-[#1E3A8A]">
                          {index + 1}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-800">{course.title}</h3>
                      </div>
                      <p className="text-gray-500 text-sm line-clamp-2">{course.description}</p>
                      
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <HiClock className="w-3 h-3" />
                          {courseDetails.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <HiAcademicCap className="w-3 h-3" />
                          {courseDetails.level}
                        </span>
                      </div>
                    </div>
                    <HiChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="mt-4">
                      <div className="pt-4 border-t border-gray-200">
                        {/* Tabs */}
                        <div className="flex gap-2 mb-4 border-b border-gray-200">
                          {['overview', 'curriculum'].map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setSelectedTab(tab as any)}
                              className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                                selectedTab === tab
                                  ? 'text-[#B11217] border-b-2 border-[#B11217]'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                          ))}
                        </div>

                        <div className="space-y-4">
                          {selectedTab === 'overview' && (
                            <>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                  <HiClock className="w-4 h-4 text-[#1E3A8A]" />
                                  <div>
                                    <p className="text-xs text-gray-500">Duration</p>
                                    <p className="text-sm font-medium">{courseDetails.duration}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                  <HiAcademicCap className="w-4 h-4 text-[#1E3A8A]" />
                                  <div>
                                    <p className="text-xs text-gray-500">Level</p>
                                    <p className="text-sm font-medium">{courseDetails.level}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                  <HiLocationMarker className="w-4 h-4 text-[#1E3A8A]" />
                                  <div>
                                    <p className="text-xs text-gray-500">Location</p>
                                    <p className="text-sm font-medium">{courseDetails.location}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                  <MdLanguage className="w-4 h-4 text-[#1E3A8A]" />
                                  <div>
                                    <p className="text-xs text-gray-500">Language</p>
                                    <p className="text-sm font-medium">{courseDetails.language}</p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                  <Target className="w-4 h-4" />
                                  What You'll Learn
                                </h4>
                                <ul className="space-y-2">
                                  {highlights.map((highlight, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                      <HiCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                      {highlight}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </>
                          )}

                          {selectedTab === 'curriculum' && (
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                Course Curriculum
                              </h4>
                              <div className="space-y-2">
                                {curriculum.map((week, idx) => (
                                  <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                                    <HiCheckCircle className="w-4 h-4 text-[#1E3A8A] flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-700">{week}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}