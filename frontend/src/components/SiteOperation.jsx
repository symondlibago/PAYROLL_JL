import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  MapPin, 
  Calendar, 
  Building, 
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
  FileText,
  Users,
  Cloud,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import * as XLSX from 'xlsx'
import API_BASE_URL from './Config' // Assuming API_BASE_URL is defined elsewhere or directly used

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

// Success Alert Component
function SuccessAlert({ isVisible, message, onClose }) {
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
        transition={{ duration: 0.3 }}
        className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
      >
        <CheckCircle className="h-5 w-5" />
        <span className="font-medium">{message}</span>
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

// Delete Confirmation Modal Component (copied from ExpensesReceipts)
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, message, isDeleting }) {
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--color-foreground)]">
                {title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-[var(--color-foreground)]/70 mb-6">
              {message}
            </p>
            
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isDeleting}
                className="border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isDeleting}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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

// Daily Update Modal Component
function DailyUpdateModal({ isOpen, onClose, onSubmit, initialData, projectId, isSubmitting }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weather: '',
    manpower: '',
    activity: '',
    images: []
  })

  const [selectedImages, setSelectedImages] = useState([])
  const [activities, setActivities] = useState([''])
  const [existingImages, setExistingImages] = useState([])
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (initialData) {
      // Format the date properly for the date input
      const formattedDate = initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      
      setFormData({
        date: formattedDate,
        weather: initialData.weather || '',
        manpower: initialData.manpower || '',
        activity: initialData.activity || '',
        images: initialData.images || []
      })
      
      // Parse activities from the activity string
      const activityList = initialData.activity ? initialData.activity.split('\n').filter(a => a.trim()) : ['']
      setActivities(activityList.length > 0 ? activityList : [''])
      
      // Set existing images from image_data_urls
      setExistingImages(initialData.image_data_urls || [])
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        weather: '',
        manpower: '',
        activity: '',
        images: []
      })
      setActivities([''])
      setExistingImages([])
    }
    setSelectedImages([])
  }, [initialData, isOpen])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleActivityChange = (index, value) => {
    const newActivities = [...activities]
    newActivities[index] = value
    setActivities(newActivities)
    
    // Update the activity field in formData
    const activityString = newActivities.filter(a => a.trim()).join('\n')
    setFormData(prev => ({ ...prev, activity: activityString }))
  }

  const addActivity = () => {
    setActivities([...activities, ''])
  }

  const removeActivity = (index) => {
    if (activities.length > 1) {
      const newActivities = activities.filter((_, i) => i !== index)
      setActivities(newActivities)
      
      const activityString = newActivities.filter(a => a.trim()).join('\n')
      setFormData(prev => ({ ...prev, activity: activityString }))
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + selectedImages.length + existingImages.length > 10) {
      alert('Maximum 10 images allowed')
      return
    }
    setSelectedImages(prev => [...prev, ...files])
  }

  const removeNewImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.date || !formData.activity) {
      alert('Date and Activity are required fields')
      return
    }
    
    const submitData = new FormData()
    
    // Add form data
    if (!initialData) {
      submitData.append('project_id', projectId)
    }
    
    // Always include required fields
    submitData.append('date', formData.date)
    submitData.append('activity', formData.activity)
    
    // Only include optional fields if they have values
    if (formData.weather && formData.weather.trim() !== '') {
      submitData.append('weather', formData.weather)
    }
    
    if (formData.manpower && formData.manpower !== '') {
      submitData.append('manpower', formData.manpower)
    }
    
    // Handle images - only add new images if any are selected
    if (selectedImages.length > 0) {
      selectedImages.forEach((image, index) => {
        submitData.append(`images[${index}]`, image)
      })
    }
    
    onSubmit(submitData, initialData?.id)
  }

  const weatherOptions = [
    { value: '', label: 'Select weather' },
    { value: 'Sunny', label: 'Sunny' },
    { value: 'Cloudy', label: 'Cloudy' },
    { value: 'Rainy', label: 'Rainy' },
    { value: 'Stormy', label: 'Stormy' },
    { value: 'Overcast', label: 'Overcast' }
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
                {initialData ? 'Edit Daily Update' : 'Add Daily Update'}
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
              {/* Existing Images Display (for edit mode) */}
              {initialData && initialData.image_data_urls && initialData.image_data_urls.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Current Images
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    {initialData.image_data_urls.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Upload Section */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  {initialData ? 'Add New Images (Optional)' : 'Images (Max 10)'}
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
                    {initialData ? 'Upload Additional Images' : 'Upload Images'}
                  </Button>
                  
                  {selectedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`New ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNewImage(index)}
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

                {/* Weather */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Weather
                  </label>
                  <CustomDropdown
                    options={weatherOptions}
                    value={formData.weather}
                    onChange={(value) => handleInputChange('weather', value)}
                    placeholder="Select weather"
                  />
                </div>
              </div>

              {/* Manpower */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Manpower
                </label>
                <input
                  type="number"
                  value={formData.manpower}
                  onChange={(e) => handleInputChange('manpower', e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                  placeholder="Number of workers"
                  min="0"
                />
              </div>

              {/* Activities */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Activities *
                </label>
                <div className="space-y-2">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={activity}
                        onChange={(e) => handleActivityChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                        placeholder={`Activity ${index + 1}`}
                        required={index === 0}
                      />
                      {activities.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeActivity(index)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addActivity}
                    className="border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:opacity-90 transition-opacity"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {initialData ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    `${initialData ? 'Update' : 'Add'} Daily Update`
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Project Modal Component
function ProjectModal({ isOpen, onClose, onSubmit, initialData, isSubmitting }) {
  const [formData, setFormData] = useState({
    project_name: '',
    project_location: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        project_name: initialData.project_name || '',
        project_location: initialData.project_location || ''
      })
    } else {
      setFormData({
        project_name: '',
        project_location: ''
      })
    }
  }, [initialData, isOpen])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.project_name || !formData.project_location) {
      alert('Project name and location are required')
      return
    }
    
    const submitData = new FormData()
    submitData.append('project_name', formData.project_name)
    submitData.append('project_location', formData.project_location)
    
    onSubmit(submitData, initialData?.id)
  }

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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                {initialData ? 'Edit Project' : 'Add New Project'}
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
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.project_name}
                  onChange={(e) => handleInputChange('project_name', e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Project Location *
                </label>
                <input
                  type="text"
                  value={formData.project_location}
                  onChange={(e) => handleInputChange('project_location', e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                  placeholder="Enter project location"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:opacity-90 transition-opacity"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {initialData ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    `${initialData ? 'Update' : 'Add'} Project`
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Main SiteOperation Component
function SiteOperation() {
  const [projects, setProjects] = useState([])
  const [dailyUpdates, setDailyUpdates] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDailyUpdateModalOpen, setIsDailyUpdateModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [editingDailyUpdate, setEditingDailyUpdate] = useState(null)
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [expandedProjects, setExpandedProjects] = useState(new Set())
  const [isDeleting, setIsDeleting] = useState(null)
  const [isDeletingUpdate, setIsDeletingUpdate] = useState(null)
  const [successAlert, setSuccessAlert] = useState({ isVisible: false, message: '' })
  const [imageGallery, setImageGallery] = useState({ isOpen: false, images: [], initialIndex: 0 })
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: '', id: null, projectId: null })
  const [expandedActivities, setExpandedActivities] = useState(new Set())
  const [loadingDailyUpdates, setLoadingDailyUpdates] = useState(new Set())
  const [isSubmittingProject, setIsSubmittingProject] = useState(false)
  const [isSubmittingDailyUpdate, setIsSubmittingDailyUpdate] = useState(false)
  // Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/projects`)
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      } else {
        console.error('Failed to fetch projects')
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch daily updates for a project
  const fetchDailyUpdates = useCallback(async (projectId) => {
    try {
      // Set loading state for this specific project
      setLoadingDailyUpdates(prev => new Set([...prev, projectId]))
      
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/daily-updates`)
      if (response.ok) {
        const data = await response.json()
        setDailyUpdates(prev => ({ ...prev, [projectId]: data }))
      } else {
        console.error('Failed to fetch daily updates')
      }
    } catch (error) {
      console.error('Error fetching daily updates:', error)
    } finally {
      // Remove loading state for this specific project
      setLoadingDailyUpdates(prev => {
        const newSet = new Set(prev)
        newSet.delete(projectId)
        return newSet
      })
    }
  }, [])


  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Filter projects based on search term
  const filteredProjects = useMemo(() => {
    return projects.filter(project =>
      project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.project_location.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [projects, searchTerm])

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredProjects.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredProjects, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)

  // Handle project submission (add/edit)
  const handleProjectSubmit = async (formData, projectId = null) => {
    try {
      setIsSubmittingProject(true)
      const url = projectId 
        ? `${API_BASE_URL}/projects/${projectId}`
        : `${API_BASE_URL}/projects`
      
      let response
      
      if (projectId) {
        // For updates, use POST with _method override
        formData.append('_method', 'PUT')
        response = await fetch(url, {
          method: 'POST',
          body: formData
        })
      } else {
        // For creates, use POST
        response = await fetch(url, {
          method: 'POST',
          body: formData
        })
      }

      if (response.ok) {
        await fetchProjects()
        setIsModalOpen(false)
        setEditingProject(null)
        showSuccessAlert(projectId ? 'Project updated successfully!' : 'Project added successfully!')
      } else {
        const errorData = await response.json()
        console.error('Failed to save project:', errorData)
        alert('Failed to save project. Please try again.')
      }
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Error saving project. Please try again.')
    } finally {
      setIsSubmittingProject(false)
    }
  }

  // Handle daily update submission (add/edit)
  const handleDailyUpdateSubmit = async (formData, updateId = null) => {
    try {
      setIsSubmittingDailyUpdate(true)
      const url = updateId 
        ? `${API_BASE_URL}/daily-updates/${updateId}`
        : `${API_BASE_URL}/daily-updates`
      
      let response
      
      if (updateId) {
        // For updates, use POST with _method override
        formData.append('_method', 'PUT')
        response = await fetch(url, {
          method: 'POST',
          body: formData
        })
      } else {
        // For creates, use POST
        response = await fetch(url, {
          method: 'POST',
          body: formData
        })
      }

      if (response.ok) {
        if (selectedProjectId) {
          await fetchDailyUpdates(selectedProjectId)
        }
        setIsDailyUpdateModalOpen(false)
        setEditingDailyUpdate(null)
        setSelectedProjectId(null)
        showSuccessAlert(updateId ? 'Daily update updated successfully!' : 'Daily update added successfully!')
      } else {
        const errorData = await response.json()
        console.error('Failed to save daily update:', errorData)
        alert('Failed to save daily update. Please try again.')
      }
    } catch (error) {
      console.error('Error saving daily update:', error)
      alert('Error saving daily update. Please try again.')
    } finally {
      setIsSubmittingDailyUpdate(false)
    }
  }

  // Handle project deletion
  const handleDelete = async (projectId) => {
    setDeleteModal({
      isOpen: true,
      type: 'project',
      id: projectId,
      projectId: null
    })
  }

  // Handle daily update deletion
  const handleDeleteDailyUpdate = async (updateId, projectId) => {
    setDeleteModal({
      isOpen: true,
      type: 'dailyUpdate',
      id: updateId,
      projectId: projectId
    })
  }

  // Confirm deletion
  const confirmDelete = async () => {
    const { type, id, projectId } = deleteModal
    
    try {
      if (type === 'project') {
        setIsDeleting(id)
        const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await fetchProjects()
          showSuccessAlert('Project deleted successfully!')
        } else {
          console.error('Failed to delete project')
          alert('Failed to delete project. Please try again.')
        }
        setIsDeleting(null)
      } else if (type === 'dailyUpdate') {
        setIsDeletingUpdate(id)
        const response = await fetch(`${API_BASE_URL}/daily-updates/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await fetchDailyUpdates(projectId)
          showSuccessAlert('Daily update deleted successfully!')
        } else {
          console.error('Failed to delete daily update')
          alert('Failed to delete daily update. Please try again.')
        }
        setIsDeletingUpdate(null)
      }
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Error deleting. Please try again.')
      setIsDeleting(null)
      setIsDeletingUpdate(null)
    } finally {
      setDeleteModal({ isOpen: false, type: '', id: null, projectId: null })
    }
  }

  // Handle edit
  const handleEdit = (project) => {
    setEditingProject(project)
    setIsModalOpen(true)
  }

  // Handle daily update edit
  const handleEditDailyUpdate = (update) => {
    setEditingDailyUpdate(update)
    setSelectedProjectId(update.project_id)
    setIsDailyUpdateModalOpen(true)
  }

  // Handle daily update add
  const handleAddDailyUpdate = (projectId) => {
    setEditingDailyUpdate(null)
    setSelectedProjectId(projectId)
    setIsDailyUpdateModalOpen(true)
  }

  // Handle project row expansion
  const handleToggleExpand = async (projectId) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
      // Fetch daily updates if not already loaded
      if (!dailyUpdates[projectId]) {
        await fetchDailyUpdates(projectId)
      }
    }
    setExpandedProjects(newExpanded)
  }

  // Handle activity expansion
  const handleToggleActivities = (updateId) => {
    const newExpanded = new Set(expandedActivities)
    if (newExpanded.has(updateId)) {
      newExpanded.delete(updateId)
    } else {
      newExpanded.add(updateId)
    }
    setExpandedActivities(newExpanded)
  }

  // Show success alert
  const showSuccessAlert = (message) => {
    setSuccessAlert({ isVisible: true, message })
  }

  // Handle image gallery
  const handleImageClick = (images, index) => {
    setImageGallery({ isOpen: true, images, initialIndex: index })
  }

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredProjects.map(project => ({
      'Project Name': project.project_name,
      'Project Location': project.project_location,
      'Created Date': new Date(project.created_at).toLocaleDateString()
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Projects')
    XLSX.writeFile(wb, 'site_operation_projects.xlsx')
  }

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      <SuccessAlert
        isVisible={successAlert.isVisible}
        message={successAlert.message}
        onClose={() => setSuccessAlert({ isVisible: false, message: '' })}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
            Site Operation
          </h1>
          <p className="text-[var(--color-foreground)]/70 mt-1">
            Manage your construction projects and daily updates
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)] hover:text-[var(--color-primary)]"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => {
              setEditingProject(null)
              setIsModalOpen(true)
            }}
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="border-[var(--color-border)] bg-[var(--color-card)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-foreground)]/70">Total Projects</p>
                <p className="text-2xl font-bold text-[var(--color-foreground)]">{projects.length}</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] bg-[var(--color-card)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-foreground)]/70">Active Locations</p>
                <p className="text-2xl font-bold text-[var(--color-foreground)]">
                  {new Set(projects.map(p => p.project_location)).size}
                </p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-r from-[var(--color-chart-2)] to-[var(--color-chart-3)] rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] bg-[var(--color-card)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-foreground)]/70">This Month</p>
                <p className="text-2xl font-bold text-[var(--color-foreground)]">
                  {projects.filter(p => {
                    const projectDate = new Date(p.created_at)
                    const now = new Date()
                    return projectDate.getMonth() === now.getMonth() && 
                          projectDate.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-r from-[var(--color-chart-4)] to-[var(--color-chart-5)] rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-foreground)]/50" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
          />
        </div>
      </motion.div>

      {/* Projects Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-[var(--color-border)] bg-[var(--color-card)]">
          <CardHeader>
            <CardTitle className="text-[var(--color-foreground)]">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70 w-8"></th>
                        <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Project Name</th>
                        <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Location</th>
                        <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Created Date</th>
                        <th className="text-right py-3 px-4 font-medium text-[var(--color-foreground)]/70">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {paginatedProjects.map((project, index) => (
                          <React.Fragment key={project.id}>
                            <motion.tr
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="border-b border-[var(--color-border)]/50 hover:bg-gray-100 transition-colors"
                            >
                              <td className="py-3 px-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleExpand(project.id)}
                                className="text-black hover:bg-[var(--color-muted)] hover:text-white"
                                disabled={loadingDailyUpdates.has(project.id)}
                              >
                                {loadingDailyUpdates.has(project.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <motion.div
                                    animate={{ rotate: expandedProjects.has(project.id) ? 90 : 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </motion.div>
                                )}
                              </Button>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-medium text-[var(--color-foreground)]">
                                  {project.project_name}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center text-[var(--color-foreground)]/70">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  {project.project_location}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-[var(--color-foreground)]/70">
                                {new Date(project.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAddDailyUpdate(project.id)}
                                    className="text-[var(--color-primary)] hover:bg-[#0e1048] hover:text-white"
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(project)}
                                    className="text-[var(--color-primary)] hover:bg-[#0e1048] hover:text-white"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(project.id)}
                                    disabled={isDeleting === project.id}
                                    className="text-red-500 hover:bg-red-500 hover:text-white"
                                  >
                                    {isDeleting === project.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </td>
                            </motion.tr>
                            
                            {/* Collapsible Daily Updates Section */}
                            <AnimatePresence>
                              {expandedProjects.has(project.id) && (
                                <motion.tr
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <td colSpan="5" className="py-0 px-4">
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                      <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-semibold text-[var(--color-foreground)]">
                                          Daily Updates
                                        </h4>
                                        <Button
                                          size="sm"
                                          onClick={() => handleAddDailyUpdate(project.id)}
                                          className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:opacity-90 transition-opacity"
                                        >
                                          <Plus className="h-4 w-4 mr-2" />
                                          Add Update
                                        </Button>
                                      </div>
                                      
                                      {loadingDailyUpdates.has(project.id) ? (
                                      <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
                                        <span className="ml-2 text-[var(--color-foreground)]/70">Loading daily updates...</span>
                                      </div>
                                    ) : dailyUpdates[project.id] && dailyUpdates[project.id].length > 0 ? (
                                      <div className="space-y-4">
                                        {dailyUpdates[project.id].map((update) => {
                                          const activities = update.activity.split('\n').filter(a => a.trim())
                                          const isExpanded = expandedActivities.has(update.id)
                                          const displayedActivities = isExpanded ? activities : activities.slice(0, 4)
                                          const hasMoreActivities = activities.length > 4

                                            return (
                                              <div
                                                key={update.id}
                                                className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4"
                                              >
                                                <div className="flex items-start justify-between mb-3">
                                                  <div className="flex items-center space-x-4">
                                                    <div className="flex items-center text-[var(--color-foreground)]/70">
                                                      <Calendar className="h-4 w-4 mr-2" />
                                                      {new Date(update.date).toLocaleDateString()}
                                                    </div>
                                                    {update.weather && (
                                                      <div className="flex items-center text-[var(--color-foreground)]/70">
                                                        <Cloud className="h-4 w-4 mr-2" />
                                                        {update.weather}
                                                      </div>
                                                    )}
                                                    {update.manpower && (
                                                      <div className="flex items-center text-[var(--color-foreground)]/70">
                                                        <Users className="h-4 w-4 mr-2" />
                                                        {update.manpower} workers
                                                      </div>
                                                    )}
                                                  </div>
                                                  <div className="flex items-center space-x-2">
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => handleEditDailyUpdate(update)}
                                                      className="text-[var(--color-primary)] hover:bg-[#0e1048] hover:text-white"
                                                    >
                                                      <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => handleDeleteDailyUpdate(update.id, project.id)}
                                                      disabled={isDeletingUpdate === update.id}
                                                      className="text-red-500 hover:bg-red-500 hover:text-white"
                                                    >
                                                      {isDeletingUpdate === update.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                      ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                      )}
                                                    </Button>
                                                  </div>
                                                </div>
                                                
                                                <div className="mb-3">
                                                  <h5 className="font-medium text-[var(--color-foreground)] mb-2">Activities:</h5>
                                                  <div className="text-[var(--color-foreground)]/70">
                                                    {displayedActivities.map((activity, idx) => (
                                                      <div key={idx} className="flex items-start mb-1">
                                                        <span className="mr-2">-</span>
                                                        <span>{activity}</span>
                                                      </div>
                                                    ))}
                                                    {hasMoreActivities && (
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleActivities(update.id)}
                                                        className="text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] mt-2 p-0 h-auto"
                                                      >
                                                        {isExpanded ? 'Show Less' : `...More (${activities.length - 4} more)`}
                                                      </Button>
                                                    )}
                                                  </div>
                                                </div>
                                                
                                                {update.image_data_urls && update.image_data_urls.length > 0 && (
                                                  <div className="flex items-center space-x-2">
                                                    <div className="relative">
                                                      <img
                                                        src={update.image_data_urls[0]}
                                                        alt="Daily update"
                                                        className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                                        onClick={() => handleImageClick(update.image_data_urls, 0)}
                                                      />
                                                      {update.image_data_urls.length > 1 && (
                                                        <div className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                                          +{update.image_data_urls.length - 1}
                                                        </div>
                                                      )}
                                                    </div>
                                                    {update.image_data_urls.length > 1 && (
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleImageClick(update.image_data_urls, 0)}
                                                        className="text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                                                      >
                                                        <ZoomIn className="h-4 w-4 mr-2" />
                                                        View All ({update.image_data_urls.length})
                                                      </Button>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            )
                                          })}
                                        </div>
                                      ) : (
                                        <div className="text-center py-8">
                                          <FileText className="h-12 w-12 text-[var(--color-foreground)]/30 mx-auto mb-4" />
                                          <p className="text-[var(--color-foreground)]/70">No daily updates yet</p>
                                          <p className="text-sm text-[var(--color-foreground)]/50 mt-1">
                                            Add your first daily update to get started
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </motion.tr>
                              )}
                            </AnimatePresence>
                          </React.Fragment>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-[var(--color-foreground)]/70">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProjects.length)} of {filteredProjects.length} projects
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="border-[var(--color-border)]"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-[var(--color-foreground)]">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="border-[var(--color-border)]"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {filteredProjects.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-[var(--color-foreground)]/30 mx-auto mb-4" />
                    <p className="text-[var(--color-foreground)]/70">No projects found</p>
                    <p className="text-sm text-[var(--color-foreground)]/50 mt-1">
                      {searchTerm ? 'Try adjusting your search terms' : 'Add your first project to get started'}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingProject(null)
        }}
        onSubmit={handleProjectSubmit}
        initialData={editingProject}
        isSubmitting={isSubmittingProject}
      />

      {/* Daily Update Modal */}
      <DailyUpdateModal
        isOpen={isDailyUpdateModalOpen}
        onClose={() => {
          setIsDailyUpdateModalOpen(false)
          setEditingDailyUpdate(null)
          setSelectedProjectId(null)
        }}
        onSubmit={handleDailyUpdateSubmit}
        initialData={editingDailyUpdate}
        projectId={selectedProjectId}
        isSubmitting={isSubmittingDailyUpdate}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: '', id: null, projectId: null })}
        onConfirm={confirmDelete}
        title={deleteModal.type === 'project' ? 'Delete Project' : 'Delete Daily Update'}
        message={deleteModal.type === 'project' 
          ? 'Are you sure you want to delete this project? This action cannot be undone and will also delete all associated daily updates.'
          : 'Are you sure you want to delete this daily update? This action cannot be undone.'
        }
        isDeleting={deleteModal.type === 'project' ? isDeleting === deleteModal.id : isDeletingUpdate === deleteModal.id}
      />

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={imageGallery.isOpen}
        onClose={() => setImageGallery({ isOpen: false, images: [], initialIndex: 0 })}
        images={imageGallery.images}
        initialIndex={imageGallery.initialIndex}
      />
    </div>
  )
}

export default SiteOperation

