import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  FileQuestion, 
  Calendar, 
  FileText, 
  Download,
  Trash2,
  Edit,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  Upload,
  ZoomIn,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import * as XLSX from 'xlsx'
import API_BASE_URL from './Config'

// Status options for RFI queries
const statusOptions = ['All', 'Pending', 'Approved', 'Reject']

// Helper function to convert image data to data URL
const getImageDataUrl = (imageData) => {
  if (!imageData) return null
  
  // If it's already a data URL, return as is
  if (typeof imageData === 'string' && imageData.startsWith('data:')) {
    return imageData
  }
  
  // If it's an object with data and mime_type, construct data URL
  if (imageData.data && imageData.mime_type) {
    return `data:${imageData.mime_type};base64,${imageData.data}`
  }
  
  return null
}

// Helper function to get image data URLs from query images
const getQueryImageUrls = (images) => {
  if (!images) return []
  
  // Handle case where images is a JSON string
  let imageArray = images
  if (typeof images === 'string') {
    try {
      imageArray = JSON.parse(images)
    } catch (e) {
      console.error('Failed to parse images JSON:', e)
      return []
    }
  }
  
  if (!Array.isArray(imageArray)) return []
  
  return imageArray.map(getImageDataUrl).filter(Boolean)
}

// Image Gallery Modal Component
function ImageGalleryModal({ isOpen, onClose, images, initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex, isOpen])

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (!isOpen || !images || images.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={prevImage}
                className="absolute left-4 z-10 text-white bg-black/50 hover:bg-white/20"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextImage}
                className="absolute right-4 z-10 text-white bg-black/50 hover:bg-white/20"
              >
                <ArrowRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Image */}
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Expandable Text Component
function ExpandableText({ text, maxLength = 100, className = "" }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  if (!text || text.length <= maxLength) {
    return <div className={`${className} break-words overflow-wrap-anywhere`}>{text}</div>
  }
  
  const truncatedText = text.substring(0, maxLength)
  
  return (
    <div className={`${className} break-words overflow-wrap-anywhere`}>
      <div className="mb-1">
        {isExpanded ? text : truncatedText}
        {!isExpanded && '...'}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsExpanded(!isExpanded)
        }}
        className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium text-xs transition-colors underline"
      >
        {isExpanded ? 'show less' : 'show more'}
      </button>
    </div>
  )
}

// Custom Dropdown Component
function CustomDropdown({ options, value, onChange, placeholder, className = "", disabled = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (option) => {
    onChange(option.value)
    setIsOpen(false)
  }

  const selectedOption = options.find(option => option.value === value)

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] 
          rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] 
          focus:outline-none transition-all duration-200 flex items-center justify-between
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[var(--color-primary)]/50 cursor-pointer'}
          ${isOpen ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20' : ''}
        `}
      >
        <span className={selectedOption ? 'text-[var(--color-foreground)]' : 'text-[var(--color-foreground)]/50'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-[var(--color-foreground)]/50" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <ul className="py-1">
              {options.map((option, index) => (
                <motion.li
                  key={option.value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15, delay: index * 0.02 }}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full text-left px-4 py-2 text-sm transition-colors duration-150
                      hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]
                      ${value === option.value ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--color-foreground)]'}
                    `}
                  >
                    {option.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Status Action Dropdown Component
function StatusActionDropdown({ currentStatus, onStatusChange, queryId }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const statusActions = [
    { value: 'pending', label: 'Pending', icon: AlertTriangle, color: 'text-yellow-600' },
    { value: 'approved', label: 'Approve', icon: CheckCircle, color: 'text-green-600' },
    { value: 'reject', label: 'Reject', icon: XCircle, color: 'text-red-600' }
  ]

  const handleStatusSelect = (status) => {
    onStatusChange(queryId, status)
    setIsOpen(false)
  }

  const getCurrentStatusInfo = () => {
    const statusInfo = statusActions.find(action => action.value === currentStatus)
    return statusInfo || statusActions[0]
  }

  const currentStatusInfo = getCurrentStatusInfo()

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-3 py-2 border border-[var(--color-border)] 
          rounded-lg text-sm font-medium focus:outline-none transition-all duration-200 
          flex items-center justify-between hover:border-[var(--color-primary)]/50
          ${isOpen ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20' : ''}
          ${currentStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 
            currentStatus === 'reject' ? 'bg-red-50 text-red-700 border-red-200' : 
            'bg-yellow-50 text-yellow-700 border-yellow-200'}
        `}
      >
        <div className="flex items-center gap-2">
          <currentStatusInfo.icon className="h-4 w-4" />
          <span className="capitalize">{currentStatus}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-lg"
          >
            <ul className="py-1">
              {statusActions.map((action, index) => (
                <motion.li
                  key={action.value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15, delay: index * 0.02 }}
                >
                  <button
                    type="button"
                    onClick={() => handleStatusSelect(action.value)}
                    className={`
                      w-full text-left px-4 py-2 text-sm transition-colors duration-150
                      hover:bg-[var(--color-primary)]/10 flex items-center gap-2
                      ${currentStatus === action.value ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : action.color}
                    `}
                  >
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Delete Confirmation Modal Component
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, itemName }) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-foreground)]">
                  Delete RFI Query
                </h3>
                <p className="text-sm text-[var(--color-foreground)]/70 mt-1">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            
            <p className="text-[var(--color-foreground)]/80 mb-6">
              Are you sure you want to delete "{itemName}"? This will permanently remove the RFI query and all associated data.
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                className="bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// RFI Query Modal Component (for Add and Edit)
function RFIQueryModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState(initialData || {
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    images: []
  })

  const [selectedImages, setSelectedImages] = useState([])
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (initialData) {
      setFormData({
        description: initialData.description || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        status: initialData.status || 'pending',
        images: initialData.images || []
      })
    } else {
      setFormData({
        description: '',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        images: []
      })
    }
    setSelectedImages([])
  }, [initialData])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + selectedImages.length > 10) {
      alert('Maximum 10 images allowed')
      return
    }
    setSelectedImages(prev => [...prev, ...files])
  }

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.description || !formData.date) {
      alert('Description and Date are required fields')
      return
    }
    
    const submitData = new FormData()
    
    // Add form data
    submitData.append('description', formData.description)
    submitData.append('date', formData.date)
    submitData.append('status', formData.status)
    
    // Add images
    selectedImages.forEach((image, index) => {
      submitData.append(`images[${index}]`, image)
    })
    
    if (initialData) {
      submitData.append('_method', 'PUT')
    }
    
    onSubmit(submitData, initialData?.id)
    onClose()
  }

  // Prepare dropdown options
  const statusDropdownOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'reject', label: 'Reject' }
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                {initialData ? 'Edit RFI Query' : 'Add New RFI Query'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Images Upload Section */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Images (Max 10)
                </label>
                <div className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Images
                  </Button>
                  
                  {selectedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors resize-none"
                  rows={6}
                  placeholder="Enter RFI query description..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Status
                  </label>
                  <CustomDropdown
                    options={statusDropdownOptions}
                    value={formData.status}
                    onChange={(value) => handleInputChange('status', value)}
                    placeholder="Select status"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:opacity-90 transition-opacity"
                >
                  {initialData ? 'Update RFI Query' : 'Add RFI Query'}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Success Alert Component
function SuccessAlert({ message, isVisible, onClose }) {
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
        className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
      >
        <CheckCircle className="h-5 w-5" />
        <span>{message}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-white/20 ml-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </motion.div>
    </AnimatePresence>
  )
}

// Main RFIQueries Component
export default function RFIQueries() {
  const [rfiQueries, setRfiQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingQuery, setEditingQuery] = useState(null)
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [successAlert, setSuccessAlert] = useState({ visible: false, message: '' })
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, queryId: null, queryName: '' })

  // Fetch RFI queries from API
  const fetchRfiQueries = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/rfi-queries`)
      const data = await response.json()
      
      if (data.success) {
        setRfiQueries(data.data || [])
      } else {
        console.error('Failed to fetch RFI queries:', data.message)
      }
    } catch (error) {
      console.error('Error fetching RFI queries:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRfiQueries()
  }, [fetchRfiQueries])

  // Filter and search RFI queries
  const filteredQueries = useMemo(() => {
    return rfiQueries.filter(query => {
      const matchesSearch = query.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === 'All' || query.status === selectedStatus.toLowerCase()
      return matchesSearch && matchesStatus
    })
  }, [rfiQueries, searchTerm, selectedStatus])

  // Handle RFI query submission (add/edit)
  const handleQuerySubmit = async (formData, queryId = null) => {
    try {
      const url = queryId 
        ? `${API_BASE_URL}/rfi-queries/${queryId}` 
        : `${API_BASE_URL}/rfi-queries`
      
      const method = 'POST'
      
      const response = await fetch(url, {
        method,
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchRfiQueries()
        setSuccessAlert({
          visible: true,
          message: queryId ? 'RFI query updated successfully!' : 'RFI query added successfully!'
        })
      } else {
        alert(data.message || 'Failed to save RFI query')
      }
    } catch (error) {
      console.error('Error saving RFI query:', error)
      alert('Failed to save RFI query')
    }
  }

  // Handle RFI query deletion
  const handleDeleteQuery = async (queryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rfi-queries/${queryId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchRfiQueries()
        setSuccessAlert({
          visible: true,
          message: 'RFI query deleted successfully!'
        })
      } else {
        alert(data.message || 'Failed to delete RFI query')
      }
    } catch (error) {
      console.error('Error deleting RFI query:', error)
      alert('Failed to delete RFI query')
    }
  }

  // Handle status update
  const handleStatusUpdate = async (queryId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rfi-queries/${queryId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchRfiQueries()
        setSuccessAlert({
          visible: true,
          message: 'RFI query status updated successfully!'
        })
      } else {
        alert(data.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredQueries.map(query => ({
      'Description': query.description,
      'Date': query.date,
      'Status': query.status,
      'Created At': new Date(query.created_at).toLocaleDateString(),
      'Updated At': new Date(query.updated_at).toLocaleDateString()
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'RFI Queries')
    XLSX.writeFile(wb, `rfi_queries_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Open image gallery
  const openImageGallery = (images, index = 0) => {
    const imageUrls = getQueryImageUrls(images)
    setSelectedImages(imageUrls)
    setSelectedImageIndex(index)
    setImageGalleryOpen(true)
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Open delete confirmation modal
  const openDeleteModal = (queryId, queryDescription) => {
    setDeleteModal({
      isOpen: true,
      queryId,
      queryName: queryDescription.length > 50 ? queryDescription.substring(0, 50) + '...' : queryDescription
    })
  }

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, queryId: null, queryName: '' })
  }

  // Confirm deletion
  const confirmDelete = () => {
    if (deleteModal.queryId) {
      handleDeleteQuery(deleteModal.queryId)
      closeDeleteModal()
    }
  }

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      <SuccessAlert
        message={successAlert.message}
        isVisible={successAlert.visible}
        onClose={() => setSuccessAlert({ visible: false, message: '' })}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
            RFI-Queries
          </h1>
          <p className="text-[var(--color-foreground)]/70 mt-1">
            Manage Request for Information queries and responses
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => {
              setEditingQuery(null)
              setIsModalOpen(true)
            }}
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add RFI Query
          </Button>
        </div>
      </motion.div>

      {/* Search and Filter Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-foreground)]/50 h-4 w-4" />
          <input
            type="text"
            placeholder="Search RFI queries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {statusOptions.map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? "default" : "outline"}
              onClick={() => setSelectedStatus(status)}
              className={
                selectedStatus === status
                  ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white"
                  : "border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
              }
            >
              {status}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* RFI Queries Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredQueries.map((query, index) => {
              const imageUrls = getQueryImageUrls(query.images)
              
              return (
                <motion.div
                  key={query.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <Card className="min-h-[450px] border border-[var(--color-border)] hover:shadow-lg transition-all duration-300 hover:border-[var(--color-primary)]/30 bg-[var(--color-card)] flex flex-col">
                    <CardContent className="p-4 flex flex-col h-full">
                      {/* Image Section */}
                      <div className="mb-3">
                        {imageUrls.length > 0 ? (
                          <div className="relative">
                            <img
                              src={imageUrls[0]}
                              alt="RFI Query"
                              className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => openImageGallery(query.images, 0)}
                              onError={(e) => {
                                console.error('Image failed to load:', imageUrls[0])
                                e.target.style.display = 'none'
                              }}
                            />
                            {imageUrls.length > 1 && (
                              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                +{imageUrls.length - 1}
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openImageGallery(query.images, 0)}
                              className="absolute inset-0 w-full h-full opacity-0 hover:opacity-100 bg-black/20 transition-opacity flex items-center justify-center"
                            >
                              <ZoomIn className="h-6 w-6 text-white" />
                            </Button>
                          </div>
                        ) : (
                          <div className="w-full h-32 bg-[var(--color-muted)] rounded-lg flex items-center justify-center">
                            <FileText className="h-8 w-8 text-[var(--color-foreground)]/30" />
                          </div>
                        )}
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-sm mb-3">
                        <Calendar className="h-4 w-4 text-[var(--color-foreground)]/50" />
                        <span className="text-[var(--color-foreground)]/70">
                          {formatDate(query.date)}
                        </span>
                      </div>

                      {/* Description */}
                      <div className="flex-1 mb-3">
                        <ExpandableText 
                          text={query.description} 
                          maxLength={80}
                          className="text-sm text-[var(--color-foreground)]/80 leading-relaxed"
                        />
                      </div>

                      {/* Status Dropdown */}
                      <div className="mb-3 mt-auto">
                        <StatusActionDropdown
                          currentStatus={query.status}
                          onStatusChange={handleStatusUpdate}
                          queryId={query.id}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingQuery(query)
                            setIsModalOpen(true)
                          }}
                          className="flex-1 border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)] text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteModal(query.id, query.description)}
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-500 text-xs"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && filteredQueries.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <FileQuestion className="h-16 w-16 text-[var(--color-foreground)]/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
            No RFI queries found
          </h3>
          <p className="text-[var(--color-foreground)]/70 mb-4">
            {searchTerm || selectedStatus !== 'All' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Get started by adding your first RFI query.'}
          </p>
          <Button
            onClick={() => {
              setEditingQuery(null)
              setIsModalOpen(true)
            }}
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add RFI Query
          </Button>
        </motion.div>
      )}

      {/* RFI Query Modal */}
      <RFIQueryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingQuery(null)
        }}
        onSubmit={handleQuerySubmit}
        initialData={editingQuery}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        itemName={deleteModal.queryName}
      />

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={imageGalleryOpen}
        onClose={() => setImageGalleryOpen(false)}
        images={selectedImages}
        initialIndex={selectedImageIndex}
      />
    </div>
  )
}

