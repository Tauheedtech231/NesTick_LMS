'use client'

import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function DataInitializer() {
  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = () => {
    // Check if data already exists
    const hasData = localStorage.getItem('courses') || localStorage.getItem('students')
    
    if (!hasData) {
      console.log('Initializing admin portal data...')
      
      // Courses Data
      const courses = [
        {
          id: uuidv4(),
          title: 'Web Development Bootcamp',
          description: 'Learn full-stack web development with HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build real-world projects and deploy your applications.',
          duration: '6 months',
          credits: 120,
          fee: 2999,
          awardingBody: 'Tech University Global',
          entryRequirements: 'Basic computer skills, logical thinking, no prior coding experience required',
          status: 'active' as const,
          image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop&crop=center',
          createdAt: new Date().toISOString(),
          totalStudents: 45,
          rating: 4.8
        },
        {
          id: uuidv4(),
          title: 'Data Science Fundamentals',
          description: 'Master data analysis, machine learning, statistics, and data visualization with Python and R. Work with real datasets and build predictive models.',
          duration: '8 months',
          credits: 150,
          fee: 3499,
          awardingBody: 'Data Science Institute',
          entryRequirements: 'Basic mathematics, logical reasoning, basic programming knowledge preferred',
          status: 'active' as const,
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
          createdAt: new Date().toISOString(),
          totalStudents: 32,
          rating: 4.7
        },
        {
          id: uuidv4(),
          title: 'Digital Marketing Mastery',
          description: 'Learn SEO, social media marketing, content marketing, email marketing, Google Analytics, and paid advertising strategies.',
          duration: '4 months',
          credits: 80,
          fee: 1999,
          awardingBody: 'Marketing Association',
          entryRequirements: 'No prerequisites required, suitable for beginners',
          status: 'active' as const,
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center',
          createdAt: new Date().toISOString(),
          totalStudents: 58,
          rating: 4.6
        },
        {
          id: uuidv4(),
          title: 'Mobile App Development',
          description: 'Build iOS and Android apps using React Native and Flutter. Learn app design, development, testing, and publishing to app stores.',
          duration: '5 months',
          credits: 100,
          fee: 2799,
          awardingBody: 'Mobile Tech Academy',
          entryRequirements: 'Basic programming knowledge, familiarity with JavaScript',
          status: 'active' as const,
          image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop&crop=center',
          createdAt: new Date().toISOString(),
          totalStudents: 28,
          rating: 4.9
        }
      ]

      // Modules Data
      const modules = [
        {
          id: uuidv4(),
          courseId: courses[0].id,
          title: 'HTML & CSS Fundamentals',
          description: 'Learn the building blocks of web development with semantic HTML and modern CSS',
          duration: '4 weeks',
          credits: 10,
          order: 1,
          status: 'active' as const,
          materials: [
            { id: uuidv4(), title: 'HTML5 Complete Guide.pdf', url: '#' },
            { id: uuidv4(), title: 'CSS Flexbox Cheatsheet.pdf', url: '#' },
            { id: uuidv4(), title: 'Responsive Design Tutorial.mp4', url: '#' }
          ],
          completedStudents: 38
        },
        {
          id: uuidv4(),
          courseId: courses[0].id,
          title: 'JavaScript Programming',
          description: 'Master JavaScript fundamentals, ES6+ features, and DOM manipulation',
          duration: '6 weeks',
          credits: 15,
          order: 2,
          status: 'active' as const,
          materials: [
            { id: uuidv4(), title: 'JavaScript Guide.pdf', url: '#' },
            { id: uuidv4(), title: 'ES6+ Features Cheatsheet.pdf', url: '#' }
          ],
          completedStudents: 32
        },
        {
          id: uuidv4(),
          courseId: courses[0].id,
          title: 'React Development',
          description: 'Build modern web applications with React, Hooks, and Context API',
          duration: '8 weeks',
          credits: 20,
          order: 3,
          status: 'active' as const,
          materials: [
            { id: uuidv4(), title: 'React Official Documentation', url: '#' },
            { id: uuidv4(), title: 'React Projects Book.pdf', url: '#' }
          ],
          completedStudents: 25
        }
      ]

      // Students Data
      const students = [
        {
          id: uuidv4(),
          studentId: 'STU2024001',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1 234 567 8900',
          enrollmentDate: '2024-01-15',
          courseId: courses[0].id,
          courseName: 'Web Development Bootcamp',
          status: 'active' as const,
          attendance: 92,
          assignments: [
            { id: uuidv4(), title: 'HTML Portfolio', score: 95, submitted: true },
            { id: uuidv4(), title: 'JavaScript Quiz', score: 88, submitted: true }
          ],
          payments: [
            { id: uuidv4(), amount: 1500, date: '2024-01-15', status: 'PAID' },
            { id: uuidv4(), amount: 1499, date: '2024-02-15', status: 'PAID' }
          ],
          performance: { 
            averageScore: 85, 
            completedModules: 8, 
            totalModules: 12,
            lastActive: '2024-03-20'
          },
          engagement: 92,
          notes: 'Excellent student, very engaged'
        },
        {
          id: uuidv4(),
          studentId: 'STU2024002',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1 234 567 8901',
          enrollmentDate: '2024-02-20',
          courseId: courses[1].id,
          courseName: 'Data Science Fundamentals',
          status: 'active' as const,
          attendance: 85,
          assignments: [
            { id: uuidv4(), title: 'Python Basics', score: 78, submitted: true },
            { id: uuidv4(), title: 'Statistics Quiz', score: 82, submitted: true }
          ],
          payments: [
            { id: uuidv4(), amount: 2000, date: '2024-02-20', status: 'PAID' },
            { id: uuidv4(), amount: 1499, date: '2024-03-20', status: 'PENDING' }
          ],
          performance: { 
            averageScore: 78, 
            completedModules: 6, 
            totalModules: 10,
            lastActive: '2024-03-19'
          },
          engagement: 85,
          notes: 'Needs extra help with statistics'
        },
        {
          id: uuidv4(),
          studentId: 'STU2024003',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          phone: '+1 234 567 8902',
          enrollmentDate: '2023-11-10',
          courseId: courses[2].id,
          courseName: 'Digital Marketing Mastery',
          status: 'graduated' as const,
          attendance: 96,
          assignments: [
            { id: uuidv4(), title: 'SEO Audit', score: 91, submitted: true },
            { id: uuidv4(), title: 'Campaign Plan', score: 94, submitted: true }
          ],
          payments: [
            { id: uuidv4(), amount: 1999, date: '2023-11-10', status: 'PAID' }
          ],
          performance: { 
            averageScore: 91, 
            completedModules: 10, 
            totalModules: 10,
            lastActive: '2024-02-15'
          },
          engagement: 95,
          notes: 'Graduated with honors'
        }
      ]

      // Instructors Data
      const instructors = [
        {
          id: uuidv4(),
          name: 'Dr. Sarah Johnson',
          email: 'sarah@example.com',
          phone: '+1 234 567 8910',
          specialization: 'Web Development, Full-Stack',
          experience: '8 years',
          qualification: 'PhD in Computer Science',
          status: 'active' as const,
          courses: [courses[0].id, courses[3].id],
          rating: 4.9,
          students: 73,
          bio: 'Passionate educator with industry experience at Google and Microsoft'
        },
        {
          id: uuidv4(),
          name: 'Prof. Michael Chen',
          email: 'michael@example.com',
          phone: '+1 234 567 8911',
          specialization: 'Data Science, Machine Learning',
          experience: '10 years',
          qualification: 'MSc in Data Science',
          status: 'active' as const,
          courses: [courses[1].id],
          rating: 4.7,
          students: 45,
          bio: 'Former Data Scientist at Amazon, specializes in ML algorithms'
        },
        {
          id: uuidv4(),
          name: 'Ms. Emily Rodriguez',
          email: 'emily@example.com',
          phone: '+1 234 567 8912',
          specialization: 'Digital Marketing, SEO',
          experience: '6 years',
          qualification: 'MBA in Marketing',
          status: 'active' as const,
          courses: [courses[2].id],
          rating: 4.8,
          students: 89,
          bio: 'Digital marketing expert with agency background'
        }
      ]

      // Payments Data
      const payments = [
        {
          id: uuidv4(),
          studentId: students[0].id,
          studentName: students[0].name,
          course: courses[0].title,
          amount: 1500,
          date: '2024-01-15',
          status: 'PAID' as const,
          method: 'Credit Card',
          reference: 'PAY-001-2024',
          invoiceUrl: '#'
        },
        {
          id: uuidv4(),
          studentId: students[0].id,
          studentName: students[0].name,
          course: courses[0].title,
          amount: 1499,
          date: '2024-02-15',
          status: 'PAID' as const,
          method: 'Bank Transfer',
          reference: 'PAY-002-2024',
          invoiceUrl: '#'
        },
        {
          id: uuidv4(),
          studentId: students[1].id,
          studentName: students[1].name,
          course: courses[1].title,
          amount: 2000,
          date: '2024-02-20',
          status: 'PAID' as const,
          method: 'PayPal',
          reference: 'PAY-003-2024',
          invoiceUrl: '#'
        },
        {
          id: uuidv4(),
          studentId: students[1].id,
          studentName: students[1].name,
          course: courses[1].title,
          amount: 1499,
          date: '2024-03-20',
          status: 'PENDING' as const,
          method: 'Credit Card',
          reference: 'PAY-004-2024',
          invoiceUrl: '#'
        },
        {
          id: uuidv4(),
          studentId: students[2].id,
          studentName: students[2].name,
          course: courses[2].title,
          amount: 1999,
          date: '2023-11-10',
          status: 'PAID' as const,
          method: 'Cash',
          reference: 'PAY-005-2024',
          invoiceUrl: '#'
        }
      ]

      // Assignments Data
      const assignments = [
        {
          id: uuidv4(),
          title: 'HTML Portfolio Project',
          courseId: courses[0].id,
          courseName: courses[0].title,
          dueDate: '2024-02-28',
          totalStudents: 45,
          submitted: 42,
          averageScore: 82,
          status: 'graded' as const
        },
        {
          id: uuidv4(),
          title: 'Python Data Analysis',
          courseId: courses[1].id,
          courseName: courses[1].title,
          dueDate: '2024-03-15',
          totalStudents: 32,
          submitted: 28,
          averageScore: 78,
          status: 'grading' as const
        },
        {
          id: uuidv4(),
          title: 'SEO Audit Report',
          courseId: courses[2].id,
          courseName: courses[2].title,
          dueDate: '2024-01-30',
          totalStudents: 58,
          submitted: 55,
          averageScore: 85,
          status: 'graded' as const
        }
      ]

      // Quizzes Data
      const quizzes = [
        {
          id: uuidv4(),
          title: 'JavaScript Fundamentals Quiz',
          courseId: courses[0].id,
          courseName: courses[0].title,
          date: '2024-02-10',
          duration: '30 minutes',
          totalQuestions: 20,
          averageScore: 75,
          passingScore: 60,
          status: 'completed' as const
        },
        {
          id: uuidv4(),
          title: 'Statistics Basics Quiz',
          courseId: courses[1].id,
          courseName: courses[1].title,
          date: '2024-03-05',
          duration: '45 minutes',
          totalQuestions: 25,
          averageScore: 68,
          passingScore: 65,
          status: 'completed' as const
        },
        {
          id: uuidv4(),
          title: 'React Concepts Quiz',
          courseId: courses[0].id,
          courseName: courses[0].title,
          date: '2024-03-25',
          duration: '40 minutes',
          totalQuestions: 30,
          averageScore: null,
          passingScore: 70,
          status: 'upcoming' as const
        }
      ]

      // Save all data to localStorage
      localStorage.setItem('courses', JSON.stringify(courses))
      localStorage.setItem('modules', JSON.stringify(modules))
      localStorage.setItem('students', JSON.stringify(students))
      localStorage.setItem('instructors', JSON.stringify(instructors))
      localStorage.setItem('payments', JSON.stringify(payments))
      localStorage.setItem('assignments', JSON.stringify(assignments))
      localStorage.setItem('quizzes', JSON.stringify(quizzes))

      console.log('✅ Admin portal data initialized successfully!')
      console.log(`📊 Courses: ${courses.length}`)
      console.log(`📚 Modules: ${modules.length}`)
      console.log(`👨‍🎓 Students: ${students.length}`)
      console.log(`👨‍🏫 Instructors: ${instructors.length}`)
      console.log(`💰 Payments: ${payments.length}`)
    }
  }

  return null // This component doesn't render anything
}