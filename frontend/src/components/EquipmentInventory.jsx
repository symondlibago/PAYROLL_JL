import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Package, CheckCircle, AlertCircle, Settings, Edit, Trash2, 
  User, Calendar, Grid3X3, List, MapPin, ChevronRight, ShoppingCart, 
  X, Loader2, Save, ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import API_BASE_URL from './Config'

// Custom Dropdown Component
const CustomDropdown = React.memo(({ label, required = false, value, onChange, options, placeholder, disabled = false }) => {
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
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
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

// Separate Modal Components to prevent re-renders
const AddModal = React.memo(({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    equipment_name: '',
    equipment_code: '',
    brand: '',
    serial_number: '',
    item_status: 'Available',
    present_location: '',
    status: ''
  })

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        equipment_name: '',
        equipment_code: '',
        brand: '',
        serial_number: '',
        item_status: 'Available',
        status: ''
      })
    }
  }, [isOpen])

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(() => {
    onSubmit(formData)
    // Form will be reset when modal reopens due to useEffect above
  }, [formData, onSubmit])

  const itemStatusOptions = [
    { value: 'Available', label: 'Available' },
    { value: 'Borrowed', label: 'Borrowed' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Out of Service', label: 'Out of Service' }
  ]

  const conditionOptions = [
    { value: '', label: 'Select condition (optional)' },
    { value: 'Excellent', label: 'Excellent' },
    { value: 'Good', label: 'Good' },
    { value: 'Fair', label: 'Fair' },
    { value: 'Poor', label: 'Poor' }
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
              <h2 className="text-2xl font-bold text-gray-900">Add New Equipment</h2>
              <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Row 1: Equipment Name & Equipment Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.equipment_name}
                    onChange={(e) => handleInputChange('equipment_name', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter equipment name"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.equipment_code}
                    onChange={(e) => handleInputChange('equipment_code', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter equipment code"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Row 2: Brand & Serial Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter brand"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) => handleInputChange('serial_number', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter serial number (optional)"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Row 3: Item Status & Present Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomDropdown
                  label="Condition Status"
                  value={formData.status}
                  onChange={(value) => handleInputChange('status', value)}
                  options={conditionOptions}
                  placeholder="Select condition (optional)"
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
                disabled={!formData.equipment_name || !formData.equipment_code || !formData.brand || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Equipment'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

const EditModal = React.memo(({ isOpen, onClose, onSubmit, isSubmitting, equipment }) => {
  const [formData, setFormData] = useState({
    equipment_name: '',
    equipment_code: '',
    brand: '',
    serial_number: '',
    item_status: 'Available',
    present_location: '',
    status: ''
  })

  useEffect(() => {
    if (equipment && isOpen) {
      setFormData({
        equipment_name: equipment.equipment_name || '',
        equipment_code: equipment.equipment_code || '',
        brand: equipment.brand || '',
        serial_number: equipment.serial_number || '',
        item_status: equipment.item_status || 'Available',
        present_location: equipment.present_location || '',
        status: equipment.status || ''
      })
    }
  }, [equipment, isOpen])

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Reset borrowed equipment details when status changes from Borrowed to Available
      if (field === 'item_status' && prev.item_status === 'Borrowed' && value === 'Available') {
        newData.present_location = ''
        // Note: borrowed_by and date_borrowed will be handled by backend
      }
      
      return newData
    })
  }, [])

  const handleSubmit = useCallback(() => {
    const submitData = { ...formData, id: equipment.id }
    
    // If changing from Borrowed to Available, explicitly clear borrowed fields
    if (equipment.item_status === 'Borrowed' && formData.item_status === 'Available') {
      submitData.borrowed_by = ''
      submitData.date_borrowed = ''
      submitData.expected_return_date = ''
      submitData.purpose_notes = ''
      submitData.present_location = ''
    }
    
    onSubmit(submitData)
  }, [formData, onSubmit, equipment])

  const itemStatusOptions = [
    { value: 'Available', label: 'Available' },
    { value: 'Borrowed', label: 'Borrowed' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Out of Service', label: 'Out of Service' }
  ]

  const conditionOptions = [
    { value: '', label: 'Select condition (optional)' },
    { value: 'Excellent', label: 'Excellent' },
    { value: 'Good', label: 'Good' },
    { value: 'Fair', label: 'Fair' },
    { value: 'Poor', label: 'Poor' }
  ]

  if (!isOpen || !equipment) return null

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
              <h2 className="text-2xl font-bold text-gray-900">Edit Equipment</h2>
              <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Row 1: Equipment Name & Equipment Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.equipment_name}
                    onChange={(e) => handleInputChange('equipment_name', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.equipment_code}
                    onChange={(e) => handleInputChange('equipment_code', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Row 2: Brand & Serial Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) => handleInputChange('serial_number', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Row 3: Item Status & Present Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomDropdown
                  label="Item Status"
                  required
                  value={formData.item_status}
                  onChange={(value) => handleInputChange('item_status', value)}
                  options={itemStatusOptions}
                  placeholder="Select item status"
                  disabled={isSubmitting}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Present Location</label>
                  <input
                    type="text"
                    value={formData.present_location}
                    onChange={(e) => handleInputChange('present_location', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder={equipment.item_status === 'Borrowed' && formData.item_status === 'Available' ? 'Will be reset to "Not specified"' : 'Enter present location (optional)'}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Row 4: Condition Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomDropdown
                  label="Condition Status"
                  value={formData.status}
                  onChange={(value) => handleInputChange('status', value)}
                  options={conditionOptions}
                  placeholder="Select condition (optional)"
                  disabled={isSubmitting}
                />
                <div></div> {/* Empty div for spacing */}
              </div>

              {/* Status change warning */}
              {equipment.item_status === 'Borrowed' && formData.item_status === 'Available' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Changing status from "Borrowed" to "Available" will reset the borrowed details (Present Location, Borrowed By, Date Borrowed).
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6 pt-6 border-t">
              <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleSubmit}
                disabled={!formData.equipment_name || !formData.equipment_code || !formData.brand || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Equipment
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

const BorrowModal = React.memo(({ isOpen, onClose, onSubmit, isSubmitting, equipment }) => {
  const [formData, setFormData] = useState({
    borrowed_by: '',
    date_borrowed: new Date().toISOString().split('T')[0],
    expected_return_date: '',
    purpose_notes: '',
    present_location: ''
  })

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(() => {
    onSubmit(formData)
  }, [formData, onSubmit])

  if (!isOpen || !equipment) return null

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
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Borrow Equipment</h2>
              <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">{equipment.equipment_name}</h3>
              <p className="text-sm text-gray-600">Code: {equipment.equipment_code}</p>
              <p className="text-sm text-gray-600">Brand: {equipment.brand}</p>
            </div>

            <div className="space-y-4">
              {/* Row 1: Borrowed By & Date Borrowed */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Borrowed By <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.borrowed_by}
                    onChange={(e) => handleInputChange('borrowed_by', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter borrower name"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Borrowed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date_borrowed}
                    onChange={(e) => handleInputChange('date_borrowed', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Row 2: Expected Return Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return Date</label>
                  <input
                    type="date"
                    value={formData.expected_return_date}
                    onChange={(e) => handleInputChange('expected_return_date', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Present Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.present_location}
                    onChange={(e) => handleInputChange('present_location', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter present location"
                    disabled={isSubmitting}
                  />
                </div>
                <div></div> {/* Empty div for spacing */}
              </div>

              {/* Row 3: Purpose/Notes (full width) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose/Notes</label>
                <textarea
                  value={formData.purpose_notes}
                  onChange={(e) => handleInputChange('purpose_notes', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                  rows="3"
                  placeholder="Enter purpose or additional notes"
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
                disabled={!formData.borrowed_by || !formData.date_borrowed || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Borrow'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

const DeleteConfirmationModal = React.memo(({ isOpen, onClose, onConfirm, isDeleting, equipment }) => {
  if (!isOpen || !equipment) return null

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
                    Are you sure you want to delete this equipment? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{equipment.equipment_name}</h3>
                <p className="text-sm text-gray-600">Code: {equipment.equipment_code}</p>
                <p className="text-sm text-gray-600">Brand: {equipment.brand}</p>
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
                    Delete Equipment
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

const EquipmentInventory = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [conditionFilter, setConditionFilter] = useState('All')
  const [viewMode, setViewMode] = useState('table')
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Modal states
  const [modals, setModals] = useState({
    add: { isOpen: false, isSubmitting: false },
    edit: { isOpen: false, isSubmitting: false, equipment: null },
    borrow: { isOpen: false, isSubmitting: false, equipment: null },
    delete: { isOpen: false, isDeleting: false, equipment: null }
  })

  // Alert function
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

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    } catch {
      return 'Invalid Date'
    }
  }, [])

  // Fetch equipment
  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/equipment`)
      const data = await response.json()
      
      if (data.success) {
        setEquipment(data.data)
      } else {
        showAlert('Failed to fetch equipment: ' + data.message, 'error')
      }
    } catch (error) {
      showAlert('Error fetching equipment: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [showAlert])

  useEffect(() => {
    fetchEquipment()
  }, [fetchEquipment])

  // Modal handlers
  const openAddModal = useCallback(() => {
    setModals(prev => ({ ...prev, add: { isOpen: true, isSubmitting: false } }))
  }, [])

  const closeAddModal = useCallback(() => {
    setModals(prev => ({ ...prev, add: { isOpen: false, isSubmitting: false } }))
  }, [])

  const openEditModal = useCallback((equipment) => {
    setModals(prev => ({ ...prev, edit: { isOpen: true, isSubmitting: false, equipment } }))
  }, [])

  const closeEditModal = useCallback(() => {
    setModals(prev => ({ ...prev, edit: { isOpen: false, isSubmitting: false, equipment: null } }))
  }, [])

  const openBorrowModal = useCallback((equipment) => {
    setModals(prev => ({ ...prev, borrow: { isOpen: true, isSubmitting: false, equipment } }))
  }, [])

  const closeBorrowModal = useCallback(() => {
    setModals(prev => ({ ...prev, borrow: { isOpen: false, isSubmitting: false, equipment: null } }))
  }, [])

  const openDeleteModal = useCallback((equipment) => {
    setModals(prev => ({ ...prev, delete: { isOpen: true, isDeleting: false, equipment } }))
  }, [])

  const closeDeleteModal = useCallback(() => {
    setModals(prev => ({ ...prev, delete: { isOpen: false, isDeleting: false, equipment: null } }))
  }, [])

  // API handlers
  const handleAddEquipment = useCallback(async (formData) => {
    setModals(prev => ({ ...prev, add: { ...prev.add, isSubmitting: true } }))
    
    try {
      const response = await fetch(`${API_BASE_URL}/equipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()

      if (data.success) {
        showAlert('Equipment added successfully!', 'success')
        closeAddModal()
        fetchEquipment()
      } else {
        const errorMsg = data.errors ? Object.values(data.errors).flat().join(', ') : data.message
        showAlert('Error: ' + errorMsg, 'error')
      }
    } catch (error) {
      showAlert('Failed to add equipment: ' + error.message, 'error')
    } finally {
      setModals(prev => ({ ...prev, add: { ...prev.add, isSubmitting: false } }))
    }
  }, [showAlert, closeAddModal, fetchEquipment])

  const handleEditEquipment = useCallback(async (formData) => {
    setModals(prev => ({ ...prev, edit: { ...prev.edit, isSubmitting: true } }))
    
    try {
      const response = await fetch(`${API_BASE_URL}/equipment/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()

      if (data.success) {
        showAlert('Equipment updated successfully!', 'success')
        closeEditModal()
        fetchEquipment()
      } else {
        const errorMsg = data.errors ? Object.values(data.errors).flat().join(', ') : data.message
        showAlert('Error: ' + errorMsg, 'error')
      }
    } catch (error) {
      showAlert('Failed to update equipment: ' + error.message, 'error')
    } finally {
      setModals(prev => ({ ...prev, edit: { ...prev.edit, isSubmitting: false } }))
    }
  }, [showAlert, closeEditModal, fetchEquipment])

  const handleBorrowEquipment = useCallback(async (formData) => {
    setModals(prev => ({ ...prev, borrow: { ...prev.borrow, isSubmitting: true } }))
    
    try {
      const response = await fetch(`${API_BASE_URL}/equipment/${modals.borrow.equipment.id}/borrow`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()

      if (data.success) {
        showAlert('Equipment borrowed successfully!', 'success')
        closeBorrowModal()
        fetchEquipment()
      } else {
        showAlert('Error: ' + data.message, 'error')
      }
    } catch (error) {
      showAlert('Failed to borrow equipment: ' + error.message, 'error')
    } finally {
      setModals(prev => ({ ...prev, borrow: { ...prev.borrow, isSubmitting: false } }))
    }
  }, [showAlert, closeBorrowModal, fetchEquipment, modals.borrow.equipment])

  const handleDeleteEquipment = useCallback(async () => {
    const equipmentId = modals.delete.equipment?.id
    if (!equipmentId) return

    setModals(prev => ({ ...prev, delete: { ...prev.delete, isDeleting: true } }))

    try {
      const response = await fetch(`${API_BASE_URL}/equipment/${equipmentId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        showAlert('Equipment deleted successfully!', 'success')
        closeDeleteModal()
        fetchEquipment()
      } else {
        showAlert('Error: ' + data.message, 'error')
      }
    } catch (error) {
      showAlert('Failed to delete equipment: ' + error.message, 'error')
    } finally {
      setModals(prev => ({ ...prev, delete: { ...prev.delete, isDeleting: false } }))
    }
  }, [showAlert, closeDeleteModal, fetchEquipment, modals.delete.equipment])

  // Filtered equipment
  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      const matchesSearch = item.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.equipment_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.present_location?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'All' || item.item_status === statusFilter
      const matchesCondition = conditionFilter === 'All' || item.status === conditionFilter
      
      return matchesSearch && matchesStatus && matchesCondition
    })
  }, [equipment, searchTerm, statusFilter, conditionFilter])

  // Statistics
  const stats = useMemo(() => ({
    total: equipment.length,
    available: equipment.filter(item => item.item_status === 'Available').length,
    borrowed: equipment.filter(item => item.item_status === 'Borrowed').length,
    maintenance: equipment.filter(item => item.item_status === 'Maintenance').length
  }), [equipment])

  const toggleRowExpansion = useCallback((equipmentId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(equipmentId)) {
        newSet.delete(equipmentId)
      } else {
        newSet.add(equipmentId)
      }
      return newSet
    })
  }, [])

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'Available': return 'text-green-600 bg-green-100 border-green-200'
      case 'Borrowed': return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'Maintenance': return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'Out of Service': return 'text-red-600 bg-red-100 border-red-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }, [])

  const getConditionColor = useCallback((condition) => {
    switch (condition) {
      case 'Excellent': return 'text-green-600 bg-green-100 border-green-200'
      case 'Good': return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'Fair': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'Poor': return 'text-red-600 bg-red-100 border-red-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }, [])

  // Filter options for dropdowns
  const statusFilterOptions = [
    { value: 'All', label: 'All Status' },
    { value: 'Available', label: 'Available' },
    { value: 'Borrowed', label: 'Borrowed' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Out of Service', label: 'Out of Service' }
  ]

  const conditionFilterOptions = [
    { value: 'All', label: 'All Conditions' },
    { value: 'Excellent', label: 'Excellent' },
    { value: 'Good', label: 'Good' },
    { value: 'Fair', label: 'Fair' },
    { value: 'Poor', label: 'Poor' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
            Equipment Inventory
          </h1>
          <p className="text-[var(--color-foreground)]/70 mt-1">Track tools and equipment inventory</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[var(--color-card)] rounded-lg p-1 border border-[var(--color-border)] shadow-sm">
            <Button
              size="sm"
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              onClick={() => setViewMode('card')}
              className={`${viewMode === 'card' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-foreground)]/70 hover:text-[var(--color-foreground)]'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              onClick={() => setViewMode('table')}
              className={`${viewMode === 'table' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-foreground)]/70 hover:text-[var(--color-foreground)]'}`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white shadow-md"
            onClick={openAddModal}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="bg-[var(--color-card)] border-[var(--color-border)] shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground)]/70">Total Equipment</p>
                <p className="text-2xl font-bold text-[var(--color-foreground)]">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-[var(--color-primary)]" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--color-card)] border-[var(--color-border)] shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground)]/70">Available</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--color-card)] border-[var(--color-border)] shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground)]/70">Borrowed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.borrowed}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--color-card)] border-[var(--color-border)] shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground)]/70">Maintenance</p>
                <p className="text-2xl font-bold text-orange-600">{stats.maintenance}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        <div className="relative flex-1">
        <input
            type="text"
            placeholder="Search by Equipment Name, Equipment Code, Brand"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
          />
        </div>
        
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <CustomDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusFilterOptions}
            placeholder="All Status"
          />
        </div>

        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <CustomDropdown
            value={conditionFilter}
            onChange={setConditionFilter}
            options={conditionFilterOptions}
            placeholder="All Conditions"
          />
        </div>
      </motion.div>

      {/* Equipment Table */}
      {viewMode === 'table' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--color-card)] backdrop-blur-sm rounded-lg border border-[var(--color-border)] overflow-hidden shadow-md"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
              <span className="ml-2 text-[var(--color-foreground)]/70">Loading equipment...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-card)] border-b border-[var(--color-border)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--color-foreground)]/70">Equipment Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--color-foreground)]/70">Equipment Code</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--color-foreground)]/70">Brand</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--color-foreground)]/70">S/N</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--color-foreground)]/70">Item Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[var(--color-foreground)]/70">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]/50">
                  {filteredEquipment.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <motion.tr
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 + 0.4 }}
                        className="hover:bg-[var(--color-card)]/50 transition-colors cursor-pointer"
                        onClick={() => toggleRowExpansion(item.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <motion.div
                              animate={{ rotate: expandedRows.has(item.id) ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="h-4 w-4 text-[var(--color-foreground)]/70" />
                            </motion.div>
                            <div>
                              <div className="font-medium text-[var(--color-foreground)]">{item.equipment_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[var(--color-foreground)]/70">{item.equipment_code}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[var(--color-foreground)]/70">{item.brand}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[var(--color-foreground)]/70">{item.serial_number || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex px-2 py-1 rounded-full text-xs border ${getStatusColor(item.item_status)}`}>
                            {item.item_status}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
                              onClick={() => openBorrowModal(item)}
                              disabled={item.item_status !== 'Available'}
                              title="Borrow Equipment"
                            >
                              <ShoppingCart className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-[var(--color-foreground)]/70 hover:bg-[var(--color-muted)]"
                              onClick={() => openEditModal(item)}
                              title="Edit Equipment"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-[var(--color-foreground)]/70 hover:bg-red-500"
                              onClick={() => openDeleteModal(item)}
                              title="Delete Equipment"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                      
                      {/* Expandable Row Content */}
                      <AnimatePresence>
                        {expandedRows.has(item.id) && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <td colSpan="6" className="px-6 py-0">
                              <motion.div
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -10, opacity: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gray-100 rounded-lg p-4 mb-4"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                  <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                      <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
                                      <span className="text-sm font-medium text-[var(--color-foreground)]">Present Location</span>
                                    </div>
                                    <p className="text-sm text-[var(--color-foreground)]/70 ml-6">
                                      {item.present_location || 'Not specified'}
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                      <User className="h-4 w-4 text-[var(--color-primary)]" />
                                      <span className="text-sm font-medium text-[var(--color-foreground)]">Borrowed by</span>
                                    </div>
                                    <p className="text-sm text-[var(--color-foreground)]/70 ml-6">
                                      {item.borrowed_by || 'Not borrowed'}
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Calendar className="h-4 w-4 text-[var(--color-primary)]" />
                                      <span className="text-sm font-medium text-[var(--color-foreground)]">Date Borrowed</span>
                                    </div>
                                    <p className="text-sm text-[var(--color-foreground)]/70 ml-6">
                                      {formatDate(item.date_borrowed)}
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Settings className="h-4 w-4 text-[var(--color-primary)]" />
                                      <span className="text-sm font-medium text-[var(--color-foreground)]">Condition</span>
                                    </div>
                                    <div className="ml-6">
                                      {item.status ? (
                                        <div className={`inline-flex px-2 py-1 rounded-full text-xs border ${getConditionColor(item.status)}`}>
                                          {item.status}
                                        </div>
                                      ) : (
                                        <p className="text-sm text-[var(--color-foreground)]/70">Not specified</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Modals */}
      <AddModal
        isOpen={modals.add.isOpen}
        onClose={closeAddModal}
        onSubmit={handleAddEquipment}
        isSubmitting={modals.add.isSubmitting}
      />
      
      <EditModal
        isOpen={modals.edit.isOpen}
        onClose={closeEditModal}
        onSubmit={handleEditEquipment}
        isSubmitting={modals.edit.isSubmitting}
        equipment={modals.edit.equipment}
      />
      
      <BorrowModal
        isOpen={modals.borrow.isOpen}
        onClose={closeBorrowModal}
        onSubmit={handleBorrowEquipment}
        isSubmitting={modals.borrow.isSubmitting}
        equipment={modals.borrow.equipment}
      />
      
      <DeleteConfirmationModal
        isOpen={modals.delete.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteEquipment}
        isDeleting={modals.delete.isDeleting}
        equipment={modals.delete.equipment}
      />
    </div>
  )
}

export default EquipmentInventory

