import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  ClipboardList, 
  Users, 
  Calendar, 
  MapPin,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye,
  Flag,
  X,
  Loader2,
  ChevronDown,
  MessageCircle,
  Send,
  Reply,
  MoreHorizontal,
  ChevronUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import API_BASE_URL from './Config'

// Custom Dropdown Component
const CustomDropdown = React.memo(({ label, required = false, value, onChange, options, placeholder, disabled = false, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)

  useEffect(() => {
    const option = options.find(opt => opt.value === value)
    setSelectedOption(option || null)
  }, [value, options])

  const handleSelect = useCallback((option) => {
    setSelectedOption(option)
    onChange(option.value)
    setIsOpen(false)
  }, [onChange])

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none text-left flex items-center justify-between ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'
        }`}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
          >
            <ul className="py-1 text-sm text-gray-700 max-h-60 overflow-y-auto">
              {options.map((option, index) => (
                <motion.li
                  key={option.value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(option)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-150"
                  >
                    {option.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
})

// Success Alert Component
const SuccessAlert = React.memo(({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.95 }}
        className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-md"
      >
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
          <p className="text-green-800 font-medium">{message}</p>
          <button
            onClick={onClose}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
})

// Comments Modal Component
const CommentsModal = React.memo(({ isOpen, onClose, task, onCommentAdded }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Fetch comments for the task
  const fetchComments = useCallback(async () => {
    if (!task?.id) return
    
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/tasks/${task.id}/comments`)
      const data = await response.json()
      
      if (data.success) {
        setComments(data.data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }, [task?.id])

  useEffect(() => {
    if (isOpen && task?.id) {
      fetchComments()
    }
  }, [isOpen, task?.id, fetchComments])

  // Add new comment
  const handleAddComment = useCallback(async () => {
    if (!newComment.trim() || !authorName.trim()) return

    try {
      setSubmitting(true)
      const response = await fetch(`${API_BASE_URL}/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: newComment,
          author_name: authorName,
          parent_id: null
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setNewComment('')
        fetchComments()
        onCommentAdded && onCommentAdded()
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setSubmitting(false)
    }
  }, [newComment, authorName, task?.id, fetchComments, onCommentAdded])

  // Add reply to comment
  const handleAddReply = useCallback(async (parentId) => {
    if (!replyText.trim() || !authorName.trim()) return

    try {
      setSubmitting(true)
      const response = await fetch(`${API_BASE_URL}/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: replyText,
          author_name: authorName,
          parent_id: parentId
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setReplyText('')
        setReplyingTo(null)
        fetchComments()
        onCommentAdded && onCommentAdded()
      }
    } catch (error) {
      console.error('Error adding reply:', error)
    } finally {
      setSubmitting(false)
    }
  }, [replyText, authorName, task?.id, fetchComments, onCommentAdded])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Fixed */}
          <div className="p-6 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Comments for "{task?.name}"
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Comments Container - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-medium text-gray-900">{comment.author_name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(comment.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    </div>
                    <p className="text-gray-700 mb-3">{comment.comment}</p>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="bg-gray-50 rounded p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900 text-sm">{reply.author_name}</span>
                              <span className="text-xs text-gray-500">
                                {formatDate(reply.created_at)}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">{reply.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply form */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 ml-6 border-l-2 border-blue-200 pl-4">
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Your name"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none text-sm"
                          />
                          <textarea
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none text-sm"
                            rows="2"
                          />
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleAddReply(comment.id)}
                              disabled={!replyText.trim() || !authorName.trim() || submitting}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reply'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setReplyingTo(null)
                                setReplyText('')
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add new comment - Fixed at bottom */}
          <div className="p-6 border-t bg-gray-50 flex-shrink-0">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Your name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
              />
              <textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                rows="3"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || !authorName.trim() || submitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Add Comment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

// Delete Confirmation Modal
const DeleteConfirmationModal = React.memo(({ isOpen, onClose, onConfirm, isDeleting, taskName }) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => !isDeleting && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-100 rounded-full mr-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Task</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">{taskName}</span>? 
              This will permanently remove the task from the system.
            </p>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={onClose}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={onConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Task'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

// Multi-select Employee Dropdown
const MultiSelectEmployeeDropdown = React.memo(({ label, required = false, value, onChange, employees, placeholder, disabled = false, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState([])

  useEffect(() => {
    if (value && Array.isArray(value)) {
      const selected = employees.filter(emp => value.includes(emp.id))
      setSelectedEmployees(selected)
    } else {
      setSelectedEmployees([])
    }
  }, [value, employees])

  const handleToggleEmployee = useCallback((employee) => {
    const isSelected = selectedEmployees.some(emp => emp.id === employee.id)
    let newSelected
    
    if (isSelected) {
      newSelected = selectedEmployees.filter(emp => emp.id !== employee.id)
    } else {
      newSelected = [...selectedEmployees, employee]
    }
    
    setSelectedEmployees(newSelected)
    onChange(newSelected.map(emp => emp.id))
  }, [selectedEmployees, onChange])

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none text-left flex items-center justify-between ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'
        }`}
      >
        <span className={selectedEmployees.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
          {selectedEmployees.length > 0 
            ? `${selectedEmployees.length} employee(s) selected`
            : placeholder
          }
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
          >
            <ul className="py-1 text-sm text-gray-700 max-h-60 overflow-y-auto">
              {employees.map((employee, index) => {
                const isSelected = selectedEmployees.some(emp => emp.id === employee.id)
                return (
                  <motion.li
                    key={employee.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleEmployee(employee)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-150 flex items-center ${
                        isSelected ? 'bg-blue-50 text-blue-900' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mr-2"
                      />
                      {employee.name} ({employee.employee_id})
                    </button>
                  </motion.li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
})

// Add Task Modal
const AddTaskModal = React.memo(({ isOpen, onClose, onSubmit, isSubmitting, employees }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assigned_employee_ids: [],
    date: '',
    location: '',
    status: 'Pending',
    priority: 'Medium',
    category: ''
  })

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        assigned_employee_ids: [],
        date: '',
        location: '',
        status: 'Pending',
        priority: 'Medium',
        category: ''
      })
    }
  }, [isOpen])

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(() => {
    onSubmit(formData)
  }, [formData, onSubmit])

  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'Overdue', label: 'Overdue' }
  ]

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' }
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => !isSubmitting && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
              <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Row 1: Name & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter task name"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter category"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Row 2: Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                  placeholder="Enter task description"
                  rows="3"
                  disabled={isSubmitting}
                />
              </div>

              {/* Row 3: Assigned Employees */}
              <MultiSelectEmployeeDropdown
                label="Assigned Employees"
                required={true}
                value={formData.assigned_employee_ids}
                onChange={(value) => handleInputChange('assigned_employee_ids', value)}
                employees={employees}
                placeholder="Select employees"
                disabled={isSubmitting}
              />

              {/* Row 4: Date & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter location"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Row 5: Status & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomDropdown
                  label="Status"
                  required={true}
                  value={formData.status}
                  onChange={(value) => handleInputChange('status', value)}
                  options={statusOptions}
                  placeholder="Select status"
                  disabled={isSubmitting}
                />
                <CustomDropdown
                  label="Priority"
                  required={true}
                  value={formData.priority}
                  onChange={(value) => handleInputChange('priority', value)}
                  options={priorityOptions}
                  placeholder="Select priority"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6 pt-6 border-t">
              <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleSubmit}
                disabled={!formData.name || !formData.description || !formData.category || formData.assigned_employee_ids.length === 0 || !formData.date || !formData.location || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

// Edit Task Modal
const EditTaskModal = React.memo(({ isOpen, onClose, onSubmit, isSubmitting, task, employees }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assigned_employee_ids: [],
    date: '',
    location: '',
    status: 'Pending',
    priority: 'Medium',
    category: ''
  })

  // Populate form when modal opens with task data
  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        assigned_employee_ids: task.assigned_employee_ids ? JSON.parse(task.assigned_employee_ids) : [],
        date: task.date || '',
        location: task.location || '',
        status: task.status || 'Pending',
        priority: task.priority || 'Medium',
        category: task.category || ''
      })
    }
  }, [isOpen, task])

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(() => {
    const submitData = { ...formData, id: task.id }
    onSubmit(submitData)
  }, [formData, onSubmit, task])

  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'Overdue', label: 'Overdue' }
  ]

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' }
  ]

  if (!isOpen || !task) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => !isSubmitting && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Task</h2>
              <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Row 1: Name & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter task name"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter category"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Row 2: Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                  placeholder="Enter task description"
                  rows="3"
                  disabled={isSubmitting}
                />
              </div>

              {/* Row 3: Assigned Employees */}
              <MultiSelectEmployeeDropdown
                label="Assigned Employees"
                required={true}
                value={formData.assigned_employee_ids}
                onChange={(value) => handleInputChange('assigned_employee_ids', value)}
                employees={employees}
                placeholder="Select employees"
                disabled={isSubmitting}
              />

              {/* Row 4: Date & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter location"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Row 5: Status & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomDropdown
                  label="Status"
                  required={true}
                  value={formData.status}
                  onChange={(value) => handleInputChange('status', value)}
                  options={statusOptions}
                  placeholder="Select status"
                  disabled={isSubmitting}
                />
                <CustomDropdown
                  label="Priority"
                  required={true}
                  value={formData.priority}
                  onChange={(value) => handleInputChange('priority', value)}
                  options={priorityOptions}
                  placeholder="Select priority"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6 pt-6 border-t">
              <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleSubmit}
                disabled={!formData.name || !formData.description || !formData.category || formData.assigned_employee_ids.length === 0 || !formData.date || !formData.location || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Task'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

function TaskMonitoring() {
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedPriority, setSelectedPriority] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [successAlert, setSuccessAlert] = useState({ isVisible: false, message: '' })
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set())

  // Fetch tasks from backend
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/tasks`)
      const data = await response.json()
      
      if (data.success) {
        setTasks(data.data)
      } else {
        console.error('Failed to fetch tasks:', data.message)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch employees from backend
  const fetchEmployees = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`)
      const data = await response.json()
      
      if (data.success) {
        setEmployees(data.data)
      } else {
        console.error('Failed to fetch employees:', data.message)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }, [])

  // Load tasks and employees on component mount
  useEffect(() => {
    fetchTasks()
    fetchEmployees()
  }, [fetchTasks, fetchEmployees])

  // Add new task
  const handleAddTask = useCallback(async (formData) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setTasks(prev => [data.data, ...prev])
        setIsAddModalOpen(false)
        setSuccessAlert({
          isVisible: true,
          message: 'Task created successfully!'
        })
      } else {
        console.error('Failed to create task:', data.message)
        alert('Failed to create task. Please try again.')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Error creating task. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  // Edit task
  const handleEditTask = useCallback(async (formData) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`${API_BASE_URL}/tasks/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setTasks(prev => prev.map(task => 
          task.id === formData.id ? data.data : task
        ))
        setIsEditModalOpen(false)
        setSelectedTask(null)
        setSuccessAlert({
          isVisible: true,
          message: 'Task updated successfully!'
        })
      } else {
        console.error('Failed to update task:', data.message)
        alert('Failed to update task. Please try again.')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Error updating task. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  // Delete task
  const handleDeleteTask = useCallback(async () => {
    if (!selectedTask) return

    try {
      setIsDeleting(true)
      const response = await fetch(`${API_BASE_URL}/tasks/${selectedTask.id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setTasks(prev => prev.filter(task => task.id !== selectedTask.id))
        setIsDeleteModalOpen(false)
        setSelectedTask(null)
        setSuccessAlert({
          isVisible: true,
          message: 'Task deleted successfully!'
        })
      } else {
        console.error('Failed to delete task:', data.message)
        alert('Failed to delete task. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Error deleting task. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }, [selectedTask])

  // Open edit modal
  const openEditModal = useCallback((task) => {
    setSelectedTask(task)
    setIsEditModalOpen(true)
  }, [])

  // Open delete modal
  const openDeleteModal = useCallback((task) => {
    setSelectedTask(task)
    setIsDeleteModalOpen(true)
  }, [])

  // Open comments modal
  const openCommentsModal = useCallback((task) => {
    setSelectedTask(task)
    setIsCommentsModalOpen(true)
  }, [])

  // Handle comment added
  const handleCommentAdded = useCallback(() => {
    // Refresh tasks to update comment count
    fetchTasks()
  }, [fetchTasks])

  // Toggle description expansion
  const toggleDescription = useCallback((taskId) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }, [])

  // Truncate description
  const truncateDescription = (description, maxLength = 100) => {
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength) + '...'
  }

  // Filter tasks based on search term, status, priority, and category
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.assigned_employees && task.assigned_employees.some(emp => 
                           emp.name?.toLowerCase().includes(searchTerm.toLowerCase())
                         ))
    
    const matchesStatus = selectedStatus === 'All' || task.status === selectedStatus
    const matchesPriority = selectedPriority === 'All' || task.priority === selectedPriority
    const matchesCategory = selectedCategory === 'All' || task.category === selectedCategory
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  // Calculate statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === 'Completed').length
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length
  const overdueTasks = tasks.filter(task => task.status === 'Overdue').length

  // Get unique values for filters
  const categories = [...new Set(tasks.map(task => task.category).filter(Boolean))]

  // Dropdown options
  const statusOptions = [
    { value: 'All', label: 'All Status' },
    { value: 'Pending', label: 'Pending' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'Overdue', label: 'Overdue' }
  ]

  const priorityOptions = [
    { value: 'All', label: 'All Priorities' },
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' }
  ]

  const categoryOptions = [
    { value: 'All', label: 'All Categories' },
    ...categories.map(category => ({ value: category, label: category }))
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border-[var(--color-primary)]/30'
      case 'In Progress': return 'bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] border-[var(--color-secondary)]/30'
      case 'Pending': return 'bg-[var(--color-muted)]/20 text-[var(--color-muted)] border-[var(--color-muted)]/30'
      case 'Scheduled': return 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border-[var(--color-accent)]/30'
      case 'Overdue': return 'bg-[var(--color-destructive)]/20 text-[var(--color-destructive)] border-[var(--color-destructive)]/30'
      default: return 'bg-[var(--color-muted)]/20 text-[var(--color-muted)] border-[var(--color-muted)]/30'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-[var(--color-destructive)]'
      case 'High': return 'text-[var(--color-primary)]'
      case 'Medium': return 'text-[var(--color-secondary)]'
      case 'Low': return 'text-[var(--color-muted)]'
      default: return 'text-[var(--color-foreground)]/70'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return CheckCircle
      case 'In Progress': return Play
      case 'Pending': return Pause
      case 'Scheduled': return Calendar
      case 'Overdue': return AlertCircle
      default: return ClipboardList
    }
  }

  const TaskCard = ({ task, index }) => {
    const StatusIcon = getStatusIcon(task.status)
    const isExpanded = expandedDescriptions.has(task.id)
    const shouldTruncate = task.description && task.description.length > 100
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ scale: 1.01 }}
        className="group"
      >
        <Card className="bg-white border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-300 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">{task.name}</h3>
                <div className="text-sm text-[var(--color-foreground)]/70 mb-3">
                  {shouldTruncate && !isExpanded ? (
                    <div>
                      {truncateDescription(task.description)}
                      <button
                        onClick={() => toggleDescription(task.id)}
                        className="text-blue-600 hover:text-blue-800 ml-1 font-medium"
                      >
                        ...more
                      </button>
                    </div>
                  ) : (
                    <div>
                      {task.description}
                      {shouldTruncate && isExpanded && (
                        <button
                          onClick={() => toggleDescription(task.id)}
                          className="text-blue-600 hover:text-blue-800 ml-1 font-medium"
                        >
                          show less
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Flag className={`h-4 w-4 ${getPriorityColor(task.priority)}`} />
                <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-[var(--color-primary)]" />
                  <span className="text-[var(--color-foreground)]/70">{task.date}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
                  <span className="text-[var(--color-foreground)]/70">{task.location}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4 text-[var(--color-primary)]" />
                  <span className="text-[var(--color-foreground)]/70">
                    {task.assigned_employees ? task.assigned_employees.length : 0} members
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-[var(--color-foreground)]/70">Category: </span>
                  <span className="text-[var(--color-foreground)]">{task.category}</span>
                </div>
                <div className="text-sm">
                  <span className="text-[var(--color-foreground)]/70">Priority: </span>
                  <span className={getPriorityColor(task.priority)}>{task.priority}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-[var(--color-foreground)] mb-2">Assigned Members:</h4>
              <div className="flex flex-wrap gap-2">
                {task.assigned_employees && task.assigned_employees.length > 0 ? (
                  task.assigned_employees.map((employee, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-[var(--color-muted)] text-[var(--color-muted-foreground)] rounded-full text-xs"
                    >
                      {employee.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[var(--color-foreground)]/70">No employees assigned</span>
                )}
              </div>
            </div>

            {/* Comments indicator */}
            {task.comments_count > 0 && (
              <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-sm text-blue-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  <span>{task.comments_count} comment{task.comments_count !== 1 ? 's' : ''} on this task</span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-blue-600 hover:bg-blue-50 hover:text-blue-700" 
                  onClick={() => openCommentsModal(task)}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Comments
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="ghost" className="text-[var(--color-secondary)] hover:bg-[#0e1048] hover:text-white" onClick={() => openEditModal(task)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-[var(--color-destructive)] hover:bg-red-500 hover:text-white" onClick={() => openDeleteModal(task)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      <SuccessAlert
        message={successAlert.message}
        isVisible={successAlert.isVisible}
        onClose={() => setSuccessAlert({ isVisible: false, message: '' })}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
            Task Monitoring
          </h1>
          <p className="text-[var(--color-foreground)]/70 mt-1">Track and manage all tasks and assignments</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-secondary)] hover:to-[var(--color-primary)] text-white"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="bg-white border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground)]/70">Total Tasks</p>
                <p className="text-3xl font-bold text-[var(--color-foreground)]">{totalTasks}</p>
                <p className="text-sm text-[var(--color-primary)] mt-1">All tasks</p>
              </div>
              <div className="p-3 bg-[var(--color-primary)]/20 rounded-lg">
                <ClipboardList className="h-8 w-8 text-[var(--color-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground)]/70">Completed</p>
                <p className="text-3xl font-bold text-[var(--color-foreground)]">{completedTasks}</p>
                <p className="text-sm text-[var(--color-primary)] mt-1">Finished tasks</p>
              </div>
              <div className="p-3 bg-[var(--color-primary)]/20 rounded-lg">
                <CheckCircle className="h-8 w-8 text-[var(--color-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground)]/70">In Progress</p>
                <p className="text-3xl font-bold text-[var(--color-foreground)]">{inProgressTasks}</p>
                <p className="text-sm text-[var(--color-primary)] mt-1">Active tasks</p>
              </div>
              <div className="p-3 bg-[var(--color-primary)]/20 rounded-lg">
                <Play className="h-8 w-8 text-[var(--color-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground)]/70">Overdue</p>
                <p className="text-3xl font-bold text-[var(--color-foreground)]">{overdueTasks}</p>
                <p className="text-sm text-[var(--color-primary)] mt-1">Delayed tasks</p>
              </div>
              <div className="p-3 bg-[var(--color-primary)]/20 rounded-lg">
                <AlertCircle className="h-8 w-8 text-[var(--color-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white border-[var(--color-border)] shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search tasks, descriptions, locations, categories, or employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <CustomDropdown
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={statusOptions}
                  placeholder="Filter by status"
                  className="w-full sm:w-48"
                />
                <CustomDropdown
                  value={selectedPriority}
                  onChange={setSelectedPriority}
                  options={priorityOptions}
                  placeholder="Filter by priority"
                  className="w-full sm:w-48"
                />
                <CustomDropdown
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  options={categoryOptions}
                  placeholder="Filter by category"
                  className="w-full sm:w-48"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tasks Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {filteredTasks.length === 0 ? (
          <Card className="bg-white border-[var(--color-border)] shadow-md">
            <CardContent className="p-12 text-center">
              <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedStatus !== 'All' || selectedPriority !== 'All' || selectedCategory !== 'All'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by creating your first task.'}
              </p>
              <Button 
                className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-secondary)] hover:to-[var(--color-primary)] text-white"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTask}
        isSubmitting={isSubmitting}
        employees={employees}
      />

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedTask(null)
        }}
        onSubmit={handleEditTask}
        isSubmitting={isSubmitting}
        task={selectedTask}
        employees={employees}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedTask(null)
        }}
        onConfirm={handleDeleteTask}
        isDeleting={isDeleting}
        taskName={selectedTask?.name}
      />

      <CommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => {
          setIsCommentsModalOpen(false)
          setSelectedTask(null)
        }}
        task={selectedTask}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  )
}

export default TaskMonitoring

