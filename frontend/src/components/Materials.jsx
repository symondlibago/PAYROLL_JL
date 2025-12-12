import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Package, 
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
  CheckCircle,
  AlertTriangle,
  MapPin,
  List
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import API_BASE_URL from './Config'
import { jsPDF } from 'jspdf'
import logo from '../assets/pdflogo.png';


const addLogo = async (doc) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Add error handling
      img.onerror = () => {
        console.warn('Logo image failed to load, continuing without logo');
        resolve(); // Continue without logo instead of failing
      };
      
      img.onload = () => {
        try {
          // Validate that the image is properly loaded
          if (img.naturalWidth === 0 || img.naturalHeight === 0) {
            console.warn('Logo image has invalid dimensions, continuing without logo');
            resolve();
            return;
          }
          
          // Create a canvas to convert the image to base64 data URL
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          
          ctx.drawImage(img, 0, 0);
          
          // Get the data URL and validate it's a proper PNG
          const dataURL = canvas.toDataURL('image/png');
          
          // Validate PNG signature
          if (!dataURL.startsWith('data:image/png;base64,')) {
            console.warn('Invalid PNG data URL, continuing without logo');
            resolve();
            return;
          }
          
          // Extract base64 data and validate it
          const base64Data = dataURL.split(',')[1];
          if (!base64Data || base64Data.length === 0) {
            console.warn('Empty base64 data, continuing without logo');
            resolve();
            return;
          }
          
          // Add the image to PDF using the validated data URL
          doc.addImage(dataURL, "PNG", 240, 30, 150, 60);
          resolve();
        } catch (error) {
          console.warn('Error processing logo image:', error);
          resolve(); // Continue without logo instead of failing
        }
      };
      
      // Set crossOrigin to handle CORS issues in production
      img.crossOrigin = 'anonymous';
      img.src = logo;
      
      // Add timeout to prevent hanging
      setTimeout(() => {
        if (!img.complete) {
          console.warn('Logo loading timeout, continuing without logo');
          resolve();
        }
      }, 5000);
    });
  };
  
  // Fixed exportToPdf function with better error handling
  const exportToPdf = async (material) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter",
      });
  
      // Try to add logo, but don't fail if it doesn't work
      try {
        await addLogo(doc);
      } catch (error) {
        console.warn('Failed to add logo, continuing with PDF generation:', error);
      }
  
      generatePdfContent();
  
      function generatePdfContent() {
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.text("Lot 2-D, Sumpong, Mandumol-Indahag, Cagayan De Oro City", 180, 120)
  
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.text("PURCHASE ORDER", 230, 150)
  
        // Add Purchase Order Date and Number
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.text(`Purchase Order Date: ${material.date ? new Date(material.date).toLocaleDateString() : ''}`, 50, 180)
        doc.text("Purchase Order Number:", 350, 180)
  
        doc.setLineWidth(1)
        doc.rect(50, 190, 250, 80) // Supplier box
        doc.rect(300, 190, 250, 80) // Delivery box
  
        // Blue header backgrounds for supplier and delivery
        doc.setFillColor(173, 216, 230) // Light blue color
        doc.rect(50, 190, 250, 20, 'F') // Supplier header background
        doc.rect(300, 190, 250, 20, 'F') // Delivery header background
  
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("SUPPLIER", 150, 203)
        doc.text("DELIVERY", 400, 203)
  
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.text("Supplier Name:", 60, 225)
        doc.text("Address:", 60, 240)
        doc.text("Phone No.:", 60, 255)
  
        doc.text(`Project: ${material.project}`, 310, 225)
        doc.text(`Location: ${material.project_location}`, 310, 240)
        doc.text("Owner:", 310, 255)
  
        // Materials Table with blue header
        doc.setLineWidth(1)
        
        // Blue header background for materials table
        doc.setFillColor(173, 216, 230) // Light blue color
        doc.rect(50, 290, 500, 25, 'F') // Header background
        
        // Table borders
        doc.rect(50, 290, 500, 25) // Header row border
        doc.rect(50, 315, 500, 250) // Content area border
        
        // Column separators
        doc.line(320, 290, 320, 565) // After Description
        doc.line(390, 290, 390, 565) // After Quantity  
        doc.line(460, 290, 460, 565) // After Unit Price
  
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("DESCRIPTION", 155, 307)
        doc.text("QUANTITY", 325, 307)
        doc.text("UNIT PRICE", 390, 307)
        doc.text("AMOUNT", 480, 307)
  
        // Add materials and quantities with proper row lines
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        const materialsList = material.materials ? material.materials.split("\n").filter(item => item.trim()) : []
        const quantityList = material.quantity ? material.quantity.split("\n").filter(item => item.trim()) : []
  
        let yPos = 335
        const rowHeight = 20
        
        for (let i = 0; i < Math.max(materialsList.length, 10); i++) {
          // Add horizontal line for each row
          if (i > 0) {
            doc.line(50, yPos - 10, 550, yPos - 10)
          }
          
          if (i < materialsList.length) {
            doc.text(materialsList[i].trim(), 60, yPos)
            doc.text(quantityList[i] ? quantityList[i].trim() : "", 340, yPos)
          }
          
          yPos += rowHeight
          if (yPos > 550) break // Prevent overflow
        }
  
        // Footer section
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.text("APPROVED BY:", 50, 590)
        doc.line(50, 620, 200, 620) // Signature line
        doc.text("Authorized Signature", 50, 635)
  
        doc.text("Subtotal:", 380, 590)
        doc.text("Sales Tax (%):", 380, 605)
        doc.text("Total Amount:", 380, 620)
  
        doc.save(`purchase_order_${material.project.replace(/\s/g, '_')}.pdf`)
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  }

// Status options for materials
const statusOptions = ['All', 'Pending', 'Approved']

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
                  Delete Material
                </h3>
                <p className="text-sm text-[var(--color-foreground)]/70 mt-1">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            
            <p className="text-[var(--color-foreground)]/80 mb-6">
              Are you sure you want to delete "{itemName}"? This will permanently remove the material record and all associated data.
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

// Material Modal Component (for Add and Edit)
function MaterialModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    project: '',
    project_location: '',
    date: '',
    status: 'pending'
  })
  
  const [materialPairs, setMaterialPairs] = useState([
    { material: '', quantity: '' }
  ])

  useEffect(() => {
    if (initialData) {
      // Pre-fill form with existing data
      setFormData({
        project: initialData.project || '',
        project_location: initialData.project_location || '',
        date: initialData.date || '',
        status: initialData.status || 'pending'
      })
      
      // Parse existing materials and quantities
      const materials = initialData.materials ? initialData.materials.split('\n').filter(item => item.trim()) : ['']
      const quantities = initialData.quantity ? initialData.quantity.split('\n').filter(item => item.trim()) : ['']
      
      const pairs = []
      const maxLength = Math.max(materials.length, quantities.length, 1)
      
      for (let i = 0; i < maxLength; i++) {
        pairs.push({
          material: materials[i] || '',
          quantity: quantities[i] || ''
        })
      }
      
      setMaterialPairs(pairs.length > 0 ? pairs : [{ material: '', quantity: '' }])
    } else {
      // Reset form for new material
      setFormData({
        project: '',
        project_location: '',
        date: '',
        status: 'pending'
      })
      setMaterialPairs([{ material: '', quantity: '' }])
    }
  }, [initialData, isOpen])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleMaterialPairChange = (index, field, value) => {
    setMaterialPairs(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addMaterialPair = () => {
    setMaterialPairs(prev => [...prev, { material: '', quantity: '' }])
  }

  const removeMaterialPair = (index) => {
    if (materialPairs.length > 1) {
      setMaterialPairs(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.project || !formData.project_location || !formData.date) {
      alert('Project, Project Location, and Date are required fields')
      return
    }
    
    // Convert material pairs back to the expected format
    const materials = materialPairs.map(pair => pair.material).filter(m => m.trim()).join('\n')
    const quantities = materialPairs.map(pair => pair.quantity).filter(q => q.trim()).join('\n')
    
    const submitData = {
      ...formData,
      materials,
      quantity: quantities
    }
    
    onSubmit(submitData, initialData?.id)
    onClose()
  }

  // Prepare dropdown options
  const statusDropdownOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' }
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
                {initialData ? 'Edit Material' : 'Add New Material'}
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
              {/* Project */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Project *
                </label>
                <input
                  type="text"
                  value={formData.project}
                  onChange={(e) => handleInputChange('project', e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-all duration-200"
                  placeholder="Enter project name"
                  required
                />
              </div>

              {/* Project Location */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Project Location *
                </label>
                <input
                  type="text"
                  value={formData.project_location}
                  onChange={(e) => handleInputChange('project_location', e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-all duration-200"
                  placeholder="Enter project location"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-all duration-200"
                  required
                />
              </div>

              {/* Materials and Quantities */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-[var(--color-foreground)]">
                    Materials and Quantities
                  </label>
                  <Button
                    type="button"
                    onClick={addMaterialPair}
                    variant="outline"
                    size="sm"
                    className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Material
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {materialPairs.map((pair, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={pair.material}
                          onChange={(e) => handleMaterialPairChange(index, 'material', e.target.value)}
                          className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-all duration-200"
                          placeholder="Enter material name"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={pair.quantity}
                          onChange={(e) => handleMaterialPairChange(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 bg-[var(--color-input)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none transition-all duration-200"
                          placeholder="Enter quantity"
                        />
                      </div>
                      {materialPairs.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeMaterialPair(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
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
                  {initialData ? 'Update Material' : 'Add Material'}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Main Materials Component
export default function Materials() {
  // State management
  const [materials, setMaterials] = useState([])
  const [filteredMaterials, setFilteredMaterials] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [materialToDelete, setMaterialToDelete] = useState(null)
  const [successAlert, setSuccessAlert] = useState({ show: false, message: '' })

  const itemsPerPage = 12

  // Fetch materials data from API
  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (statusFilter !== 'All') {
        params.append('status', statusFilter.toLowerCase())
      }
      if (searchTerm) {
        params.append('search', searchTerm)
      }
      
      const response = await fetch(`${API_BASE_URL}/materials?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setMaterials(data.data)
      } else {
        console.error('Error fetching materials:', data.message)
        setMaterials([])
      }
    } catch (error) {
      console.error('Error fetching materials:', error)
      setMaterials([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchTerm])

  // Filter and search materials (now handled by API)
  useEffect(() => {
    setFilteredMaterials(materials)
    setCurrentPage(1) // Reset to first page when filters change
  }, [materials])

  // Initial data fetch and refetch when filters change
  useEffect(() => {
    fetchMaterials()
  }, [fetchMaterials])

  // Handle material submission (add/edit)
  const handleMaterialSubmit = async (formData, materialId = null) => {
    try {
      const url = materialId 
        ? `${API_BASE_URL}/materials/${materialId}`
        : `${API_BASE_URL}/materials`
      
      const method = materialId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccessAlert({
          show: true,
          message: materialId ? 'Material updated successfully!' : 'Material added successfully!'
        })
        setEditingMaterial(null)
        fetchMaterials() // Refresh the list
      } else {
        alert('Error saving material: ' + data.message)
      }
    } catch (error) {
      console.error('Error saving material:', error)
      alert('Error saving material: ' + error.message)
    }
  }

  // Handle material deletion
  const handleDeleteMaterial = async (materialId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/materials/${materialId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccessAlert({
          show: true,
          message: 'Material deleted successfully!'
        })
        fetchMaterials() // Refresh the list
      } else {
        alert('Error deleting material: ' + data.message)
      }
    } catch (error) {
      console.error('Error deleting material:', error)
      alert('Error deleting material: ' + error.message)
    }
  }

  // Handle status update
  const handleStatusUpdate = async (materialId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/materials/${materialId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccessAlert({
          show: true,
          message: `Material status updated to ${newStatus}!`
        })
        fetchMaterials() // Refresh the list
      } else {
        alert('Error updating material status: ' + data.message)
      }
    } catch (error) {
      console.error('Error updating material status:', error)
      alert('Error updating material status: ' + error.message)
    }
  }



  // Pagination calculations
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentMaterials = filteredMaterials.slice(startIndex, endIndex)

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
            Materials
          </h1>
          <p className="text-[var(--color-foreground)]/70 mt-2">
            Track and manage project materials and inventory
          </p>
        </div>
        <div className="flex flex-wrap gap-2">

          <Button
            onClick={() => {
              setEditingMaterial(null)
              setIsModalOpen(true)
            }}
            className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Material
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
            placeholder="Search materials..."
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
          <span className="ml-2 text-[var(--color-foreground)]/70">Loading materials...</span>
        </div>
      )}

      {/* Materials Grid */}
      {!loading && (
        <>
          {currentMaterials.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <Package className="h-16 w-16 text-[var(--color-foreground)]/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[var(--color-foreground)]/70 mb-2">
                No materials found
              </h3>
              <p className="text-[var(--color-foreground)]/50 mb-4">
                {searchTerm || statusFilter !== 'All' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first material record'
                }
              </p>
              {!searchTerm && statusFilter === 'All' && (
                <Button
                  onClick={() => {
                    setEditingMaterial(null)
                    setIsModalOpen(true)
                  }}
                  className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Material
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
              {currentMaterials.map((material, index) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className="border-[var(--color-border)] hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-semibold text-[var(--color-foreground)] truncate">
                            {material.project}
                          </CardTitle>
                          <div className="flex items-center mt-2 text-sm text-[var(--color-foreground)]/70">
                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">
                              {material.project_location}
                            </span>
                          </div>
                          <div className="flex items-center mt-1 text-sm text-[var(--color-foreground)]/70">
                            <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">
                              {material.date ? new Date(material.date).toLocaleDateString() : 'Not set'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                          material.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {material.status === 'approved' ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Materials List */}
                      {material.materials && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <List className="h-4 w-4 text-[var(--color-foreground)]/70" />
                            <span className="text-sm font-medium text-[var(--color-foreground)]/70">Materials</span>
                          </div>
                          <div className="text-sm text-[var(--color-foreground)]/80 max-h-20 overflow-y-auto">
                            {(() => {
                              const materialsList = material.materials.split('\n').filter(item => item.trim());
                              const quantityList = material.quantity ? material.quantity.split('\n').filter(item => item.trim()) : [];
                              
                              return materialsList.map((item, idx) => {
                                const quantity = quantityList[idx] || '';
                                const displayText = quantity ? `${item.trim()} - ${quantity.trim()}` : item.trim();
                                return (
                                  <div key={idx} className="truncate">
                                    {displayText && `• ${displayText}`}
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border)]">
                        <div className="flex space-x-2">
                        {material.status === 'approved' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => exportToPdf(material)}
                            className="text-blue-600 hover:bg-blue-500 hover:text-white"
                          >
                            <Download className="h-4 w-4 mr-1" />
                          </Button>
                        )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingMaterial(material)
                              setIsModalOpen(true)
                            }}
                            className="text-[var(--color-primary)] "
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setMaterialToDelete(material)
                              setDeleteModalOpen(true)
                            }}
                            className="text-red-600 hover:bg-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                        {/* Status Toggle */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusUpdate(
                            material.id, 
                            material.status === 'approved' ? 'pending' : 'approved'
                          )}
                          className={`text-xs px-2 py-1 ${
                            material.status === 'approved'
                              ? 'text-yellow-600 hover:bg-yellow-500 hover:text-white'
                              : 'text-green-600 hover:bg-green-500 hover:text-white'
                          }`}
                        >
                          {material.status === 'approved' ? 'Mark as Pending' : 'Mark as Approved'}
                        </Button>
                        
                      </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
                            

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
              
              <span className="text-sm text-[var(--color-foreground)]/70">
                Page {currentPage} of {totalPages}
              </span>
              
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

      {/* Material Modal */}
      <MaterialModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingMaterial(null)
        }}
        onSubmit={handleMaterialSubmit}
        initialData={editingMaterial}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setMaterialToDelete(null)
        }}
        onConfirm={() => {
          if (materialToDelete) {
            handleDeleteMaterial(materialToDelete.id)
            setDeleteModalOpen(false)
            setMaterialToDelete(null)
          }
        }}
        itemName={materialToDelete?.project || 'this material'}
      />
    </div>
  )
}




