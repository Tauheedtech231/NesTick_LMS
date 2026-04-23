/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit3, Save, X, Loader2, CheckCircle, AlertCircle, FileText } from 'lucide-react'

interface QuizQuestion {
  id: string;
  slideId: string;
  courseId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  questionType: 'mcq' | 'text';
  points?: number;
}

interface SimpleQuizManagerProps {
  slideId: string;
  courseId: string;
  onQuestionsChange?: (questions: QuizQuestion[]) => void;
}

export default function SimpleQuizManager({ slideId, courseId, onQuestionsChange }: SimpleQuizManagerProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<QuizQuestion>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState<Partial<QuizQuestion>>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    questionType: 'mcq'
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch questions from API
  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/instructors/slide/quiz-questions?slideId=${slideId}&courseId=${courseId}`)
      const data = await response.json()
      if (data.success) {
        setQuestions(data.data || [])
        onQuestionsChange?.(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      showMessage('error', 'Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (slideId) {
      fetchQuestions()
    }
  }, [slideId])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  // Add question
  const handleAddQuestion = async () => {
    if (!newQuestion.question?.trim()) {
      showMessage('error', 'Please enter a question')
      return
    }

    if (newQuestion.questionType === 'mcq') {
      const options = newQuestion.options as string[]
      if (options.some(opt => !opt.trim())) {
        showMessage('error', 'Please fill all options')
        return
      }
    }

    setSaving(true)
    try {
      const response = await fetch('/api/instructors/slide/quiz-questions/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideId,
          courseId,
          question: newQuestion.question,
          questionType: newQuestion.questionType,
          options: newQuestion.questionType === 'mcq' ? newQuestion.options : [],
          correctAnswer: newQuestion.questionType === 'mcq' ? newQuestion.correctAnswer : -1,
          points: 1
        })
      })

      const data = await response.json()
      if (data.success) {
        showMessage('success', 'Question added successfully!')
        setShowAddForm(false)
        setNewQuestion({
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          questionType: 'mcq'
        })
        fetchQuestions()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to add question')
    } finally {
      setSaving(false)
    }
  }

  // Update question - FIXED with proper options handling
  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return

    setSaving(true)
    try {
      // Prepare the data based on question type
      let updateData: any = {
        question: editForm.question,
        questionType: editForm.questionType,
        points: 1
      }

      if (editForm.questionType === 'mcq') {
        updateData.options = editForm.options || ['', '', '', '']
        updateData.correctAnswer = editForm.correctAnswer || 0
      } else {
        updateData.options = []
        updateData.correctAnswer = -1
      }

      const response = await fetch(`/api/instructors/slide/quiz-questions/${editingQuestion}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()
      if (data.success) {
        showMessage('success', 'Question updated successfully!')
        setEditingQuestion(null)
        setEditForm({})
        fetchQuestions()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      console.error('Update error:', error)
      showMessage('error', error.message || 'Failed to update question')
    } finally {
      setSaving(false)
    }
  }

  // Delete question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return

    try {
      const response = await fetch(`/api/instructors/slide/quiz-questions/${questionId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        showMessage('success', 'Question deleted successfully!')
        fetchQuestions()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to delete question')
    }
  }

  const startEdit = (question: QuizQuestion) => {
    setEditingQuestion(question.id)
    setEditForm({
      id: question.id,
      question: question.question,
      questionType: question.questionType,
      options: question.options && question.options.length > 0 ? [...question.options] : ['', '', '', ''],
      correctAnswer: question.correctAnswer || 0
    })
  }

  const cancelEdit = () => {
    setEditingQuestion(null)
    setEditForm({})
  }

  // Handle option change in edit mode
  const handleEditOptionChange = (index: number, value: string) => {
    const newOptions = [...(editForm.options as string[])]
    newOptions[index] = value
    setEditForm({ ...editForm, options: newOptions })
  }

  // Handle option change in add mode
  const handleNewOptionChange = (index: number, value: string) => {
    const newOptions = [...(newQuestion.options as string[])]
    newOptions[index] = value
    setNewQuestion({ ...newQuestion, options: newOptions })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading questions...</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Simple Quiz (MCQ/Text)</h3>
          <p className="text-xs text-gray-500 mt-1">{questions.length} question(s)</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Add Question Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Add New Question</h4>
          
          <div className="space-y-4">
            {/* Question Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Question Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={newQuestion.questionType === 'mcq'}
                    onChange={() => setNewQuestion({ ...newQuestion, questionType: 'mcq', options: ['', '', '', ''], correctAnswer: 0 })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Multiple Choice</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={newQuestion.questionType === 'text'}
                    onChange={() => setNewQuestion({ ...newQuestion, questionType: 'text', options: [], correctAnswer: -1 })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Text Answer</span>
                </label>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Question</label>
              <textarea
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter your question..."
              />
            </div>

            {/* MCQ Options */}
            {newQuestion.questionType === 'mcq' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Options</label>
                  <div className="space-y-2">
                    {(newQuestion.options as string[]).map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-6 text-sm font-medium text-gray-600">{String.fromCharCode(65 + idx)}.</span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleNewOptionChange(idx, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder={`Option ${idx + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Correct Answer</label>
                  <select
                    value={newQuestion.correctAnswer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    {(newQuestion.options as string[]).map((_, idx) => (
                      <option key={idx} value={idx}>Option {String.fromCharCode(65 + idx)}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Text Answer Info */}
            {newQuestion.questionType === 'text' && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">Text Answer Question: Students will write their answer in a text box.</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddQuestion}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? 'Adding...' : 'Add Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      {questions.length === 0 && !showAddForm ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No questions yet. Click &quot;Add Question&quot; to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={q.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              {editingQuestion === q.id ? (
                // Edit Mode
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Question</label>
                    <textarea
                      value={editForm.question}
                      onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  {editForm.questionType === 'mcq' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Options</label>
                        <div className="space-y-2">
                          {(editForm.options as string[] || []).map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <span className="w-6 text-sm font-medium text-gray-600">{String.fromCharCode(65 + optIdx)}.</span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => handleEditOptionChange(optIdx, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder={`Option ${optIdx + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Correct Answer</label>
                        <select
                          value={editForm.correctAnswer}
                          onChange={(e) => setEditForm({ ...editForm, correctAnswer: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        >
                          {(editForm.options as string[] || []).map((_, optIdx) => (
                            <option key={optIdx} value={optIdx}>Option {String.fromCharCode(65 + optIdx)}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={cancelEdit} className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                      Cancel
                    </button>
                    <button onClick={handleUpdateQuestion} disabled={saving} className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1">
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          Q{idx + 1}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${q.questionType === 'mcq' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                          {q.questionType === 'mcq' ? 'MCQ' : 'Text Answer'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 mb-2">{q.question}</p>
                      
                      {q.questionType === 'mcq' && q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${optIdx === q.correctAnswer ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="text-xs text-gray-600">{opt || `Option ${optIdx + 1}`}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(q)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}