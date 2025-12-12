import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Car, 
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
  AlertCircle,
  AlertTriangle,
  Images,
  CircleAlert,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import * as XLSX from 'xlsx'
import API_BASE_URL from './Config'

// Status options for vehicles
const statusOptions = ['All', 'Pending', 'Complete']


const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  
  // If it's already in YYYY-MM-DD format, return as is
  if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString
  }
  
  // Try to parse and format the date
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    
    // Format as YYYY-MM-DD for HTML date input
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
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
        className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">{message}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-shrink-0 h-6 w-6 p-0 text-green-600 hover:bg-green-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

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

// Helper function to get image data URLs from vehicle images
const getVehicleImageUrls = (images) => {
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

// Helper function to get alert border color class
const getAlertBorderClass = (overallAlert) => {
  if (!overallAlert) return 'border-[var(--color-border)]'
  
  switch (overallAlert.border_color) {
    case 'red':
      return 'border-red-500 border-2'
    case 'yellow':
      return 'border-yellow-500 border-2'
    default:
      return 'border-[var(--color-border)]'
  }
}

// Helper function to get alert background class
const getAlertBackgroundClass = (overallAlert) => {
  if (!overallAlert || overallAlert.status === 'none') return ''
  
  switch (overallAlert.border_color) {
    case 'red':
      return 'bg-red-50'
    case 'yellow':
      return 'bg-yellow-50'
    default:
      return ''
  }
}

// Alert Badge Component
function AlertBadge({ overallAlert, ltoAlert, maintenanceAlert }) {
  if (!overallAlert || !overallAlert.show_exclamation) return null

  const getAlertColor = () => {
    switch (overallAlert.border_color) {
      case 'red':
        return 'text-red-600 bg-red-100'
      case 'yellow':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getAlertMessages = () => {
    const messages = []
    if (ltoAlert && ltoAlert.status !== 'none') {
      messages.push(ltoAlert.message)
    }
    if (maintenanceAlert && maintenanceAlert.status !== 'none') {
      messages.push(maintenanceAlert.message)
    }
    return messages
  }

  return (
    <div className="absolute top-2 right-2 z-10">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`p-1 rounded-full ${getAlertColor()} shadow-lg`}
        title={getAlertMessages().join(', ')}
      >
        <CircleAlert className="h-4 w-4" />
      </motion.div>
    </div>
  )
}

// Alert Details Component
function AlertDetails({ ltoAlert, maintenanceAlert }) {
  const hasAlerts = (ltoAlert && ltoAlert.status !== 'none') || (maintenanceAlert && maintenanceAlert.status !== 'none')
  
  if (!hasAlerts) return null

  return (
    <div className="mt-2 space-y-1">
      {ltoAlert && ltoAlert.status !== 'none' && (
        <div className={`text-xs px-2 py-1 rounded ${
          ltoAlert.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            <span>{ltoAlert.message}</span>
          </div>
        </div>
      )}
      {maintenanceAlert && maintenanceAlert.status !== 'none' && (
        <div className={`text-xs px-2 py-1 rounded ${
          maintenanceAlert.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            <span>{maintenanceAlert.message}</span>
          </div>
        </div>
      )}
    </div>
  )
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

          {/* Image - Now using base64 data URLs directly */}
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
                  Delete Vehicle
                </h3>
                <p className="text-sm text-[var(--color-foreground)]/70 mt-1">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            
            <p className="text-[var(--color-foreground)]/80 mb-6">
              Are you sure you want to delete "{itemName}"? This will permanently remove the vehicle and all associated data.
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

// Vehicle Modal Component (for Add and Edit)
function VehicleModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    vehicle_name: '',
    lto_renewal_date: '',
    maintenance_date: '',
    description: '',
    status: 'pending',
    images: []
  })

  const [selectedImages, setSelectedImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [keepExistingImages, setKeepExistingImages] = useState(true)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (initialData) {
      // Pre-fill form with existing data - FIXED: Properly format dates for HTML date inputs
      setFormData({
        vehicle_name: initialData.vehicle_name || '',
        lto_renewal_date: formatDateForInput(initialData.lto_renewal_date),
        maintenance_date: formatDateForInput(initialData.maintenance_date),
        description: initialData.description || '',
        status: initialData.status || 'pending',
        images: initialData.images || []
      })
      
      // Set existing images for display
      const imageUrls = getVehicleImageUrls(initialData.images)
      setExistingImages(imageUrls)
      setKeepExistingImages(true)
    } else {
      // Reset form for new vehicle
      setFormData({
        vehicle_name: '',
        lto_renewal_date: '',
        maintenance_date: '',
        description: '',
        status: 'pending',
        images: []
      })
      setExistingImages([])
      setKeepExistingImages(true)
    }
    setSelectedImages([])
  }, [initialData, isOpen])

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
    // When new images are selected, we'll replace existing ones
    setKeepExistingImages(false)
  }

  const removeNewImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const clearNewImages = () => {
    setSelectedImages([])
    setKeepExistingImages(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.vehicle_name || !formData.lto_renewal_date) {
      alert('Vehicle Name and LTO Renewal Date are required fields')
      return
    }
    
    const submitData = new FormData()
    
    // Add form data
    submitData.append('vehicle_name', formData.vehicle_name)
    submitData.append('lto_renewal_date', formData.lto_renewal_date)
    if (formData.maintenance_date) {
      submitData.append('maintenance_date', formData.maintenance_date)
    }
    submitData.append('description', formData.description)
    submitData.append('status', formData.status)
    
    // Add images only if new ones are selected
    if (selectedImages.length > 0) {
      selectedImages.forEach((image, index) => {
        submitData.append(`images[${index}]`, image)
      })
    }
    // If no new images and it's an update, the backend will keep existing images
    
    if (initialData) {
      submitData.append('_method', 'PUT')
    }
    
    onSubmit(submitData, initialData?.id)
    onClose()
  }

  // Prepare dropdown options
  const statusDropdownOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'complete', label: 'Complete' }
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
                {initialData ? 'Edit Vehicle' : 'Add New Vehicle'}
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
              {/* Images Section */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Images (Max 10)
                </label>
                
                {/* Existing Images Display (for edit mode) */}
                {initialData && existingImages.length > 0 && keepExistingImages && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[var(--color-foreground)]/70">Current Images</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs"
                      >
                        Replace Images
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {existingImages.slice(0, 6).map((imageUrl, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={imageUrl}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-full object-cover rounded border border-[var(--color-border)]"
                          />
                        </div>
                      ))}
                      {existingImages.length > 6 && (
                        <div className="aspect-square bg-[var(--color-muted)] rounded border border-[var(--color-border)] flex items-center justify-center">
                          <span className="text-xs text-[var(--color-foreground)]/70">
                            +{existingImages.length - 6} more
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* New Images Upload */}
                <div className="space-y-2">
                  {(!initialData || !keepExistingImages) && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-6 text-center cursor-pointer hover:border-[var(--color-primary)] transition-colors"
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-[var(--color-foreground)]/50" />
                      <p className="text-sm text-[var(--color-foreground)]/70">
                        Click to upload images or drag and drop
                      </p>
                      <p className="text-xs text-[var(--color-foreground)]/50 mt-1">
                        PNG, JPG, GIF up to 10 files
                      </p>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {/* Selected Images Preview */}
                  {selectedImages.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--color-foreground)]">
                          Selected Images ({selectedImages.length})
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={clearNewImages}
                          className="text-xs"
                        >
                          Clear All
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedImages.map((file, index) => (
                          <div key={index} className="relative aspect-square">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover rounded border border-[var(--color-border)]"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeNewImage(index)}
                              className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 text-white hover:bg-red-600 rounded-full"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicle Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Vehicle Name *
                </label>
                <input
                  type="text"
                  value={formData.vehicle_name}
                  onChange={(e) => handleInputChange('vehicle_name', e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-all duration-200"
                  placeholder="Enter vehicle name"
                  required
                />
              </div>

              {/* LTO Renewal Date */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  LTO Renewal Date *
                </label>
                <input
                  type="date"
                  value={formData.lto_renewal_date}
                  onChange={(e) => handleInputChange('lto_renewal_date', e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-all duration-200"
                  required
                />
              </div>

              {/* Maintenance Date */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Maintenance Date
                </label>
                <input
                  type="date"
                  value={formData.maintenance_date}
                  onChange={(e) => handleInputChange('maintenance_date', e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-all duration-200"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-all duration-200 resize-none"
                  placeholder="Enter vehicle description"
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

              {/* Form Actions */}
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
                  className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors"
                >
                  {initialData ? 'Update Vehicle' : 'Add Vehicle'}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Main VehicleMonitoring Component
export default function VehicleMonitoring() {
  // State management
  const [vehicles, setVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [vehicleToDelete, setVehicleToDelete] = useState(null)
  const [successAlert, setSuccessAlert] = useState({ show: false, message: '' })
  const [imageGalleryModal, setImageGalleryModal] = useState({ isOpen: false, images: [], initialIndex: 0 })

  const itemsPerPage = 12

  // Fetch vehicles data
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/vehicles`)
      const data = await response.json()
      
      if (data.success) {
        setVehicles(data.data || [])
      } else {
        console.error('Failed to fetch vehicles:', data.message)
        setVehicles([])
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Filter and search vehicles
  useEffect(() => {
    let filtered = vehicles

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(vehicle => 
        vehicle.status?.toLowerCase() === statusFilter.toLowerCase()
      )
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(vehicle =>
        vehicle.vehicle_name?.toLowerCase().includes(searchLower) ||
        vehicle.description?.toLowerCase().includes(searchLower)
      )
    }

    setFilteredVehicles(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [vehicles, searchTerm, statusFilter])

  // Initial data fetch
  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  // Handle vehicle submission (add/edit)
  const handleVehicleSubmit = async (formData, vehicleId = null) => {
    try {
      const url = vehicleId 
        ? `${API_BASE_URL}/vehicles/${vehicleId}`
        : `${API_BASE_URL}/vehicles`
      
      const method = vehicleId ? 'POST' : 'POST' // Using POST for both since we're using FormData with _method
      
      const response = await fetch(url, {
        method,
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchVehicles() // Refresh the list
        setSuccessAlert({
          show: true,
          message: vehicleId ? 'Vehicle updated successfully!' : 'Vehicle added successfully!'
        })
        setEditingVehicle(null)
      } else {
        console.error('Failed to save vehicle:', data.message || data.errors)
        alert('Failed to save vehicle. Please try again.')
      }
    } catch (error) {
      console.error('Error saving vehicle:', error)
      alert('Error saving vehicle. Please try again.')
    }
  }

  // Handle vehicle deletion
  const handleDeleteVehicle = async (vehicleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchVehicles() // Refresh the list
        setSuccessAlert({
          show: true,
          message: 'Vehicle deleted successfully!'
        })
      } else {
        console.error('Failed to delete vehicle:', data.message)
        alert('Failed to delete vehicle. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      alert('Error deleting vehicle. Please try again.')
    }
  }

  // Handle status update
  const handleStatusUpdate = async (vehicleId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchVehicles() // Refresh the list
        setSuccessAlert({
          show: true,
          message: 'Vehicle status updated successfully!'
        })
      } else {
        console.error('Failed to update status:', data.message)
        alert('Failed to update status. Please try again.')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating status. Please try again.')
    }
  }

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredVehicles.map(vehicle => ({
      'Vehicle Name': vehicle.vehicle_name,
      'LTO Renewal Date': vehicle.lto_renewal_date,
      'Maintenance Date': vehicle.maintenance_date || 'Not set',
      'Description': vehicle.description,
      'Status': vehicle.status,
      'LTO Alert': vehicle.lto_renewal_alert?.message || 'No alert',
      'Maintenance Alert': vehicle.maintenance_alert?.message || 'No alert',
      'Created Date': new Date(vehicle.created_at).toLocaleDateString()
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicles')
    XLSX.writeFile(wb, `vehicles_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Pagination calculations
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex)

  // Prepare dropdown options
  const statusDropdownOptions = statusOptions.map(status => ({
    value: status,
    label: status
  }))

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      <SuccessAlert
        isVisible={successAlert.show}
        message={successAlert.message}
        onClose={() => setSuccessAlert({ show: false, message: '' })}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
            Vehicle Monitoring
          </h1>
          <p className="text-[var(--color-foreground)]/70 mt-2">
            Track and manage vehicle information with renewal alerts
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button
            onClick={() => {
              setEditingVehicle(null)
              setIsModalOpen(true)
            }}
            className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-foreground)]/50 h-4 w-4" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-all duration-200"
          />
        </div>

        {/* Status Filter */}
        <CustomDropdown
          options={statusDropdownOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Filter by status"
          className="w-full sm:w-48"
        />
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
          <span className="ml-2 text-[var(--color-foreground)]/70">Loading vehicles...</span>
        </div>
      )}

      {/* Vehicles Grid */}
      {!loading && (
        <>
          {currentVehicles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <Car className="h-16 w-16 text-[var(--color-foreground)]/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[var(--color-foreground)]/70 mb-2">
                No vehicles found
              </h3>
              <p className="text-[var(--color-foreground)]/50 mb-4">
                {searchTerm || statusFilter !== 'All' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first vehicle'
                }
              </p>
              {!searchTerm && statusFilter === 'All' && (
                <Button
                  onClick={() => {
                    setEditingVehicle(null)
                    setIsModalOpen(true)
                  }}
                  className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Vehicle
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {currentVehicles.map((vehicle, index) => {
                const imageUrls = getVehicleImageUrls(vehicle.images)
                const borderClass = getAlertBorderClass(vehicle.overall_alert)
                const backgroundClass = getAlertBackgroundClass(vehicle.overall_alert)

                return (
                  <motion.div
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                    className="group"
                  >
                    <Card className={`${borderClass} ${backgroundClass} hover:shadow-lg transition-all duration-300 relative overflow-hidden`}>
                      {/* Alert Badge */}
                      <AlertBadge 
                        overallAlert={vehicle.overall_alert}
                        ltoAlert={vehicle.lto_renewal_alert}
                        maintenanceAlert={vehicle.maintenance_alert}
                      />

                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-semibold text-[var(--color-foreground)] truncate">
                              {vehicle.vehicle_name}
                            </CardTitle>
                            <div className="flex items-center mt-2 text-sm text-[var(--color-foreground)]/70">
                              <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                LTO: {vehicle.lto_renewal_date ? new Date(vehicle.lto_renewal_date).toLocaleDateString() : 'Not set'}
                              </span>
                            </div>
                            {vehicle.maintenance_date && (
                              <div className="flex items-center mt-1 text-sm text-[var(--color-foreground)]/70">
                                <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  Maintenance: {new Date(vehicle.maintenance_date).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Status Badge */}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                            vehicle.status === 'complete' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {vehicle.status === 'complete' ? 'Complete' : 'Pending'}
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {/* Alert Details */}
                        <AlertDetails 
                          ltoAlert={vehicle.lto_renewal_alert}
                          maintenanceAlert={vehicle.maintenance_alert}
                        />

                        {/* Images Preview */}
                        {imageUrls.length > 0 && (
                          <div className="mb-4 mt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Images className="h-4 w-4 text-[var(--color-foreground)]/70" />
                              <span className="text-sm text-[var(--color-foreground)]/70">
                                {imageUrls.length} image{imageUrls.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {imageUrls.slice(0, 3).map((imageUrl, imgIndex) => (
                                <div
                                  key={imgIndex}
                                  className="relative aspect-square cursor-pointer group/img"
                                  onClick={() => setImageGalleryModal({
                                    isOpen: true,
                                    images: imageUrls,
                                    initialIndex: imgIndex
                                  })}
                                >
                                  <img
                                    src={imageUrl}
                                    alt={`${vehicle.vehicle_name} ${imgIndex + 1}`}
                                    className="w-full h-full object-cover rounded border border-[var(--color-border)] group-hover/img:opacity-80 transition-opacity"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors rounded flex items-center justify-center">
                                    <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                  </div>
                                  {imgIndex === 2 && imageUrls.length > 3 && (
                                    <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                                      <span className="text-white text-xs font-medium">
                                        +{imageUrls.length - 3}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        {vehicle.description && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-4 w-4 text-[var(--color-foreground)]/70" />
                              <span className="text-sm font-medium text-[var(--color-foreground)]/70">Description</span>
                            </div>
                            <p className="text-sm text-[var(--color-foreground)]/80 line-clamp-2">
                              {vehicle.description}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border)]">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingVehicle(vehicle)
                                setIsModalOpen(true)
                              }}
                              className="text-[var(--color-primary)] hover:bg-[var(--color-primary)]"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setVehicleToDelete(vehicle)
                                setDeleteModalOpen(true)
                              }}
                              className="text-red-600 hover:bg-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(
                              vehicle.id,
                              vehicle.status === 'complete' ? 'pending' : 'complete'
                            )}
                            className={`text-xs transition-colors ${
                              vehicle.status === 'complete'
                                ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                                : 'border-green-300 text-green-700 hover:bg-green-500'
                            }`}
                          >
                            Mark as {vehicle.status === 'complete' ? 'Pending' : 'Complete'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center items-center space-x-2 mt-8"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={
                        currentPage === pageNum
                          ? "bg-[var(--color-primary)] text-white"
                          : "border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
                      }
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </>
      )}

      {/* Vehicle Modal */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingVehicle(null)
        }}
        onSubmit={handleVehicleSubmit}
        initialData={editingVehicle}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setVehicleToDelete(null)
        }}
        onConfirm={() => {
          if (vehicleToDelete) {
            handleDeleteVehicle(vehicleToDelete.id)
            setDeleteModalOpen(false)
            setVehicleToDelete(null)
          }
        }}
        itemName={vehicleToDelete?.vehicle_name}
      />

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={imageGalleryModal.isOpen}
        onClose={() => setImageGalleryModal({ isOpen: false, images: [], initialIndex: 0 })}
        images={imageGalleryModal.images}
        initialIndex={imageGalleryModal.initialIndex}
      />
    </div>
  )
}

