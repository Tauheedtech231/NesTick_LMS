// data/quizzes.ts
export const mockQuizzes = [
  {
    id: 'quiz-1',
    title: 'Pipe Fitting Fundamentals',
    description: 'Test your basic knowledge of pipe fitting concepts',
    course: 'Industrial Pipe Fitting',
    questions: [
      {
        id: 'q1',
        question: 'What is the purpose of pipe threading?',
        options: [
          'To decorate the pipe',
          'To create leak-proof connections',
          'To increase pipe diameter',
          'To reduce pipe weight'
        ],
        correctAnswer: 1,
        explanation: 'Threading creates leak-proof connections between pipes'
      },
      {
        id: 'q2',
        question: 'Which tool is used for precise pipe cutting?',
        options: [
          'Hacksaw',
          'Pipe Cutter',
          'Angle Grinder',
          'All of the above'
        ],
        correctAnswer: 1,
        explanation: 'Pipe cutter provides the most precise cuts'
      },
      {
        id: 'q3',
        question: 'What does P&ID stand for?',
        options: [
          'Pipe and Instrument Diagram',
          'Pressure and Installation Document',
          'Piping and Industrial Design',
          'Process and Instrument Drawing'
        ],
        correctAnswer: 0,
        explanation: 'P&ID stands for Pipe and Instrument Diagram'
      },
      {
        id: 'q4',
        question: 'What is the standard thread angle?',
        options: ['45°', '55°', '60°', '90°'],
        correctAnswer: 2,
        explanation: 'Standard thread angle is 60 degrees'
      },
      {
        id: 'q5',
        question: 'Which safety equipment is mandatory?',
        options: [
          'Safety Glasses',
          'Gloves',
          'Hard Hat',
          'All of the above'
        ],
        correctAnswer: 3,
        explanation: 'All safety equipment is mandatory for complete protection'
      }
    ],
    passingScore: 70,
    studentScore: 85,
    isPassed: true,
    attempts: 2,
    timeLimit: 30
  },
  {
    id: 'quiz-2',
    title: 'Welding Safety Quiz',
    description: 'Test your knowledge of welding safety procedures',
    course: 'Professional Welding',
    questions: [
      {
        id: 'q1',
        question: 'What type of helmet is required for welding?',
        options: [
          'Regular safety glasses',
          'Auto-darkening welding helmet',
          'Sunglasses',
          'Face shield only'
        ],
        correctAnswer: 1,
        explanation: 'Auto-darkening welding helmet protects eyes from arc flash'
      },
      {
        id: 'q2',
        question: 'What should you wear to protect from sparks?',
        options: [
          'Cotton clothing',
          'Leather apron',
          'Fire-resistant clothing',
          'All of the above'
        ],
        correctAnswer: 3,
        explanation: 'All options provide protection from welding sparks'
      },
      {
        id: 'q3',
        question: 'What is the minimum ventilation requirement?',
        options: [
          'Natural breeze',
          'Mechanical ventilation',
          'Open window',
          'Depends on workspace size'
        ],
        correctAnswer: 3,
        explanation: 'Ventilation requirements depend on workspace size'
      }
    ],
    passingScore: 70,
    studentScore: 78,
    isPassed: true,
    attempts: 1,
    timeLimit: 20
  },
  {
    id: 'quiz-3',
    title: 'OSHA Regulations',
    description: 'Test your knowledge of OSHA safety regulations',
    course: 'Safety Inspector Certification',
    questions: [
      {
        id: 'q1',
        question: 'What does OSHA stand for?',
        options: [
          'Occupational Safety and Health Administration',
          'Operational Safety and Health Authority',
          'Organization for Safety and Health Advancement',
          'Official Safety and Health Association'
        ],
        correctAnswer: 0,
        explanation: 'OSHA stands for Occupational Safety and Health Administration'
      },
      {
        id: 'q2',
        question: 'What is the maximum allowable noise exposure?',
        options: [
          '85 dB for 8 hours',
          '90 dB for 8 hours',
          '95 dB for 8 hours',
          '100 dB for 8 hours'
        ],
        correctAnswer: 1,
        explanation: 'Maximum allowable noise exposure is 90 dB for 8 hours'
      },
      {
        id: 'q3',
        question: 'How often should safety training be conducted?',
        options: [
          'Once a year',
          'Every 6 months',
          'When new hazards are introduced',
          'All of the above'
        ],
        correctAnswer: 3,
        explanation: 'Safety training should be conducted regularly and when needed'
      }
    ],
    passingScore: 70,
    studentScore: 92,
    isPassed: true,
    attempts: 1,
    timeLimit: 25
  }
];

export const practiceQuizzes = [
  {
    id: 'practice-1',
    title: 'Pipe Materials Practice',
    description: 'Practice quiz on different pipe materials',
    course: 'Industrial Pipe Fitting',
    questions: [
      {
        id: 'p1',
        question: 'Which material is best for high-pressure applications?',
        options: ['PVC', 'Copper', 'Steel', 'Aluminum'],
        correctAnswer: 2,
        explanation: 'Steel is best for high-pressure applications'
      },
      {
        id: 'p2',
        question: 'What is the main advantage of PVC pipes?',
        options: ['Cost', 'Durability', 'Corrosion resistance', 'All of the above'],
        correctAnswer: 3,
        explanation: 'PVC pipes are cost-effective, durable, and corrosion-resistant'
      }
    ],
    passingScore: 70,
    studentScore: null,
    isPassed: false,
    attempts: 0,
    timeLimit: 15
  },
  {
    id: 'practice-2',
    title: 'Welding Techniques Practice',
    description: 'Practice different welding techniques',
    course: 'Professional Welding',
    questions: [
      {
        id: 'p1',
        question: 'Which welding technique is best for thin materials?',
        options: ['MIG', 'TIG', 'Arc', 'Spot'],
        correctAnswer: 1,
        explanation: 'TIG welding is best for thin materials'
      },
      {
        id: 'p2',
        question: 'What does MIG stand for?',
        options: [
          'Metal Inert Gas',
          'Manual Inert Gas',
          'Metal Integrated Gas',
          'Manual Integrated Gas'
        ],
        correctAnswer: 0,
        explanation: 'MIG stands for Metal Inert Gas'
      }
    ],
    passingScore: 70,
    studentScore: null,
    isPassed: false,
    attempts: 0,
    timeLimit: 15
  }
];