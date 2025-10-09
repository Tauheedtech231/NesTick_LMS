"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Star, 
  Clock, 
  Users, 
  Search, 
  BookOpen, 
  Code,
  Palette,
  Database,
  Briefcase,
  Settings,
  Book,
  Filter,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Course data with categories
const coursesData = [
  // Development
  {
    id: 1,
    title: "Full Stack Web Development",
    description: "Master HTML, CSS, JavaScript, React, Node.js and build real-world projects",
    category: "Development",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    duration: "12 weeks",
    level: "Intermediate",
    students: 2540,
    rating: 4.8,
    price: "$199",
    instructor: "Sarah Johnson",
    featured: true
  },
  {
    id: 2,
    title: "Python & Django Mastery",
    description: "Learn Python programming and Django framework for web applications",
    category: "Development",
    image: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    duration: "10 weeks",
    level: "Beginner",
    students: 1870,
    rating: 4.6,
    price: "$149",
    instructor: "Mike Chen",
    featured: false
  },
  {
    id: 3,
    title: "React Native Mobile Development",
    description: "Build cross-platform mobile apps with React Native and JavaScript",
    category: "Development",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    duration: "8 weeks",
    level: "Intermediate",
    students: 1620,
    rating: 4.7,
    price: "$179",
    instructor: "Alex Rodriguez",
    featured: true
  },
  // Design
  {
    id: 4,
    title: "UI/UX Design Fundamentals",
    description: "Learn user-centered design principles and create stunning interfaces",
    category: "Design",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80",
    duration: "6 weeks",
    level: "Beginner",
    students: 2310,
    rating: 4.9,
    price: "$129",
    instructor: "Emma Wilson",
    featured: false
  },
  {
    id: 5,
    title: "Adobe Creative Suite Pro",
    description: "Master Photoshop, Illustrator, and After Effects for professional design",
    category: "Design",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80",
    duration: "8 weeks",
    level: "Advanced",
    students: 1450,
    rating: 4.8,
    price: "$229",
    instructor: "David Kim",
    featured: true
  },
  // Data Science
  {
    id: 6,
    title: "Machine Learning Fundamentals",
    description: "Introduction to ML algorithms, data preprocessing, and model deployment",
    category: "Data Science",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    duration: "14 weeks",
    level: "Intermediate",
    students: 1980,
    rating: 4.7,
    price: "$249",
    instructor: "Dr. Lisa Wang",
    featured: false
  },
  {
    id: 7,
    title: "Data Analysis with Python",
    description: "Learn Pandas, NumPy, and data visualization for insightful analysis",
    category: "Data Science",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    duration: "8 weeks",
    level: "Beginner",
    students: 1760,
    rating: 4.5,
    price: "$159",
    instructor: "Robert Brown",
    featured: false
  },
  // Business
  {
    id: 8,
    title: "Digital Marketing Strategy",
    description: "Comprehensive digital marketing course covering SEO, social media, and analytics",
    category: "Business",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2015&q=80",
    duration: "6 weeks",
    level: "Beginner",
    students: 2890,
    rating: 4.6,
    price: "$139",
    instructor: "Sophia Martinez",
    featured: true
  },
  {
    id: 9,
    title: "Business Analytics",
    description: "Transform data into business insights and make data-driven decisions",
    category: "Business",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    duration: "10 weeks",
    level: "Intermediate",
    students: 1670,
    rating: 4.8,
    price: "$189",
    instructor: "James Wilson",
    featured: false
  },
  // IT & Software
  {
    id: 10,
    title: "AWS Cloud Practitioner",
    description: "Master AWS cloud services and prepare for certification",
    category: "IT & Software",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80",
    duration: "8 weeks",
    level: "Intermediate",
    students: 1540,
    rating: 4.7,
    price: "$199",
    instructor: "Thomas Lee",
    featured: false
  },
  {
    id: 11,
    title: "Cybersecurity Fundamentals",
    description: "Learn essential cybersecurity concepts and threat protection",
    category: "IT & Software",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    duration: "12 weeks",
    level: "Beginner",
    students: 1980,
    rating: 4.9,
    price: "$179",
    instructor: "Maria Garcia",
    featured: true
  },
  {
    id: 12,
    title: "DevOps Engineering",
    description: "CI/CD, Docker, Kubernetes, and infrastructure as code",
    category: "IT & Software",
    image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80",
    duration: "14 weeks",
    level: "Advanced",
    students: 1320,
    rating: 4.8,
    price: "$279",
    instructor: "Daniel Taylor",
    featured: false
  }
];

const categories = [
  { name: "All", icon: Book, count: coursesData.length, color: "from-gray-600 to-gray-800" },
  { name: "Development", icon: Code, count: coursesData.filter(c => c.category === "Development").length, color: "from-blue-500 to-blue-700" },
  { name: "Design", icon: Palette, count: coursesData.filter(c => c.category === "Design").length, color: "from-pink-500 to-pink-700" },
  { name: "Data Science", icon: Database, count: coursesData.filter(c => c.category === "Data Science").length, color: "from-green-500 to-green-700" },
  { name: "Business", icon: Briefcase, count: coursesData.filter(c => c.category === "Business").length, color: "from-purple-500 to-purple-700" },
  { name: "IT & Software", icon: Settings, count: coursesData.filter(c => c.category === "IT & Software").length, color: "from-orange-500 to-orange-700" }
];

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];

const PopularCourses = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLevel, setActiveLevel] = useState("All Levels");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCourses, setFilteredCourses] = useState(coursesData);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [mobileSliderIndex, setMobileSliderIndex] = useState(0);
  
  const sectionRef = useRef<HTMLElement>(null);
  const mobileSliderRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Filter courses based on category, level, and search
  useEffect(() => {
    let filtered = coursesData;

    if (activeCategory !== "All") {
      filtered = filtered.filter(course => course.category === activeCategory);
    }

    if (activeLevel !== "All Levels") {
      filtered = filtered.filter(course => course.level === activeLevel);
    }

    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  }, [activeCategory, activeLevel, searchQuery]);

  // GSAP animations for cards
  useEffect(() => {
    const cards = cardsRef.current.filter(Boolean);
    
    cards.forEach((card, index) => {
      if (!card) return;

      gsap.set(card, {
        opacity: 0,
        y: 30,
        scale: 0.95
      });

      ScrollTrigger.create({
        trigger: card,
        start: "top 85%",
        onEnter: () => {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
            delay: index * 0.1
          });
        },
        once: true
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [filteredCourses]);

  // Hide welcome message after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeMessage(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Mobile slider navigation
  const nextSlide = () => {
    if (mobileSliderRef.current) {
      const scrollAmount = mobileSliderRef.current.clientWidth;
      mobileSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setMobileSliderIndex(prev => Math.min(prev + 1, categories.length - 1));
    }
  };

  const prevSlide = () => {
    if (mobileSliderRef.current) {
      const scrollAmount = mobileSliderRef.current.clientWidth;
      mobileSliderRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setMobileSliderIndex(prev => Math.max(prev - 1, 0));
    }
  };

  const addToCardsRef = (el: HTMLDivElement | null, index: number) => {
    cardsRef.current[index] = el;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Development: "from-blue-500 to-blue-600",
      Design: "from-pink-500 to-pink-600",
      "Data Science": "from-green-500 to-green-600",
      Business: "from-purple-500 to-purple-600",
      "IT & Software": "from-orange-500 to-orange-600"
    };
    return colors[category as keyof typeof colors] || "from-gray-500 to-gray-600";
  };

  const getLevelColor = (level: string) => {
    const colors = {
      Beginner: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
      Intermediate: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
      Advanced: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
    };
    return colors[level as keyof typeof colors];
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={12}
            className={`${
              i < Math.floor(rating) 
                ? 'fill-amber-400 text-amber-400' 
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
        <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">({rating})</span>
      </div>
    );
  };

  const resetFilters = () => {
    setActiveCategory("All");
    setActiveLevel("All Levels");
    setSearchQuery("");
    setIsFilterOpen(false);
  };

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-6 px-3 sm:px-4 lg:px-6 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Welcome Message */}
        {showWelcomeMessage && (
          <div className="bg-white dark:bg-gray-800 border-l-4 border-blue-500 rounded-lg shadow-sm p-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                <BookOpen size={14} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Welcome to Our Courses!</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Discover your perfect course. Tap on any category to explore.
                </p>
              </div>
              <button 
                onClick={() => setShowWelcomeMessage(false)}
                className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="text-center mb-6">
         
         
         <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
  Explore{" "}
  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
    Courses
  </span>
</h1>

          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-4">
            Choose your learning path from our carefully curated courses
          </p>

          {/* Search Bar and Filter Button */}
          <div className="max-w-2xl mx-auto mb-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm"
                />
              </div>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm flex items-center gap-2 text-sm"
              >
                <Filter size={16} />
                <span className="hidden sm:inline">Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level</label>
                <div className="flex flex-wrap gap-2">
                  {levels.map((level) => (
                    <button
                      key={level}
                      onClick={() => setActiveLevel(level)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                        activeLevel === level
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Category Slider with Navigation */}
        <div className="md:hidden mb-6 relative">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Categories</h3>
            <div className="flex gap-1">
              <button
                onClick={prevSlide}
                disabled={mobileSliderIndex === 0}
                className="w-7 h-7 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={nextSlide}
                disabled={mobileSliderIndex === categories.length - 1}
                className="w-7 h-7 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          
          <div
            ref={mobileSliderRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.name}
                  onClick={() => setActiveCategory(category.name)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-300 border snap-center min-w-[80px] ${
                    activeCategory === category.name
                      ? `bg-gradient-to-r ${category.color} text-white border-transparent shadow-sm`
                      : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <IconComponent size={20} className="mb-1" />
                  <span className="font-medium text-xs text-center">{category.name}</span>
                  <span className={`text-xs mt-0.5 ${
                    activeCategory === category.name 
                      ? "text-blue-100" 
                      : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Category Grid */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 border ${
                  activeCategory === category.name
                    ? `bg-gradient-to-r ${category.color} text-white border-transparent shadow-sm`
                    : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-500"
                }`}
              >
                <IconComponent size={24} className="mb-2" />
                <span className="font-semibold text-xs text-center">{category.name}</span>
                <span className={`text-xs mt-1 ${
                  activeCategory === category.name 
                    ? "text-blue-100" 
                    : "text-gray-500 dark:text-gray-400"
                }`}>
                  {category.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">{filteredCourses.length}</span> courses found
            {searchQuery && (
              <span> for <span className="font-medium">{searchQuery}</span>&quot;</span>
            )}
            {activeLevel !== "All Levels" && (
              <span> • <span className="font-medium">{activeLevel}</span></span>
            )}
          </div>
          {(activeCategory !== "All" || activeLevel !== "All Levels" || searchQuery) && (
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Courses Grid - Compact Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredCourses.map((course, index) => (
            <div
              key={course.id}
              ref={(el) => addToCardsRef(el, index)}
              className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 hover:-translate-y-0.5"
            >
              {/* Featured Badge */}
              {course.featured && (
                <div className="absolute top-2 left-2 z-20">
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-xs">
                    Featured
                  </span>
                </div>
              )}

              {/* Course Image */}
              <div className="relative h-32 sm:h-36 overflow-hidden">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* Category Badge */}
                <div className="absolute bottom-2 left-2">
                  <span className={`bg-gradient-to-r ${getCategoryColor(course.category)} text-white px-2 py-1 rounded-md text-xs font-medium`}>
                    {course.category}
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-3">
                {/* Level and Price */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {course.price}
                  </div>
                </div>

                {/* Course Title */}
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {course.title}
                </h3>

                {/* Instructor */}
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  By <span className="font-medium text-gray-700 dark:text-gray-300">{course.instructor}</span>
                </p>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed mb-2 line-clamp-2">
                  {course.description}
                </p>

                {/* Course Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      <span>{(course.students / 1000).toFixed(1)}k</span>
                    </div>
                  </div>
                  {renderStars(course.rating)}
                </div>

                {/* CTA Button */}
                <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg text-xs transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md active:scale-95">
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No courses found</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 max-w-sm mx-auto">
              {searchQuery 
                ? `No courses match "${searchQuery}". Try adjusting your search.`
                : "No courses available with current filters."
              }
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors duration-300"
            >
              View All Courses
            </button>
          </div>
        )}

        {/* Load More Button for large screens */}
        {filteredCourses.length > 0 && filteredCourses.length >= 8 && (
          <div className="text-center mt-8">
            <button className="px-6 py-2.5 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium rounded-lg text-sm transition-all duration-300 transform hover:scale-105">
              Load More Courses
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularCourses;