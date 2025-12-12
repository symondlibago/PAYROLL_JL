import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Receipt, 
  Calendar, 
  DollarSign, 
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
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import * as XLSX from 'xlsx'
import API_BASE_URL from './Config' // Assuming API_BASE_URL is defined elsewhere or directly used

// const API_BASE_URL = 'http://localhost:8000/api' // Directly defining API_BASE_URL here

// Image Gallery Modal Component
function ImageGalleryModal({ isOpen, onClose, images, initialIndex = 0, expenseId }) {
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
            src={`data:${images[currentIndex].mime_type};base64,${images[currentIndex].data}`}
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

// Expense Modal Component (for Add and Edit)
function ExpenseModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState(initialData || {
    date: new Date().toISOString().split('T')[0],
    orSiNo: '',
    description: '',
    quantity: '',
    sizeDimension: '',
    unitPrice: '',
    totalPrice: '',
    mop: '',
    mopDescription: '',
    category: 'Plumbing',
    location: '',
    store: '',
    images: []
  })

  const [selectedImages, setSelectedImages] = useState([])
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date || new Date().toISOString().split('T')[0],
        orSiNo: initialData.or_si_no || '',
        description: initialData.description || '',
        quantity: initialData.quantity || '',
        sizeDimension: initialData.size_dimension || '',
        unitPrice: initialData.unit_price || '',
        totalPrice: initialData.total_price || '',
        mop: initialData.mop || '',
        mopDescription: initialData.mop_description || '',
        category: initialData.category || 'Plumbing',
        location: initialData.location || '',
        store: initialData.store || '',
        images: initialData.images || []
      })
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        orSiNo: '',
        description: '',
        quantity: '',
        sizeDimension: '',
        unitPrice: '',
        totalPrice: '',
        mop: '',
        mopDescription: '',
        category: 'Plumbing',
        location: '',
        store: '',
        images: []
      })
    }
    setSelectedImages([])
  }, [initialData])

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Auto-calculate total price when unit price changes
      if (field === 'unitPrice' && prev.quantity) {
        const quantity = parseFloat(prev.quantity.replace(/[^\d.]/g, '')) || 0
        const unitPrice = parseFloat(value) || 0
        newData.totalPrice = unitPrice.toFixed(2)
      }
      
      return newData
    })
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
    if (!formData.description || !formData.totalPrice) {
      alert('Description and Total Price are required fields')
      return
    }
    
    const submitData = new FormData()
    
    // Add form data
    if (formData.date) submitData.append('date', formData.date)
    if (formData.orSiNo) submitData.append('or_si_no', formData.orSiNo)
    submitData.append('description', formData.description)
    if (formData.quantity) submitData.append('quantity', formData.quantity)
    if (formData.sizeDimension) submitData.append('size_dimension', formData.sizeDimension)
    if (formData.unitPrice) submitData.append('unit_price', formData.unitPrice)
    submitData.append('total_price', formData.totalPrice)
    if (formData.mop) submitData.append('mop', formData.mop)
    if (formData.mopDescription) submitData.append('mop_description', formData.mopDescription)
    if (formData.category) submitData.append('category', formData.category)
    if (formData.location) submitData.append('location', formData.location)
    if (formData.store) submitData.append('store', formData.store)
    
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
  const mopOptions = [
    { value: 'PDC', label: 'PDC' },
    { value: 'PO', label: 'PO' },
    { value: 'CARD', label: 'CARD' },
    { value: 'CASH', label: 'CASH' }
  ]

  const categoryOptions = categories.filter(cat => cat !== 'All').map(category => ({
    value: category,
    label: category
  }))

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
                {initialData ? 'Edit Expense' : 'Add New Expense'}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                  />
                </div>

                {/* DR/SI */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    DR/SI
                  </label>
                  <input
                    type="text"
                    value={formData.orSiNo}
                    onChange={(e) => handleInputChange('orSiNo', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="e.g., DR-001, SI-002"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Description (Name of the item bought) *
                </label>
                <input
                  required
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                  placeholder="Detailed description of the expense"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Quantity
                  </label>
                  <input
                    type="text"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="e.g., 1 gallon, 1 pc, 1 pack"
                  />
                </div>

                {/* Unit Price */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Unit Price (₱)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total Price */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Total (₱) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.totalPrice}
                    onChange={(e) => handleInputChange('totalPrice', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="0.00"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Category
                  </label>
                  <CustomDropdown
                    options={categoryOptions}
                    value={formData.category}
                    onChange={(value) => handleInputChange('category', value)}
                    placeholder="Select category"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* MOP */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    MOP (Mode of Payment)
                  </label>
                  <CustomDropdown
                    options={mopOptions}
                    value={formData.mop}
                    onChange={(value) => handleInputChange('mop', value)}
                    placeholder="Select MOP"
                  />
                </div>

                {/* MOP Description */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    MOP Description
                  </label>
                  <input
                    type="text"
                    value={formData.mopDescription}
                    onChange={(e) => handleInputChange('mopDescription', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="e.g., 22311 Bxlsk"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Size/Dimension */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Size/Dimension
                  </label>
                  <input
                    type="text"
                    value={formData.sizeDimension}
                    onChange={(e) => handleInputChange('sizeDimension', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="e.g., Standard, 50kg, Medium"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                    placeholder="e.g., Warehouse A, Site B"
                  />
                </div>
              </div>

              {/* Store */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Store
                </label>
                <input
                  type="text"
                  value={formData.store}
                  onChange={(e) => handleInputChange('store', e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                  placeholder="e.g., Main Store, Online Shop"
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
                  className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-secondary)] hover:to-[var(--color-primary)] text-white"
                >
                  {initialData ? 'Update Expense' : 'Add Expense'}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const DeleteConfirmationModal = React.memo(({ isOpen, onClose, onConfirm, isDeleting, expense }) => {
  if (!isOpen || !expense) return null

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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
              <Button variant="ghost" size="sm" onClick={onClose} disabled={isDeleting}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Are you sure you want to delete this expense? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-1 truncate" title={expense.description}>{expense.description}</h3>
                <p className="text-sm text-gray-600">OR/SI No: {expense.or_si_no}</p>
                <p className="text-sm text-gray-600">Total: ₱{parseFloat(expense.total_price).toFixed(2)}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" className="flex-1" onClick={onClose} disabled={isDeleting}>
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
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Expense
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

// Pagination Component
function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 10
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {getPageNumbers().map((page, index) => (
        <Button
          key={index}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={
            page === currentPage
              ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white"
              : "border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
          }
        >
          {page}
        </Button>
      ))}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

const categories = ['All', 'Plumbing', 'Electrical', 'Safety', 'Structural/Painting', 'Architectural', 'Sanitary', 'Painting', 'Others']

function ExpensesReceipts() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedMop, setSelectedMop] = useState('All')
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false)
  const [galleryImages, setGalleryImages] = useState([])
  const [galleryExpenseId, setGalleryExpenseId] = useState(null)
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0)
  const itemsPerPage = 10

  const [modals, setModals] = useState({
    delete: { isOpen: false, isDeleting: false, expense: null }
  })

  // Alert function from EquipmentInventory
  const showAlert = useCallback((message, type = 'info') => {
    const alertDiv = document.createElement('div')
    alertDiv.className = `fixed top-4 right-4 z-[9999] px-6 py-4 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full`
    
    switch (type) {
      case 'success': alertDiv.className += ' bg-green-500'; break
      case 'error': alertDiv.className += ' bg-red-500'; break
      case 'warning': alertDiv.className += ' bg-yellow-500'; break
      default: alertDiv.className += ' bg-blue-500'
    }
    
    alertDiv.textContent = message
    document.body.appendChild(alertDiv)
    
    setTimeout(() => alertDiv.classList.remove('translate-x-full'), 100)
    setTimeout(() => {
      alertDiv.classList.add('translate-x-full')
      setTimeout(() => document.body.removeChild(alertDiv), 300)
    }, 3000)
  }, [])

  // Fetch expenses from backend
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/expenses`)
      const data = await response.json()
      
      if (data.success) {
        setExpenses(data.data)
      } else {
        showAlert('Failed to fetch expenses: ' + data.message, 'error')
      }
    } catch (err) {
      showAlert('Error connecting to server: ' + err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [showAlert])

  // Add or Update expense
  const handleSaveExpense = useCallback(async (expenseData, expenseId = null) => {
    try {
      let response
      const url = expenseId ? `${API_BASE_URL}/expenses/${expenseId}` : `${API_BASE_URL}/expenses`
      const method = 'POST' // Laravel handles PUT via _method field

      response = await fetch(url, {
        method: method,
        body: expenseData // FormData for file uploads
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchExpenses()
        const message = expenseId ? 'Expense updated successfully!' : 'Expense added successfully!'
        showAlert(message, 'success')
      } else {
        const errorMsg = data.errors ? Object.values(data.errors).flat().join(', ') : data.message
        showAlert('Error: ' + errorMsg, 'error')
      }
    } catch (err) {
      showAlert(`Failed to ${expenseId ? 'update' : 'add'} expense: ` + err.message, 'error')
    }
  }, [fetchExpenses, showAlert])

  // Handle edit button click
  const handleEditClick = useCallback((expense) => {
    setEditingExpense(expense)
    setShowExpenseModal(true)
  }, [])

  // Delete modal handlers
  const openDeleteModal = useCallback((expense) => {
    setModals(prev => ({ ...prev, delete: { isOpen: true, isDeleting: false, expense } }))
  }, [])

  const closeDeleteModal = useCallback(() => {
    setModals(prev => ({ ...prev, delete: { isOpen: false, isDeleting: false, expense: null } }))
  }, [])

  // Confirm delete action
  const confirmDelete = useCallback(async () => {
    const expenseId = modals.delete.expense?.id
    if (!expenseId) return

    setModals(prev => ({ ...prev, delete: { ...prev.delete, isDeleting: true } }))

    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        showAlert('Expense deleted successfully!', 'success')
        closeDeleteModal()
        fetchExpenses()
      } else {
        showAlert('Error: ' + data.message, 'error')
      }
    } catch (err) {
      showAlert('Failed to delete expense: ' + err.message, 'error')
    } finally {
      setModals(prev => ({ ...prev, delete: { ...prev.delete, isDeleting: false } }))
    }
  }, [showAlert, closeDeleteModal, fetchExpenses, modals.delete.expense])

  // Toggle row expansion
  const toggleRowExpansion = useCallback((expenseId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(expenseId)) {
        newSet.delete(expenseId)
      } else {
        newSet.add(expenseId)
      }
      return newSet
    })
  }, [])

  // Handle image click
  const handleImageClick = useCallback((expense, initialIndex) => {
    // Parse images from database format
    let images = []
    if (expense.images) {
      try {
        const parsedImages = typeof expense.images === 'string' ? JSON.parse(expense.images) : expense.images
        if (Array.isArray(parsedImages)) {
          images = parsedImages
        }
      } catch (e) {
        console.error('Error parsing images:', e)
      }
    }
    
    setGalleryImages(images)
    setGalleryInitialIndex(initialIndex)
    setGalleryExpenseId(expense.id)
    setImageGalleryOpen(true)
  }, [])


  // Load expenses on component mount
  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  // Get unique MOPs for filter
  const mops = useMemo(() => {
    const uniqueMops = [...new Set(expenses.map(expense => expense.mop))]
    return ['All', ...uniqueMops]
  }, [expenses])

  // Filter and search logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.or_si_no.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'All' || expense.category === selectedCategory
      const matchesMop = selectedMop === 'All' || expense.mop === selectedMop
      
      return matchesSearch && matchesCategory && matchesMop
    })
  }, [expenses, searchTerm, selectedCategory, selectedMop])

  // Pagination logic
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, selectedMop])

  // Calculate totals
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.total_price), 0)
  const totalItems = filteredExpenses.length

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredExpenses.map(expense => ({
      'Date': new Date(expense.date).toLocaleDateString(),
      'DR/SI No.': expense.or_si_no,
      'Description': expense.description,
      'Quantity': expense.quantity,
      'Unit Price': expense.unit_price,
      'Total Price': expense.total_price,
      'MOP': expense.mop + (expense.mop_description ? ` - ${expense.mop_description}` : ''),
      'Category': expense.category,
      'Size/Dimension': expense.size_dimension,
      'Location': expense.location,
      'Store': expense.store,
      'Date Created': new Date(expense.created_at).toLocaleDateString()
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses')
    XLSX.writeFile(wb, `expenses_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Prepare category options for filter dropdown
  const categoryFilterOptions = categories.map(category => ({
    value: category,
    label: category === 'All' ? 'All Categories' : category
  }))

  // Prepare MOP options for filter dropdown
  const mopFilterOptions = mops.map(mop => ({
    value: mop,
    label: mop === 'All' ? 'All MOPs' : mop
  }))

  // Format MOP display
  const formatMOP = (mop, mopDescription) => {
    return mopDescription ? `${mop} - ${mopDescription}` : mop
  }

  // Get first image for display
  const getFirstImageUrl = (expense) => {
    if (expense.images) {
      try {
        const parsedImages = typeof expense.images === 'string' ? JSON.parse(expense.images) : expense.images
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          return `data:${parsedImages[0].mime_type};base64,${parsedImages[0].data}`
        }
      } catch (e) {
        console.error('Error parsing images:', e)
      }
    }
    return null
  }

const getImageCount = (expense) => {
    if (expense.images) {
      try {
        const parsedImages = typeof expense.images === 'string' ? JSON.parse(expense.images) : expense.images
        if (Array.isArray(parsedImages)) {
          return parsedImages.length
        }
      } catch (e) {
        console.error('Error parsing images:', e)
      }
    }
    return 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
            Expenses & Receipts
          </h1>
          <p className="text-[var(--color-foreground)]/70 mt-1">
            Track and manage your expenses and receipts
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => { setEditingExpense(null); setShowExpenseModal(true); }}
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-secondary)] hover:to-[var(--color-primary)] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatePresence>
          <motion.div
            key="total-expenses-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-[var(--color-card)] border-[var(--color-border)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[var(--color-foreground)]/70">
                  Total Expenses
                </CardTitle>
                <Receipt className="h-4 w-4 text-[var(--color-primary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--color-foreground)]">
                  {filteredExpenses.length}
                </div>
                <p className="text-xs text-[var(--color-foreground)]/70">
                  {filteredExpenses.length !== expenses.length && `of ${expenses.length} total`}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          <motion.div
            key="total-amount-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-[var(--color-card)] border-[var(--color-border)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[var(--color-foreground)]/70">
                  Total Amount
                </CardTitle>
                <DollarSign className="h-4 w-4 text-[var(--color-primary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--color-foreground)]">
                  ₱{totalAmount.toFixed(2)}
                </div>
                <p className="text-xs text-[var(--color-foreground)]/70">
                  Filtered results
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          <motion.div
            key="total-items-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-[var(--color-card)] border-[var(--color-border)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[var(--color-foreground)]/70">
                  Total Items
                </CardTitle>
                <Calendar className="h-4 w-4 text-[var(--color-primary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--color-foreground)]">
                  {totalItems}
                </div>
                <p className="text-xs text-[var(--color-foreground)]/70">
                  Items purchased
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-foreground)]/50 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by description, OR/SI number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <CustomDropdown
            options={categoryFilterOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="All Categories"
            className="w-48"
          />
          <CustomDropdown
            options={mopFilterOptions}
            value={selectedMop}
            onChange={setSelectedMop}
            placeholder="All MOPs"
            className="w-32"
          />
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="border-[var(--color-border)] text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Expenses Table */}
      <Card className="bg-[var(--color-card)] border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--color-foreground)]">
            Expenses List ({filteredExpenses.length} items)
          </CardTitle>
          <p className="text-sm text-[var(--color-foreground)]/70">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} results
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Image</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">DR/SI</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Unit Price</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">MOP</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--color-foreground)]/70">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginatedExpenses.map((expense) => (
                    <React.Fragment key={expense.id}>
                      {/* Main Row */}
                      <motion.tr
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="border-b border-[var(--color-border)] hover:bg-gray-200 transition-colors cursor-pointer"
                        onClick={() => toggleRowExpansion(expense.id)}
                      >
                        <td className="py-3 px-4 text-[var(--color-foreground)]">
                          <div className="flex items-center space-x-2">
                            <motion.div
                              animate={{ rotate: expandedRows.has(expense.id) ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="h-4 w-4 text-[var(--color-foreground)]/50" />
                            </motion.div>
                            {getFirstImageUrl(expense) ? (
                              <div className="relative">
                                <img
                                  src={getFirstImageUrl(expense)}
                                  alt="Expense"
                                  className="w-10 h-10 object-cover rounded cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleImageClick(expense, 0)
                                  }}
                                />
                                {getImageCount(expense) > 1 && (
                                  <div className="absolute -top-1 -right-1 bg-[var(--color-primary)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {getImageCount(expense)}
                                  </div>
 )}
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                <Receipt className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[var(--color-foreground)]">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-foreground)]">{expense.or_si_no}</td>
                        <td className="py-3 px-4 text-[var(--color-foreground)] max-w-xs">
                          <div className="truncate" title={expense.description}>
                            {expense.description}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[var(--color-foreground)]">{expense.quantity}</td>
                        <td className="py-3 px-4 text-[var(--color-foreground)]">₱{parseFloat(expense.unit_price).toFixed(2)}</td>
                        <td className="py-3 px-4 text-[var(--color-foreground)] font-medium">₱{parseFloat(expense.total_price).toFixed(2)}</td>
                        <td className="py-3 px-4 text-[var(--color-foreground)]">
                          {formatMOP(expense.mop, expense.mop_description)}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-foreground)]">
                          <span className="px-2 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full text-xs">
                            {expense.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditClick(expense)}
                              className="text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openDeleteModal(expense)}
                              className="text-red-500 hover:bg-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>

                      {/* Expanded Row */}
                      <AnimatePresence>
                        {expandedRows.has(expense.id) && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-b border-[var(--color-border)] bg-gray-100"
                          >
                            <td colSpan="10" className="px-4 py-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-[var(--color-foreground)]">Size: </span>
                                  <span className="text-[var(--color-foreground)]/70">{expense.size_dimension}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-[var(--color-foreground)]">Location: </span>
                                  <span className="text-[var(--color-foreground)]/70">{expense.location}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-[var(--color-foreground)]">Store: </span>
                                  <span className="text-[var(--color-foreground)]/70">{expense.store}</span>
                                </div>
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
            
            {paginatedExpenses.length === 0 && (
              <div className="text-center py-8 text-[var(--color-foreground)]/70">
                No expenses found matching your criteria.
              </div>
            )}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Expense Modal (Add/Edit) */}
      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSubmit={handleSaveExpense}
        initialData={editingExpense}
      />

      {/* Confirmation Modal (Delete) */}
      <DeleteConfirmationModal
        isOpen={modals.delete.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        isDeleting={modals.delete.isDeleting}
        expense={modals.delete.expense}
      />

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={imageGalleryOpen}
        onClose={() => setImageGalleryOpen(false)}
        images={galleryImages}
        initialIndex={galleryInitialIndex}
        expenseId={galleryExpenseId}
      />
    </div>
  )
}

export default ExpensesReceipts

