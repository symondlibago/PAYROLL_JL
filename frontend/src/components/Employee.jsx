import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Users, 
  UserCheck, 
  Clock, 
  Filter,
  Edit,
  Trash2,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  X,
  Loader2,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
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

// Delete Confirmation Modal
const DeleteConfirmationModal = React.memo(({ isOpen, onClose, onConfirm, isDeleting, employeeName }) => {
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
                <h3 className="text-lg font-semibold text-gray-900">Delete Employee</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">{employeeName}</span>? 
              This will permanently remove the employee from the system.
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
                  'Delete Employee'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

// Add Employee Modal
const AddEmployeeModal = React.memo(({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    age: '',
    phone_number: '',
    address: '',
    group: '',
    year_started: '',
    status: 'Site',
    rate: ''
  })

  const [hourlyRate, setHourlyRate] = useState(0)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        position: '',
        age: '',
        phone_number: '',
        address: '',
        group: '',
        year_started: '',
        status: 'Site',
        rate: ''
      })
      setHourlyRate(0)
    }
  }, [isOpen])

  // Calculate hourly rate when rate changes
  useEffect(() => {
    const rate = parseFloat(formData.rate) || 0
    setHourlyRate(rate / 8)
  }, [formData.rate])

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(() => {
    onSubmit(formData)
  }, [formData, onSubmit])

  const statusOptions = [
    { value: 'Site', label: 'Site' },
    { value: 'Office', label: 'Office' }
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
              <h2 className="text-2xl font-bold text-gray-900">Add New Employee</h2>
              <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Row 1: Name & Position */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter full name"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter position"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Row 2: Age & Phone Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter age"
                    min="18"
                    max="100"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter phone number"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Row 3: Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                  placeholder="Enter complete address"
                  rows="3"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group <span className="text-red-500">*</span>
                </label>
                <input
                  value={formData.group}
                  onChange={(e) => handleInputChange('group', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                  placeholder="Enter Group"
                  rows="3"
                  disabled={isSubmitting}
                />
              </div>

              {/* Row 4: Year Started & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year Started <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.year_started}
                    onChange={(e) => handleInputChange('year_started', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter year started"
                    min="1900"
                    max={new Date().getFullYear()}
                    disabled={isSubmitting}
                  />
                </div>
                <CustomDropdown
                  label="Status"
                  required={true}
                  value={formData.status}
                  onChange={(value) => handleInputChange('status', value)}
                  options={statusOptions}
                  placeholder="Select status"
                  disabled={isSubmitting}
                />
              </div>

              {/* Row 5: Rate & Hourly Rate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Rate <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.rate}
                    onChange={(e) => handleInputChange('rate', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter daily rate"
                    min="0"
                    step="0.01"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate (Auto-calculated)
                  </label>
                  <input
                    type="text"
                    value={hourlyRate.toFixed(2)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-md bg-gray-50 text-gray-600"
                    placeholder="Auto-calculated"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Based on 8-hour workday</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6 pt-6 border-t">
              <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleSubmit}
                disabled={!formData.name || !formData.position || !formData.age || !formData.phone_number || !formData.address ||!formData.group || !formData.year_started || !formData.rate || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Employee'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

// Edit Employee Modal
const EditEmployeeModal = React.memo(({ isOpen, onClose, onSubmit, isSubmitting, employee }) => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    age: '',
    phone_number: '',
    address: '',
    group: '',
    year_started: '',
    status: 'Site',
    rate: ''
  })

  const [hourlyRate, setHourlyRate] = useState(0)

  // Populate form when modal opens with employee data
  useEffect(() => {
    if (isOpen && employee) {
      setFormData({
        name: employee.name || '',
        position: employee.position || '',
        age: employee.age || '',
        phone_number: employee.phone_number || '',
        address: employee.address || '',
        group: employee.group || '',
        year_started: employee.year_started || '',
        status: employee.status || 'Site',
        rate: employee.rate || ''
      })
    }
  }, [isOpen, employee])

  // Calculate hourly rate when rate changes
  useEffect(() => {
    const rate = parseFloat(formData.rate) || 0
    setHourlyRate(rate / 8)
  }, [formData.rate])

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(() => {
    const submitData = { ...formData, id: employee.id }
    onSubmit(submitData)
  }, [formData, onSubmit, employee])

  const statusOptions = [
    { value: 'Site', label: 'Site' },
    { value: 'Office', label: 'Office' }
  ]

  if (!isOpen || !employee) return null

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
              <h2 className="text-2xl font-bold text-gray-900">Edit Employee</h2>
              <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Row 1: Name & Position */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter full name"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter position"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Row 2: Age & Phone Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter age"
                    min="18"
                    max="100"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter phone number"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Row 3: Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                  placeholder="Enter complete address"
                  rows="3"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group <span className="text-red-500">*</span>
                </label>
                <input
                  value={formData.group}
                  onChange={(e) => handleInputChange('group', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                  placeholder="Enter Group"
                  rows="3"
                  disabled={isSubmitting}
                />
              </div>

              {/* Row 4: Year Started & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year Started <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.year_started}
                    onChange={(e) => handleInputChange('year_started', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter year started"
                    min="1900"
                    max={new Date().getFullYear()}
                    disabled={isSubmitting}
                  />
                </div>
                <CustomDropdown
                  label="Status"
                  required={true}
                  value={formData.status}
                  onChange={(value) => handleInputChange('status', value)}
                  options={statusOptions}
                  placeholder="Select status"
                  disabled={isSubmitting}
                />
              </div>

              {/* Row 5: Rate & Hourly Rate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Rate <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.rate}
                    onChange={(e) => handleInputChange('rate', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    placeholder="Enter daily rate"
                    min="0"
                    step="0.01"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate (Auto-calculated)
                  </label>
                  <input
                    type="text"
                    value={hourlyRate.toFixed(2)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-md bg-gray-50 text-gray-600"
                    placeholder="Auto-calculated"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Based on 8-hour workday</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6 pt-6 border-t">
              <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleSubmit}
                disabled={!formData.name || !formData.position || !formData.age || !formData.phone_number || !formData.address ||!formData.group || !formData.year_started || !formData.rate || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Employee'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

const Employee = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [positionFilter, setPositionFilter] = useState('All')
  const [groupFilter, setGroupFilter] = useState('All')
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [successAlert, setSuccessAlert] = useState({ isVisible: false, message: '' })

  // API base URL - adjust this to match your Laravel backend

  // Fetch employees from backend
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/employees`)
      const data = await response.json()
      
      if (data.success) {
        setEmployees(data.data)
      } else {
        console.error('Failed to fetch employees:', data.message)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load employees on component mount
  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  // Add new employee
  const handleAddEmployee = useCallback(async (formData) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setEmployees(prev => [data.data, ...prev])
        setIsAddModalOpen(false)
        setSuccessAlert({
          isVisible: true,
          message: 'Employee added successfully!'
        })
      } else {
        console.error('Failed to add employee:', data.message)
        alert('Failed to add employee. Please try again.')
      }
    } catch (error) {
      console.error('Error adding employee:', error)
      alert('Error adding employee. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  // Edit employee
  const handleEditEmployee = useCallback(async (formData) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`${API_BASE_URL}/employees/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setEmployees(prev => prev.map(emp => 
          emp.id === formData.id ? data.data : emp
        ))
        setIsEditModalOpen(false)
        setSelectedEmployee(null)
        setSuccessAlert({
          isVisible: true,
          message: 'Employee updated successfully!'
        })
      } else {
        console.error('Failed to update employee:', data.message)
        alert('Failed to update employee. Please try again.')
      }
    } catch (error) {
      console.error('Error updating employee:', error)
      alert('Error updating employee. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  // Delete employee
  const handleDeleteEmployee = useCallback(async () => {
    if (!selectedEmployee) return

    try {
      setIsDeleting(true)
      const response = await fetch(`${API_BASE_URL}/employees/${selectedEmployee.id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setEmployees(prev => prev.filter(emp => emp.id !== selectedEmployee.id))
        setIsDeleteModalOpen(false)
        setSelectedEmployee(null)
        setSuccessAlert({
          isVisible: true,
          message: 'Employee deleted successfully!'
        })
      } else {
        console.error('Failed to delete employee:', data.message)
        alert('Failed to delete employee. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting employee:', error)
      alert('Error deleting employee. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }, [selectedEmployee])

  // Open edit modal
  const openEditModal = useCallback((employee) => {
    setSelectedEmployee(employee)
    setIsEditModalOpen(true)
  }, [])

  // Open delete modal
  const openDeleteModal = useCallback((employee) => {
    setSelectedEmployee(employee)
    setIsDeleteModalOpen(true)
  }, [])

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.group?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'All' || employee.status === statusFilter
    const matchesPosition = positionFilter === 'All' || employee.position === positionFilter
    const matchesGroup = groupFilter === 'All' || employee.group === groupFilter
    
    return matchesSearch && matchesStatus && matchesPosition && matchesGroup
  })

  // Calculate statistics
  const totalEmployees = employees.length
  const siteEmployees = employees.filter(emp => emp.status === 'Site').length
  const officeEmployees = employees.filter(emp => emp.status === 'Office').length

  // Get unique values for filters
  const positions = [...new Set(employees.map(emp => emp.position).filter(Boolean))]
  const group = [...new Set(employees.map(emp => emp.group).filter(Boolean))]

  // Dropdown options
  const statusOptions = [
    { value: 'All', label: 'All Status' },
    { value: 'Site', label: 'Site' },
    { value: 'Office', label: 'Office' }
  ]

  const positionOptions = [
    { value: 'All', label: 'All Positions' },
    ...positions.map(position => ({ value: position, label: position }))
  ]
  const groupOptions = [
    { value: 'All', label: 'All Group' },
    ...group.map(group => ({ value: group, label: group }))
  ]

  const getStatusColor = (status) => {
    return status === 'Site' ? 'text-[var(--color-primary)]' : 'text-[var(--color-secondary)]'
  }

  const getStatusBadge = (status) => {
    return status === 'Site' 
      ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border-[var(--color-primary)]/30' 
      : 'bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] border-[var(--color-secondary)]/30'
  }

  const getInitials = (name) => {
    if (!name) return 'N/A'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
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
            Employee Management
          </h1>
          <p className="text-[var(--color-foreground)]/70 mt-1">Manage and track all employee information</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-secondary)] hover:to-[var(--color-primary)] text-white"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="bg-white border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground)]/70">Total Employees</p>
                <p className="text-3xl font-bold text-[var(--color-foreground)]">{totalEmployees}</p>
                <p className="text-sm text-[var(--color-primary)] mt-1">Active workforce</p>
              </div>
              <div className="p-3 bg-[var(--color-primary)]/20 rounded-lg">
                <Users className="h-8 w-8 text-[var(--color-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground)]/70">Site Employees</p>
                <p className="text-3xl font-bold text-[var(--color-foreground)]">{siteEmployees}</p>
                <p className="text-sm text-[var(--color-primary)] mt-1">Field workers</p>
              </div>
              <div className="p-3 bg-[var(--color-primary)]/20 rounded-lg">
                <UserCheck className="h-8 w-8 text-[var(--color-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-foreground)]/70">Office Employees</p>
                <p className="text-3xl font-bold text-[var(--color-foreground)]">{officeEmployees}</p>
                <p className="text-sm text-[var(--color-secondary)] mt-1">Office staff</p>
              </div>
              <div className="p-3 bg-[var(--color-secondary)]/20 rounded-lg">
                <Clock className="h-8 w-8 text-[var(--color-secondary)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="bg-white border-[var(--color-border)] rounded-lg p-6 shadow-md"
>
  <div className="flex flex-wrap gap-4 items-center">
    <div className="flex-1 min-w-[200px]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-foreground)]/70 h-4 w-4" />
        <Input
          placeholder="Search employees, positions, or IDs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-[var(--color-input)] border-[var(--color-border)] text-[var(--color-foreground)] placeholder-[var(--color-foreground)]/50"
        />
      </div>
    </div>

    <div className="w-[150px]">
      <CustomDropdown
        value={statusFilter}
        onChange={setStatusFilter}
        options={statusOptions}
        placeholder="All Status"
      />
    </div>

    <div className="w-[150px]">
      <CustomDropdown
        value={positionFilter}
        onChange={setPositionFilter}
        options={positionOptions}
        placeholder="All Positions"
      />
    </div>

    <div className="w-[150px]">
      <CustomDropdown
        value={groupFilter}
        onChange={setGroupFilter}
        options={groupOptions}
        placeholder="All Groups"
      />
    </div>
  </div>
</motion.div>



      {/* Employee Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredEmployees.map((employee, index) => (
          <motion.div
            key={employee.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 + 0.4 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="bg-white border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-300 shadow-md">
              <CardContent className="p-6">
                {/* Employee Header */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-bold">
                    {getInitials(employee.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--color-foreground)]">{employee.name}</h3>
                    <p className="text-sm text-[var(--color-foreground)]/70">{employee.employee_id}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs border ${getStatusBadge(employee.status)}`}>
                    {employee.status}
                  </div>
                </div>

                {/* Employee Details */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Briefcase className="h-4 w-4 text-[var(--color-primary)]" />
                    <span className="text-[var(--color-foreground)]/70">{employee.position}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-[var(--color-primary)]" />
                    <span className="text-[var(--color-foreground)]/70">Age: {employee.age} • Started: {employee.year_started}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-[var(--color-primary)]" />
                    <span className="text-[var(--color-foreground)]/70">{employee.phone_number}</span>
                  </div>
                  
                  <div className="flex items-start space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-[var(--color-primary)] mt-0.5" />
                    <span className="text-[var(--color-foreground)]/70 line-clamp-2">{employee.address}</span>
                  </div>

                  {/* Rate Information */}
                  <div className="flex items-center space-x-2 text-sm">
                    <DollarSign className="h-4 w-4 text-[var(--color-primary)]" />
                    <span className="text-[var(--color-foreground)]/70">
                      Daily: ₱{parseFloat(employee.rate || 0).toFixed(2)} • Hourly: ₱{parseFloat(employee.hourly_rate || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-start space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-[var(--color-primary)] mt-0.5" />
                    <span className="text-[var(--color-foreground)]/70 line-clamp-2">{employee.group}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 mt-4 pt-4 border-t border-[var(--color-border)]">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 border-[var(--color-secondary)]/30 text-[var(--color-secondary)] hover:bg-[#0e1048] hover:text-white"
                    onClick={() => openEditModal(employee)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-[var(--color-destructive)]/30 text-[var(--color-destructive)] hover:bg-red-500 hover:text-white"
                    onClick={() => openDeleteModal(employee)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* No Results */}
      {filteredEmployees.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="h-16 w-16 text-[var(--color-foreground)]/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[var(--color-foreground)]/70 mb-2">No employees found</h3>
          <p className="text-[var(--color-foreground)]/50">Try adjusting your search criteria or filters</p>
        </motion.div>
      )}

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddEmployee}
        isSubmitting={isSubmitting}
      />

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedEmployee(null)
        }}
        onSubmit={handleEditEmployee}
        isSubmitting={isSubmitting}
        employee={selectedEmployee}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedEmployee(null)
        }}
        onConfirm={handleDeleteEmployee}
        isDeleting={isDeleting}
        employeeName={selectedEmployee?.name || ''}
      />
    </div>
  )
}

export default Employee
