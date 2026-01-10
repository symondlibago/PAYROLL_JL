import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { X, Loader2, Calculator, Save, AlertCircle, Wallet, CheckCircle, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchableSelect, CustomDatePicker } from './CustomInputs'

const InputGroup = ({ label, value, onChange, type = "number", disabled }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-gray-900"
      disabled={disabled}
      placeholder="0.00"
    />
  </div>
)

const DetailRow = ({ label, value, isDeduction = false, isBold = false }) => (
  <div className={`flex justify-between items-center py-2 border-b border-dashed border-gray-100 last:border-0 ${isBold ? 'font-bold' : 'text-sm'}`}>
    <span className="text-gray-500">{label}</span>
    <span className={`${isDeduction ? 'text-red-600' : 'text-gray-900'}`}>
      {typeof value === 'number' ? `₱${value.toLocaleString(undefined, {minimumFractionDigits: 2})}` : value}
    </span>
  </div>
)

export const ViewPayrollModal = ({ isOpen, onClose, payroll }) => {
  if (!isOpen || !payroll) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 text-white relative">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h2 className="text-2xl font-bold">{payroll.employee_name}</h2>
              <p className="text-blue-200 text-sm">{payroll.position}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full"><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          <div>
            <h3 className="text-xs font-bold text-green-600 uppercase mb-3">Earnings</h3>
            <div className="bg-green-50/50 rounded-xl p-4 space-y-1">
              <DetailRow label="Basic Salary" value={parseFloat(payroll.basic_salary)} />
              <DetailRow label="Overtime Pay" value={parseFloat(payroll.overtime_pay)} />
              <DetailRow label="Total Gross Pay" value={parseFloat(payroll.gross_pay)} isBold />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-red-600 uppercase mb-3">Deductions</h3>
            <div className="bg-red-50/50 rounded-xl p-4 space-y-1">
              <DetailRow label="Late Deduction" value={parseFloat(payroll.late_deduction)} isDeduction />
              <DetailRow label="SSS" value={parseFloat(payroll.sss_deduction)} isDeduction />
              <DetailRow label="PhilHealth" value={parseFloat(payroll.philhealth_deduction)} isDeduction />
              <DetailRow label="Pag-IBIG" value={parseFloat(payroll.pagibig_deduction)} isDeduction />
              <DetailRow label="G-Bond" value={parseFloat(payroll.gbond_deduction)} isDeduction />
              <DetailRow label="Others" value={parseFloat(payroll.others_deduction)} isDeduction />
              <div className="border-t border-red-200 pt-2 mt-2">
                <DetailRow label="Total Deductions" value={parseFloat(payroll.total_deductions)} isDeduction isBold />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-6 border-t flex justify-between items-center">
          <span className="text-gray-500 font-medium">Net Pay</span>
          <span className="text-2xl font-bold text-blue-900">₱{parseFloat(payroll.net_pay).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
        </div>
      </motion.div>
    </div>
  )
}

export const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-bold mb-2">Delete Record?</h3>
        <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="animate-spin" /> : "Delete"}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

// --- PROCESS/EDIT MODAL (With Status Field) ---
export const ProcessPayrollModal = ({ isOpen, onClose, onSubmit, employees, isLoading, initialData }) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    status: 'Pending',
    pay_period_start: '',
    pay_period_end: '',
    total_working_days: '',
    total_overtime_hours: '',
    total_late_minutes: '',
    sss_deduction: '',
    philhealth_deduction: '',
    pagibig_deduction: '',
    gbond_deduction: '',
    others_deduction: ''
  })
  
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  const employeeOptions = useMemo(() => 
    employees.map(emp => ({ value: emp.id, label: `${emp.name} (${emp.position})` })), 
  [employees])

  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Released', label: 'Released' },
    { value: 'Paid', label: 'Paid' },
    { value: 'On Hold', label: 'On Hold' }
  ]

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData, employee_id: initialData.employee_id })
        setSelectedEmployee(employees.find(e => e.id === initialData.employee_id))
      } else {
        setFormData({
          employee_id: '', status: 'Pending', pay_period_start: '', pay_period_end: '',
          total_working_days: '', total_overtime_hours: '', total_late_minutes: '',
          sss_deduction: '', philhealth_deduction: '', pagibig_deduction: '', gbond_deduction: '', others_deduction: ''
        })
        setSelectedEmployee(null)
      }
    }
  }, [isOpen, initialData, employees])

  const handleEmployeeChange = (value) => {
    setFormData(prev => ({ ...prev, employee_id: value }))
    setSelectedEmployee(employees.find(e => e.id === value))
  }

  const preview = useMemo(() => {
    if (!selectedEmployee) return null
    const rate = parseFloat(selectedEmployee.rate || 0)
    const hourly = parseFloat(selectedEmployee.hourly_rate || 0)
    
    const basic = rate * (parseFloat(formData.total_working_days) || 0)
    const ot = hourly * 1.25 * (parseFloat(formData.total_overtime_hours) || 0)
    const lateDed = (hourly / 60) * (parseFloat(formData.total_late_minutes) || 0)
    
    const deductions = lateDed + 
      (parseFloat(formData.sss_deduction) || 0) + (parseFloat(formData.philhealth_deduction) || 0) +
      (parseFloat(formData.pagibig_deduction) || 0) + (parseFloat(formData.gbond_deduction) || 0) +
      (parseFloat(formData.others_deduction) || 0)

    return { gross: basic + ot, deductions, net: (basic + ot) - deductions }
  }, [formData, selectedEmployee])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Payroll' : 'Process Office Payroll'}</h2>
            <p className="text-sm text-gray-500">Calculate salary and deductions</p>
          </div>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-500" /></button>
        </div>

        <div className="p-6 space-y-8">
          {/* Row 1: Employee, Status, Dates */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <SearchableSelect 
                label="Select Employee"
                options={employeeOptions}
                value={formData.employee_id}
                onChange={handleEmployeeChange}
                disabled={!!initialData}
                placeholder="Search employee..."
              />
            </div>
            
            {/* Added Status Dropdown */}
            <SearchableSelect 
              label="Set Status"
              options={statusOptions}
              value={formData.status}
              onChange={(val) => setFormData({...formData, status: val})}
              placeholder="Pending"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <CustomDatePicker label="Period Start" value={formData.pay_period_start} onChange={v => setFormData({...formData, pay_period_start: v})} />
             <CustomDatePicker label="Period End" value={formData.pay_period_end} onChange={v => setFormData({...formData, pay_period_end: v})} />
          </div>

          {/* Row 2: Attendance */}
          <div className="border border-blue-100 bg-blue-50/30 rounded-xl p-5">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4" /> Attendance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputGroup label="Days Worked" value={formData.total_working_days} onChange={v => setFormData({...formData, total_working_days: v})} />
              <InputGroup label="Overtime (Hrs)" value={formData.total_overtime_hours} onChange={v => setFormData({...formData, total_overtime_hours: v})} />
              <InputGroup label="Lates (Mins)" value={formData.total_late_minutes} onChange={v => setFormData({...formData, total_late_minutes: v})} />
            </div>
          </div>

          {/* Row 3: Deductions */}
          <div className="border border-red-100 bg-red-50/30 rounded-xl p-5">
            <h3 className="text-xs font-bold text-red-700 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Deductions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <InputGroup label="SSS" value={formData.sss_deduction} onChange={v => setFormData({...formData, sss_deduction: v})} />
              <InputGroup label="PhilHealth" value={formData.philhealth_deduction} onChange={v => setFormData({...formData, philhealth_deduction: v})} />
              <InputGroup label="Pag-IBIG" value={formData.pagibig_deduction} onChange={v => setFormData({...formData, pagibig_deduction: v})} />
              <InputGroup label="G-Bond" value={formData.gbond_deduction} onChange={v => setFormData({...formData, gbond_deduction: v})} />
              <InputGroup label="Others" value={formData.others_deduction} onChange={v => setFormData({...formData, others_deduction: v})} />
            </div>
          </div>
        </div>

        {/* Footer */}
        {preview && (
          <div className="sticky bottom-0 bg-white border-t p-4 flex justify-between items-center shadow-lg">
            <div className="flex gap-6 text-sm">
              <span>Gross: <b className="text-green-900">₱{preview.gross.toLocaleString(undefined, {minimumFractionDigits: 2})}</b></span>
              <span>Deductions: <b className="text-red-600">₱{preview.deductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</b></span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right mr-4">
                <span className="block text-xs text-gray-500 uppercase">Net Pay</span>
                <span className="block text-xl font-bold text-blue-600">₱{preview.net.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <Button onClick={() => onSubmit(formData)} disabled={isLoading || !formData.employee_id} className="bg-blue-600">
                {isLoading ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2"/>} {initialData ? 'Update' : 'Process'}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}