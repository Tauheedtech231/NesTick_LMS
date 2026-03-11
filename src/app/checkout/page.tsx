"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiCheckCircle,
  HiArrowLeft,
  HiShoppingCart,
  HiUser,
  HiMail,
  HiPhone,
  HiLocationMarker,
  HiCreditCard,
  HiLockClosed,
  HiShieldCheck,
  HiTruck,
  HiCalendar,
  HiClock,
  HiExclamation,
  HiCheck,
  HiPencil,
  HiTrash,
  HiPlus
} from "react-icons/hi";
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaPaypal } from "react-icons/fa";
import { SiJcb, SiDiscover } from "react-icons/si";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* eslint-disable */

// Brand Colors
const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  charcoal: '#111111',
  teal: '#1FB6CB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444'
};

// Z-index constants
const Z_INDEX = {
  BASE: 1,
  NAVBAR: 100,
  DROPDOWN: 110,
  MODAL: 200,
  TOAST: 300
};

// Interface for cart item
interface CartItem {
  id: string;
  course_id: string;
  course_title: string;
  course_price: number;
  created_at: string;
}

// Interface for form data
interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  saveInfo: boolean;
}

// Animation variants
const fadeInUpVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 }
};

const fadeInVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const slideInRightVariants = {
  initial: { x: 50, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 50, opacity: 0 }
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [cartMessage, setCartMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [showOrderSummary, setShowOrderSummary] = useState(true);
  
  // Form data
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    country: 'Pakistan',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveInfo: false
  });

  // Form errors
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});

  // Load saved email and cart items
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setUserEmail(savedEmail);
      setFormData(prev => ({ ...prev, email: savedEmail }));
    }
    loadCartItems();
  }, []);

  // Load cart items from API
  const loadCartItems = async () => {
    const savedEmail = localStorage.getItem('userEmail');
    if (!savedEmail) {
      router.push('/courses');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/student/cart?email=${encodeURIComponent(savedEmail)}`);
      const result = await response.json();
      if (result.success) {
        // Normalize prices
        const processedItems = (result.data.items || []).map((item: any) => ({
          ...item,
          course_price: normalizePrice(item.course_price)
        }));
        setCartItems(processedItems);
        
        if (processedItems.length === 0) {
          router.push('/courses');
        }
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
      setCartMessage({
        type: 'error',
        text: 'Failed to load cart items'
      });
    } finally {
      setLoading(false);
    }
  };

  // Normalize price (fix for 3,400,000 -> 34,000)
  const normalizePrice = (price: any): number => {
    if (!price) return 0;
    let numPrice = Number(price);
    if (isNaN(numPrice)) return 0;
    if (numPrice > 100000) {
      numPrice = numPrice / 100;
    }
    return numPrice;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString()}`;
  };

  // Calculate cart totals
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.course_price, 0);
  const tax = cartSubtotal * 0.05; // 5% tax
  const total = cartSubtotal + tax;

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently added';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Recently added';
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name as keyof CheckoutFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate form step
  const validateStep = (step: number): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};

    if (step === 1) {
      // Contact Information
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email address';
      }

      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }

      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }

      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
        newErrors.phone = 'Invalid phone number';
      }
    } else if (step === 2) {
      // Billing Address
      if (!formData.address) {
        newErrors.address = 'Address is required';
      }
      if (!formData.city) {
        newErrors.city = 'City is required';
      }
      if (!formData.state) {
        newErrors.state = 'State is required';
      }
      if (!formData.zipCode) {
        newErrors.zipCode = 'ZIP code is required';
      }
    } else if (step === 3) {
      // Payment Information
      if (!formData.cardNumber) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^[0-9]{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Invalid card number';
      }

      if (!formData.cardName) {
        newErrors.cardName = 'Name on card is required';
      }

      if (!formData.expiryDate) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Invalid format (MM/YY)';
      }

      if (!formData.cvv) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^[0-9]{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = 'Invalid CVV';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setActiveStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!validateStep(3)) return;

    setProcessing(true);
    setCartMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear cart after successful order
      const response = await fetch(`/api/student/cart/remove?email=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCartMessage({
          type: 'success',
          text: 'Order placed successfully! Redirecting...'
        });

        setTimeout(() => {
          router.push('/order-confirmation');
        }, 2000);
      }
    } catch (error) {
      setCartMessage({
        type: 'error',
        text: 'Failed to place order. Please try again.'
      });
    } finally {
      setProcessing(false);
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deepRed mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      {/* Toast Message */}
      <AnimatePresence>
        {cartMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-[300]"
            style={{ 
              backgroundColor: cartMessage.type === 'success' ? '#f0fdf4' : 
                             cartMessage.type === 'error' ? '#fef2f2' : '#fff7ed',
              color: cartMessage.type === 'success' ? '#166534' : 
                     cartMessage.type === 'error' ? '#991b1b' : '#9a3412',
              border: cartMessage.type === 'success' ? '1px solid #86efac' : 
                      cartMessage.type === 'error' ? '1px solid #fecaca' : '1px solid #fed7aa'
            }}
          >
            {cartMessage.type === 'success' ? (
              <HiCheckCircle className="w-5 h-5 text-green-500" />
            ) : cartMessage.type === 'error' ? (
              <HiExclamation className="w-5 h-5 text-red-500" />
            ) : (
              <HiExclamation className="w-5 h-5 text-orange-500" />
            )}
            <span className="font-medium">{cartMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/courses"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Checkout
          </h1>
          <p className="text-gray-600 mt-2">
            Complete your purchase by providing your details
          </p>
        </div>

        {/* Progress Steps - Mobile Responsive */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="relative">
                  <div 
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold text-sm md:text-base transition-all duration-300 ${
                      step < activeStep
                        ? 'bg-green-500 text-white'
                        : step === activeStep
                        ? 'bg-[#B11217] text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step < activeStep ? (
                      <HiCheck className="w-4 h-4 md:w-5 md:h-5" />
                    ) : (
                      step
                    )}
                  </div>
                  <p className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs md:text-sm whitespace-nowrap text-gray-600">
                    {step === 1 ? 'Contact' : step === 2 ? 'Address' : 'Payment'}
                  </p>
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-0.5 mx-2 md:mx-4 ${
                    step < activeStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <motion.div
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              className="bg-white rounded-2xl shadow-md p-4 md:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#B11217] text-white flex items-center justify-center text-sm">
                    1
                  </span>
                  Contact Information
                </h2>
                {activeStep > 1 && (
                  <button
                    onClick={() => setActiveStep(1)}
                    className="text-sm text-[#B11217] hover:text-[#8f0e12] flex items-center gap-1"
                  >
                    <HiPencil className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {activeStep === 1 ? (
                  <motion.div
                    key="contact-form"
                    variants={fadeInUpVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <HiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none text-sm md:text-base
                            ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#B11217]'}`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <HiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="John"
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none text-sm md:text-base
                              ${errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#B11217]'}`}
                          />
                        </div>
                        {errors.firstName && (
                          <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <HiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Doe"
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none text-sm md:text-base
                              ${errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#B11217]'}`}
                          />
                        </div>
                        {errors.lastName && (
                          <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <HiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+92 300 1234567"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none text-sm md:text-base
                            ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#B11217]'}`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <button
                      onClick={handleNextStep}
                      className="w-full py-3 bg-[#B11217] text-white rounded-xl font-semibold hover:bg-[#8f0e12] transition-all duration-300 hover:shadow-lg active:scale-95"
                    >
                      Continue to Shipping
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={fadeInVariants}
                    initial="initial"
                    animate="animate"
                    className="bg-gray-50 p-4 rounded-xl"
                  >
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span> {formData.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Phone:</span> {formData.phone}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Billing Address */}
            <motion.div
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-md p-4 md:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                    activeStep >= 2 ? 'bg-[#B11217] text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    2
                  </span>
                  Billing Address
                </h2>
                {activeStep > 2 && (
                  <button
                    onClick={() => setActiveStep(2)}
                    className="text-sm text-[#B11217] hover:text-[#8f0e12] flex items-center gap-1"
                  >
                    <HiPencil className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {activeStep === 2 ? (
                  <motion.div
                    key="address-form"
                    variants={fadeInUpVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#B11217] outline-none transition-all duration-300 text-sm md:text-base"
                      >
                        <option value="Pakistan">Pakistan</option>
                        <option value="UAE">UAE</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <HiLocationMarker className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="123 Main St"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none text-sm md:text-base
                            ${errors.address ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#B11217]'}`}
                        />
                      </div>
                      {errors.address && (
                        <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Karachi"
                          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none text-sm md:text-base
                            ${errors.city ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#B11217]'}`}
                        />
                        {errors.city && (
                          <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="Sindh"
                          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none text-sm md:text-base
                            ${errors.state ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#B11217]'}`}
                        />
                        {errors.state && (
                          <p className="text-xs text-red-500 mt-1">{errors.state}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP / Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="75000"
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none text-sm md:text-base
                          ${errors.zipCode ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#B11217]'}`}
                      />
                      {errors.zipCode && (
                        <p className="text-xs text-red-500 mt-1">{errors.zipCode}</p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handlePrevStep}
                        className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleNextStep}
                        className="flex-1 py-3 bg-[#B11217] text-white rounded-xl font-semibold hover:bg-[#8f0e12] transition-all duration-300 hover:shadow-lg active:scale-95"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </motion.div>
                ) : activeStep > 2 ? (
                  <motion.div
                    variants={fadeInVariants}
                    initial="initial"
                    animate="animate"
                    className="bg-gray-50 p-4 rounded-xl"
                  >
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Address:</span> {formData.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">City:</span> {formData.city}, {formData.state} {formData.zipCode}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Country:</span> {formData.country}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>

            {/* Payment Information */}
            <motion.div
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-md p-4 md:p-6"
            >
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 mb-4">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                  activeStep >= 3 ? 'bg-[#B11217] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </span>
                Payment Information
              </h2>

              <AnimatePresence mode="wait">
                {activeStep === 3 ? (
                  <motion.div
                    key="payment-form"
                    variants={fadeInUpVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-4"
                  >
                    {/* Payment Methods */}
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-700 mb-3">Accepted Cards</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <FaCcVisa className="w-10 h-10 text-blue-600" />
                        <FaCcMastercard className="w-10 h-10 text-red-600" />
                        <FaCcAmex className="w-10 h-10 text-blue-400" />
                        <SiJcb className="w-10 h-10 text-blue-800" />
                        <SiDiscover className="w-10 h-10 text-orange-600" />
                        <FaPaypal className="w-10 h-10 text-blue-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <HiCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={(e) => {
                            const formatted = formatCardNumber(e.target.value);
                            setFormData(prev => ({ ...prev, cardNumber: formatted }));
                          }}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none text-sm md:text-base
                            ${errors.cardNumber ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#B11217]'}`}
                        />
                      </div>
                      {errors.cardNumber && (
                        <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name on Card <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        placeholder="JOHN DOE"
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none text-sm md:text-base uppercase
                          ${errors.cardName ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#B11217]'}`}
                      />
                      {errors.cardName && (
                        <p className="text-xs text-red-500 mt-1">{errors.cardName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={(e) => {
                            const formatted = formatExpiryDate(e.target.value);
                            setFormData(prev => ({ ...prev, expiryDate: formatted }));
                          }}
                          placeholder="MM/YY"
                          maxLength={5}
                          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none text-sm md:text-base
                            ${errors.expiryDate ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#B11217]'}`}
                        />
                        {errors.expiryDate && (
                          <p className="text-xs text-red-500 mt-1">{errors.expiryDate}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <HiLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="password"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            maxLength={4}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none text-sm md:text-base
                              ${errors.cvv ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-[#B11217]'}`}
                          />
                        </div>
                        {errors.cvv && (
                          <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="saveInfo"
                        id="saveInfo"
                        checked={formData.saveInfo}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#B11217] border-gray-300 rounded focus:ring-[#B11217]"
                      />
                      <label htmlFor="saveInfo" className="ml-2 text-sm text-gray-600">
                        Save this information for next time
                      </label>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                      <HiShieldCheck className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Secure Payment</p>
                        <p className="text-xs text-blue-600">
                          Your payment information is encrypted and secure. We never store your full card details.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handlePrevStep}
                        className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                      >
                        Back
                      </button>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={processing}
                        className="flex-1 py-3 bg-gradient-to-r from-[#B11217] to-[#8f0e12] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </div>
                        ) : (
                          'Place Order'
                        )}
                      </button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Order Summary - Right Side (1/3 width on desktop) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Mobile Toggle Button */}
              <button
                onClick={() => setShowOrderSummary(!showOrderSummary)}
                className="lg:hidden w-full bg-white rounded-xl shadow-md p-4 mb-4 flex items-center justify-between"
              >
                <span className="font-semibold">Order Summary</span>
                <HiChevronDown className={`w-5 h-5 transition-transform duration-300 ${
                  showOrderSummary ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Order Summary Content */}
              <AnimatePresence>
                {(showOrderSummary || window.innerWidth >= 1024) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="bg-white rounded-2xl shadow-md p-4 md:p-6"
                  >
                    <h2 className="text-lg md:text-xl font-bold mb-4">Order Summary</h2>

                    {/* Cart Items */}
                    <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 text-sm md:text-base line-clamp-2">
                              {item.course_title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Added {formatDate(item.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[#B11217] text-sm md:text-base">
                              {formatCurrency(item.course_price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(cartSubtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Tax (5%)</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(tax)}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">Total</span>
                          <span className="text-xl font-bold text-[#B11217]">
                            {formatCurrency(total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <HiTruck className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Free Course Access</p>
                          <p className="text-xs text-gray-500">
                            You'll get instant access to all courses after payment
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 mt-3">
                        <HiShieldCheck className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Secure Checkout</p>
                          <p className="text-xs text-gray-500">
                            Your information is protected by SSL encryption
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Money Back Guarantee */}
                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                        <HiShieldCheck className="w-4 h-4 text-green-500" />
                        30-day money-back guarantee
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Chevron Down Icon Component
const HiChevronDown = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);