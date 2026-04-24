/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { Trash2, Edit3, Loader2, X, Check } from 'lucide-react'

enum QuestionType {
  MCQ = 'mcq',
  TEXT = 'text'
}

interface QuizQuestion {
  id: string;
  slideId: string;
  courseId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  questionType: QuestionType;
  createdAt?: string;
  updatedAt?: string;
}

interface QuizManagerProps {
  slideId: string;
  courseId: string;
  questions: QuizQuestion[];
  onQuestionsChange: (questions: QuizQuestion[]) => void;
  onShowSuccess?: (message: string) => void;
  onShowError?: (message: string) => void;
}

export default function QuizManager({ 
  slideId, 
  courseId, 
  questions, 
  onQuestionsChange,
  onShowSuccess,
  onShowError
}: QuizManagerProps) {
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    questionType: QuestionType.MCQ
  });
  
  // Edit mode state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<{
    question: string;
    options: string[];
    correctAnswer: number;
    questionType: QuestionType;
  } | null>(null);

  // Fetch questions from database on mount or when slideId changes
  useEffect(() => {
    if (slideId && courseId) {
      fetchQuestions();
    }
  }, [slideId, courseId]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/instructors/quiz/questions?slideId=${slideId}&courseId=${courseId}`);
      const result = await response.json();
      
      if (result.success) {
        // ✅ Use question_type from API
        const questionsWithType = result.data.map((q: any) => ({
          id: q.id,
          slideId: slideId,
          courseId: courseId,
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          questionType: q.questionType === 'text' ? QuestionType.TEXT : QuestionType.MCQ,
          createdAt: q.createdAt,
          updatedAt: q.updatedAt
        }));
        onQuestionsChange(questionsWithType);
      }
    } catch (error: any) {
      onShowError?.(error.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionTypeChange = (type: QuestionType) => {
    setCurrentQuestion({
      question: currentQuestion.question,
      options: type === QuestionType.MCQ ? ['', '', '', ''] : [],
      correctAnswer: type === QuestionType.MCQ ? 0 : -1,
      questionType: type
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  // ============ ADD Question ============
  const handleAddQuestion = async () => {
    if (!currentQuestion.question.trim()) {
      onShowError?.('Please enter a question');
      return;
    }

    if (currentQuestion.questionType === QuestionType.MCQ) {
      if (currentQuestion.options.some(opt => !opt.trim())) {
        onShowError?.('Please fill all options for MCQ');
        return;
      }
    }
    
    setAdding(true);
    
    try {
      const response = await fetch('/api/instructors/quiz/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideId: slideId,
          courseId: courseId,
          question: currentQuestion.question,
          options: currentQuestion.options,
          correctAnswer: currentQuestion.correctAnswer,
          points: 1,
          questionType: currentQuestion.questionType  // ✅ Send question_type
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        onShowSuccess?.('Question added successfully!');
        setCurrentQuestion({
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          questionType: QuestionType.MCQ
        });
        await fetchQuestions();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      onShowError?.(error.message || 'Failed to add question');
    } finally {
      setAdding(false);
    }
  };

  // ============ EDIT/UPDATE Question ============
  const handleStartEdit = (question: QuizQuestion) => {
    setEditingId(question.id);
    
    console.log('✏️ Editing question:', {
      id: question.id,
      type: question.questionType,
      hasOptions: question.options?.length > 0
    });
    
    // Text questions ke liye options empty rakho
    // MCQ questions ke liye options copy karo
    let editOptions: string[] = [];
    if (question.questionType === QuestionType.MCQ) {
      editOptions = question.options && question.options.length > 0 
        ? [...question.options] 
        : ['', '', '', ''];
    } else {
      // Text question - empty array
      editOptions = [];
    }
    
    setEditingQuestion({
      question: question.question,
      options: editOptions,
      correctAnswer: question.correctAnswer || 0,
      questionType: question.questionType  // Original type preserve karo
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingQuestion(null);
  };

  const handleEditOptionChange = (index: number, value: string) => {
    if (!editingQuestion) return;
    const newOptions = [...editingQuestion.options];
    newOptions[index] = value;
    setEditingQuestion({
      ...editingQuestion,
      options: newOptions
    });
  };

  const handleUpdateQuestion = async () => {
    if (!editingId || !editingQuestion) return;
    
    console.log('📤 Updating question with type:', editingQuestion.questionType);
    
    if (!editingQuestion.question.trim()) {
      onShowError?.('Please enter a question');
      return;
    }

    // MCQ validation
    if (editingQuestion.questionType === QuestionType.MCQ) {
      if (editingQuestion.options.some(opt => !opt.trim())) {
        onShowError?.('Please fill all options for MCQ');
        return;
      }
    }
    
    setUpdating(editingId);
    
    // Prepare data based on question type
    let optionsToSend: string[] = [];
    let correctAnswerToSend = 0;
    
    if (editingQuestion.questionType === QuestionType.MCQ) {
      optionsToSend = editingQuestion.options;
      correctAnswerToSend = editingQuestion.correctAnswer;
    } else {
      // Text question - send empty options
      optionsToSend = [];
      correctAnswerToSend = 0;
    }
    
    const requestBody = {
      question: editingQuestion.question,
      options: optionsToSend,
      correctAnswer: correctAnswerToSend,
      points: 1,
      questionType: editingQuestion.questionType  // ✅ Send question_type
    };
    
    console.log('📦 Request body:', requestBody);
    
    try {
      const response = await fetch(`/api/instructors/quiz/update/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const result = await response.json();
      console.log('📥 Response:', result);
      
      if (result.success) {
        onShowSuccess?.('Question updated successfully!');
        setEditingId(null);
        setEditingQuestion(null);
        await fetchQuestions();
      } else {
        throw new Error(result.error || 'Failed to update');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      onShowError?.(error.message || 'Failed to update question');
    } finally {
      setUpdating(null);
    }
  };

  // ============ DELETE Question ============
  const handleRemoveQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    setDeleting(questionId);
    
    try {
      const response = await fetch(`/api/instructors/quiz/delete/${questionId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        onShowSuccess?.('Question deleted successfully!');
        await fetchQuestions();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      onShowError?.(error.message || 'Failed to delete question');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-softGrey p-6 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: '#1E3A8A' }} />
        <p className="text-sm mt-2">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-softGrey p-6">
      <h3 className="text-lg font-semibold mb-4" style={{ color: '#0B1C3D' }}>Quiz Questions ({questions.length})</h3>

      {/* Add Question Form */}
      <div className="bg-lightGrey rounded-lg p-4 mb-6">
        <h4 className="font-medium text-darkGrey mb-3">Add New Question</h4>
        
        <div className="space-y-4">
          {/* Question Type */}
          <div>
            <label className="block text-xs font-medium text-darkGrey/70 mb-1">Question Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={currentQuestion.questionType === QuestionType.MCQ} 
                  onChange={() => handleQuestionTypeChange(QuestionType.MCQ)} 
                  className="w-4 h-4" 
                  style={{ accentColor: '#1E3A8A' }}
                />
                <span className="text-sm text-darkGrey">Multiple Choice</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={currentQuestion.questionType === QuestionType.TEXT} 
                  onChange={() => handleQuestionTypeChange(QuestionType.TEXT)} 
                  className="w-4 h-4" 
                  style={{ accentColor: '#1E3A8A' }}
                />
                <span className="text-sm text-darkGrey">Text Answer</span>
              </label>
            </div>
          </div>

          {/* Question */}
          <div>
            <label className="block text-xs font-medium text-darkGrey/70 mb-1">Question</label>
            <textarea
              value={currentQuestion.question}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm cursor-text"
              placeholder="Enter your question here..."
            />
          </div>

          {/* MCQ Options */}
          {currentQuestion.questionType === QuestionType.MCQ && (
            <>
              <div>
                <label className="block text-xs font-medium text-darkGrey/70 mb-1">Options</label>
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-6 text-sm font-medium text-darkGrey/70">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <input 
                        type="text" 
                        value={option} 
                        onChange={(e) => handleOptionChange(index, e.target.value)} 
                        className="flex-1 px-3 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm cursor-text" 
                        placeholder={`Option ${index + 1}`} 
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-darkGrey/70 mb-1">Correct Answer</label>
                <select
                  value={currentQuestion.correctAnswer}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm bg-white cursor-pointer"
                >
                  {currentQuestion.options.map((_, index) => (
                    <option key={index} value={index}>
                      Option {String.fromCharCode(65 + index)}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Text Answer Info */}
          {currentQuestion.questionType === QuestionType.TEXT && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                📝 Text Answer Question: Students will write their answer in a text box.
              </p>
            </div>
          )}

          <button 
            onClick={handleAddQuestion} 
            disabled={adding}
            className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: '#1E3A8A' }}
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> : null}
            {adding ? 'Adding...' : 'Add Question'}
          </button>
        </div>
      </div>

      {/* Questions List */}
      {questions.length > 0 ? (
        <div className="space-y-3">
          {questions.map((q, qIndex) => (
            <div key={q.id} className="border border-softGrey rounded-lg p-3">
              {editingId === q.id ? (
                // ============ EDIT MODE ============
                <div className="space-y-3">
                  {/* Show Question Type Badge - Readonly */}
                  <div className="mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      editingQuestion?.questionType === QuestionType.MCQ 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {editingQuestion?.questionType === QuestionType.MCQ ? '✏️ Editing MCQ' : '✏️ Editing Text Question'}
                    </span>
                  </div>
                  
                  {/* Question Input */}
                  <div>
                    <label className="block text-xs font-medium text-darkGrey/70 mb-1">Question</label>
                    <textarea
                      value={editingQuestion?.question || ''}
                      onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, question: e.target.value } : null)}
                      rows={2}
                      className="w-full px-3 py-2 border border-softGrey rounded-lg text-sm"
                    />
                  </div>
                  
                  {/* MCQ Options - ONLY show for MCQ type */}
                  {editingQuestion?.questionType === QuestionType.MCQ && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-darkGrey/70 mb-1">Options</label>
                        <div className="space-y-2">
                          {editingQuestion.options.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-6 text-sm">{String.fromCharCode(65 + idx)}.</span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => handleEditOptionChange(idx, e.target.value)}
                                className="flex-1 px-3 py-2 border border-softGrey rounded-lg text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-darkGrey/70 mb-1">Correct Answer</label>
                        <select
                          value={editingQuestion?.correctAnswer || 0}
                          onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, correctAnswer: parseInt(e.target.value) } : null)}
                          className="w-full px-3 py-2 border border-softGrey rounded-lg text-sm"
                        >
                          {editingQuestion?.options.map((_, idx) => (
                            <option key={idx} value={idx}>Option {String.fromCharCode(65 + idx)}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  
                  {/* Text Question Info */}
                  {editingQuestion?.questionType === QuestionType.TEXT && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-700">
                        📝 Text Answer Question - Students will write their answer in a text box.
                      </p>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={handleCancelEdit} 
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm flex items-center gap-1 hover:bg-gray-100"
                    >
                      <X className="w-3 h-3" /> Cancel
                    </button>
                    <button 
                      onClick={handleUpdateQuestion} 
                      disabled={updating === q.id} 
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-green-700 disabled:opacity-50"
                    >
                      {updating === q.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      {updating === q.id ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                // ============ VIEW MODE ============
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          q.questionType === QuestionType.MCQ 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {q.questionType === QuestionType.MCQ ? 'MCQ' : 'Text Answer'}
                        </span>
                        <p className="font-medium text-sm text-darkGrey">
                          Q{qIndex + 1}: {q.question}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleStartEdit(q)} 
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit question"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleRemoveQuestion(q.id)} 
                        disabled={deleting === q.id}
                        className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 transition-colors"
                        title="Delete question"
                      >
                        {deleting === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Show Options for MCQ */}
                  {q.questionType === QuestionType.MCQ && q.options.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            optIndex === q.correctAnswer 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span className="text-xs text-darkGrey/70">{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show placeholder for Text question */}
                  {q.questionType === QuestionType.TEXT && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500">
                        📝 Text answer question - Students will type their response
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-softGrey rounded-lg">
          <p className="text-darkGrey/70">No questions yet</p>
          <p className="text-xs text-darkGrey/50 mt-1">Add your first question above</p>
        </div>
      )}
    </div>
  );
}