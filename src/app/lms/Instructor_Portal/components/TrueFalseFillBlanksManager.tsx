/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Edit3, Loader2, CheckCircle } from 'lucide-react';

interface TFQuestion {
  id: string;
  slideId: string;
  courseId: string;
  type: 'true_false' | 'fill_blanks';
  question: string;
  correctAnswer: number | string[];
  points: number;
}

interface TrueFalseFillBlanksManagerProps {
  slideId: string;
  courseId: string;
  onQuestionsChange?: (questions: TFQuestion[]) => void;
}

export default function TrueFalseFillBlanksManager({ 
  slideId, 
  courseId, 
  onQuestionsChange 
}: TrueFalseFillBlanksManagerProps) {
  const [questions, setQuestions] = useState<TFQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Form state
  const [questionType, setQuestionType] = useState<'true_false' | 'fill_blanks'>('true_false');
  const [questionText, setQuestionText] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<number | string[]>(0);
  const [blanks, setBlanks] = useState<string[]>(['']);
  const [points, setPoints] = useState(1);

  // Show success message
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Load questions from API
  const loadQuestions = async () => {
    if (!slideId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/instructors/course/true-false-fill-blanks?slideId=${slideId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setQuestions(result.data);
        onQuestionsChange?.(result.data);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save question to API
const saveQuestion = async () => {
  if (!questionText.trim()) {
    alert('Please enter a question');
    return;
  }

  const questionData: any = {
    id: editingId || `tf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    slideId: slideId,
    courseId: courseId,
    type: questionType,
    question: questionText,
    points: points
  };

  if (questionType === 'true_false') {
    questionData.correctAnswer = correctAnswer as number;
  } else if (questionType === 'fill_blanks') {
    if (blanks.some(b => !b.trim())) {
      alert('Please fill all blank answers');
      return;
    }
    // ENSURE this is an array, not a string
    questionData.correctAnswer = [...blanks]; // Create a new array copy
  }

  console.log('📌 Sending question data:', JSON.stringify(questionData, null, 2));

  setSaving(true);
  
  try {
    const response = await fetch('/api/instructors/course/true-false-fill-blanks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slideId: slideId,
        courseId: courseId,
        questions: [questionData]
      })
    });

    const result = await response.json();
    
    if (result.success) {
      await loadQuestions();
      resetForm();
      showSuccess(editingId ? 'Question updated successfully!' : 'Question added successfully!');
    } else {
      throw new Error(result.error);
    }
  } catch (error: any) {
    console.error('Save error:', error);
    alert(error.message || 'Failed to save question');
  } finally {
    setSaving(false);
  }
};

  // Delete question
  const deleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
      const response = await fetch(`/api/instructors/course/true-false-fill-blanks/${questionId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        await loadQuestions();
        showSuccess('Question deleted successfully!');
      }
    } catch (error) {
      alert('Failed to delete question');
    }
  };

  // Edit question
  const editQuestion = (q: TFQuestion) => {
    setEditingId(q.id);
    setQuestionType(q.type);
    setQuestionText(q.question);
    setPoints(q.points);
    
    if (q.type === 'true_false') {
      setCorrectAnswer(q.correctAnswer as number);
    } else if (q.type === 'fill_blanks') {
      setBlanks(q.correctAnswer as string[]);
    }
    
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setQuestionType('true_false');
    setQuestionText('');
    setCorrectAnswer(0);
    setBlanks(['']);
    setPoints(1);
  };

  // Fill in blanks helpers
  const handleAddBlank = () => {
    setBlanks([...blanks, '']);
  };

  const handleRemoveBlank = (index: number) => {
    if (blanks.length > 1) {
      setBlanks(blanks.filter((_, i) => i !== index));
    }
  };

  const handleBlankChange = (index: number, value: string) => {
    const newBlanks = [...blanks];
    newBlanks[index] = value;
    setBlanks(newBlanks);
  };

  useEffect(() => {
    if (slideId) {
      loadQuestions();
    }
  }, [slideId]);

  const getTypeBadge = (type: string) => {
    if (type === 'true_false') {
      return <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">True/False</span>;
    }
    return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Fill in Blanks</span>;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
        <p className="text-sm text-gray-500 mt-2">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Success Message */}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-700">{successMsg}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-md font-semibold text-gray-800">
            True/False & Fill in the Blanks
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {questions.length} question{questions.length !== 1 ? 's' : ''} added
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-700">
              {editingId ? 'Edit Question' : 'Add New Question'}
            </h4>
            <button onClick={resetForm} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Question Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setQuestionType('true_false');
                    setCorrectAnswer(0);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    questionType === 'true_false' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  True / False
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuestionType('fill_blanks');
                    setCorrectAnswer(['']);
                    setBlanks(['']);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    questionType === 'fill_blanks' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Fill in the Blanks
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder={
                  questionType === 'fill_blanks' 
                    ? 'Example: The capital of ___ is ___ and the capital of ___ is ___'
                    : 'Enter your statement here...'
                }
              />
              {questionType === 'fill_blanks' && (
                <p className="text-xs text-gray-500 mt-1">
                  Use ___ (triple underscore) to indicate where blanks should appear
                </p>
              )}
            </div>

            {/* True/False Options */}
            {questionType === 'true_false' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tfAnswer"
                      checked={correctAnswer === 0}
                      onChange={() => setCorrectAnswer(0)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span>True</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tfAnswer"
                      checked={correctAnswer === 1}
                      onChange={() => setCorrectAnswer(1)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span>False</span>
                  </label>
                </div>
              </div>
            )}

            {/* Fill in the Blanks */}
            {questionType === 'fill_blanks' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blank Answers (in order)
                </label>
                <div className="space-y-3">
                  {blanks.map((blank, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 w-8">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={blank}
                        onChange={(e) => handleBlankChange(idx, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder={`Answer for blank ${idx + 1}`}
                      />
                      {blanks.length > 1 && (
                        <button
                          onClick={() => handleRemoveBlank(idx)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddBlank}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Blank
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Enter the correct answer for each blank in the order they appear
                </p>
              </div>
            )}

            {/* Points */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points
              </label>
              <input
                type="number"
                min="1"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Form Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={saveQuestion}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingId ? 'Update Question' : 'Add Question'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      {questions.length > 0 ? (
        <div className="space-y-3">
          {questions.map((q, qIndex) => (
            <div key={q.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeBadge(q.type)}
                    <span className="text-xs text-gray-500">({q.points} point{q.points > 1 ? 's' : ''})</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {qIndex + 1}. {q.question}
                  </p>
                  
                  {/* Show correct answer for True/False */}
                  {q.type === 'true_false' && (
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        q.correctAnswer === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        Correct Answer: {q.correctAnswer === 0 ? 'True' : 'False'}
                      </span>
                    </div>
                  )}
                  
                  {/* Show answers for Fill in Blanks */}
                  {q.type === 'fill_blanks' && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(q.correctAnswer as string[]).map((ans, idx) => (
                        <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Blank {idx + 1}: {ans}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => editQuestion(q)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500 text-sm">No True/False or Fill in Blanks questions yet</p>
            <p className="text-xs text-gray-400 mt-1">Click "Add Question" to create one</p>
          </div>
        )
      )}
    </div>
  );
}