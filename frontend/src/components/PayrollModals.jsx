import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { X, Loader2, Calculator, Save, AlertCircle, Wallet, Calendar, Clock, Banknote, FileText, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchableSelect, CustomDatePicker } from './CustomInputs'

// --- Utility Components ---
const SectionHeader = ({ icon: Icon, title, color }) => (
  <div className={`flex items-center gap-2 mb-3 pb-1 border-b ${color ? `border-${color}-200 text-${color}-700` : 'border-gray-200 text-gray-700'}`}>
    <Icon className="w-4 h-4" />
    <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
  </div>
)

const InputGroup = ({ label, value, onChange, placeholder = "0", type = "number", className = "" }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-[10px] font-bold text-gray-500 uppercase truncate block" title={label}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-right"
      placeholder={placeholder}
      onFocus={(e) => e.target.select()}
    />
  </div>
)

const DualInputGroup = ({ label, dayValue, onDayChange, hourValue, onHourChange, className = "" }) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-[10px] font-bold text-gray-500 uppercase truncate block" title={label}>{label}</label>
    <div className="flex gap-1">
      <div className="relative w-1/2">
        <input
          type="number"
          value={dayValue}
          onChange={e => onDayChange(e.target.value)}
          className="w-full pl-1 pr-6 py-1.5 bg-white border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 text-right"
          placeholder="0"
          onFocus={(e) => e.target.select()}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">D</span>
      </div>
      <div className="relative w-1/2">
        <input
          type="number"
          value={hourValue}
          onChange={e => onHourChange(e.target.value)}
          className="w-full pl-1 pr-6 py-1.5 bg-white border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 text-right"
          placeholder="0"
          onFocus={(e) => e.target.select()}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">H</span>
      </div>
    </div>
  </div>
)

const DetailRow = ({ label, value, isDeduction = false, isBold = false, subLabel }) => (
  <div className={`flex justify-between items-start py-1.5 border-b border-dashed border-gray-100 last:border-0 ${isBold ? 'font-bold' : 'text-sm'}`}>
    <div className="flex flex-col">
      <span className="text-gray-600">{label}</span>
      {subLabel && <span className="text-[10px] text-gray-400 font-normal">{subLabel}</span>}
    </div>
    <span className={`${isDeduction ? 'text-red-600' : 'text-gray-900'}`}>
      {typeof value === 'number' ? `₱${value.toLocaleString(undefined, {minimumFractionDigits: 2})}` : value}
    </span>
  </div>
)

// --- PROCESS PAYROLL MODAL ---
export const ProcessPayrollModal = ({ isOpen, onClose, onSubmit, employees, isLoading, initialData }) => {
  const [formData, setFormData] = useState({
    employee_id: '', status: 'Pending', pay_period_start: '', pay_period_end: '', mode_of_payment: '',
    total_days_worked: '', total_hours_worked: '', total_late_minutes: '',
    sunday_rest_day_days: '', sunday_rest_day_hours: '',
    special_day_days: '', special_day_hours: '',
    special_day_rest_day_days: '', special_day_rest_day_hours: '',
    regular_holiday_days: '', regular_holiday_hours: '',
    regular_holiday_rest_day_days: '', regular_holiday_rest_day_hours: '',
    nd_ordinary_days: '', nd_ordinary_hours: '',
    nd_rest_special_days: '', nd_rest_special_hours: '',
    nd_regular_holiday_days: '', nd_regular_holiday_hours: '',
    ot_regular_hours: '', ot_rest_day_hours: '', ot_special_day_hours: '',
    ot_special_rest_day_hours: '', ot_regular_holiday_hours: '',
    allowance_amount: '', allowance_remarks: '',
    sss_deduction: '', philhealth_deduction: '', pagibig_deduction: '',
    proc_fee_deduction: '', gbond_deduction: '', uniform_deduction: '',
    sss_loan_deduction: '', pagibig_loan_deduction: '',
    sss_calamity_loan_deduction: '', pagibig_calamity_loan_deduction: '',
    others_deduction: '', others_deduction_remarks: ''
  })
  
  // New States for Filtering
  const [filterClient, setFilterClient] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  // Extract unique options for filters
  const uniqueClients = useMemo(() => [...new Set(employees.map(e => e.client_name).filter(Boolean))], [employees])
  const uniqueDepts = useMemo(() => [...new Set(employees.map(e => e.department_location).filter(Boolean))], [employees])

  // Filter the employees list based on selection
  const filteredEmployeeOptions = useMemo(() => {
    return employees
      .filter(e => {
        const matchesClient = !filterClient || e.client_name === filterClient
        const matchesDept = !filterDept || e.department_location === filterDept
        return matchesClient && matchesDept
      })
      .map(e => ({ value: e.id, label: `${e.name} (${e.position})` }))
  }, [employees, filterClient, filterDept])

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData })
        setSelectedEmployee(employees.find(e => e.id === initialData.employee_id))
      } else {
        const cleanState = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: '' }), {})
        setFormData({ ...cleanState, status: 'Pending', mode_of_payment: 'Cash' })
        setSelectedEmployee(null)
        setFilterClient('')
        setFilterDept('')
      }
    }
  }, [isOpen, initialData, employees])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleEmployeeChange = (empId) => {
    const emp = employees.find(e => e.id === empId);
    setSelectedEmployee(emp);
    
    let mop = 'Cash';
    if (emp?.bank_type) {
        if(emp.bank_type === 'AUB') mop = 'AUB';
        else if(emp.bank_type === 'EAST WEST') mop = 'EAST WEST';
    }
    setFormData(prev => ({ ...prev, employee_id: empId, mode_of_payment: mop }));
  }

  // --- Real-time Calculation for Preview ---
  const preview = useMemo(() => {
    if (!selectedEmployee) return null
    
    const rate = parseFloat(selectedEmployee.rate || 0)
    const hourly = parseFloat(selectedEmployee.hourly_rate || 0)
    const getVal = (field) => parseFloat(formData[field]) || 0

    const basic = (rate * getVal('total_days_worked')) + (hourly * getVal('total_hours_worked'))
    const late = (hourly / 60) * getVal('total_late_minutes')
    
    const calc = (d, h, m) => (getVal(d) * rate * m) + (getVal(h) * hourly * m)

    const holiday = 
      calc('sunday_rest_day_days', 'sunday_rest_day_hours', 1.3) +
      calc('special_day_days', 'special_day_hours', 1.3) +
      calc('special_day_rest_day_days', 'special_day_rest_day_hours', 1.5) +
      calc('regular_holiday_days', 'regular_holiday_hours', 2.0) +
      calc('regular_holiday_rest_day_days', 'regular_holiday_rest_day_hours', 2.6)

    const nd = 
      calc('nd_ordinary_days', 'nd_ordinary_hours', 1.1) +
      calc('nd_rest_special_days', 'nd_rest_special_hours', 1.43) +
      calc('nd_regular_holiday_days', 'nd_regular_holiday_hours', 2.2)

    const ot = 
      (getVal('ot_regular_hours') * hourly * 1.25) +
      (getVal('ot_rest_day_hours') * hourly * 1.69) +
      (getVal('ot_special_day_hours') * hourly * 1.69) +
      (getVal('ot_special_rest_day_hours') * hourly * 1.95) +
      (getVal('ot_regular_holiday_hours') * hourly * 2.6)

    const allowance = getVal('allowance_amount')
    const gross = basic + holiday + nd + ot + allowance

    const deductions = late + 
      getVal('sss_deduction') + getVal('philhealth_deduction') + getVal('pagibig_deduction') +
      getVal('proc_fee_deduction') + getVal('gbond_deduction') + getVal('uniform_deduction') +
      getVal('sss_loan_deduction') + getVal('pagibig_loan_deduction') + 
      getVal('sss_calamity_loan_deduction') + getVal('pagibig_calamity_loan_deduction') +
      getVal('others_deduction')

    return { gross, deductions, net: gross - deductions }
  }, [formData, selectedEmployee])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-[1200px] h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Payroll Record' : 'Process New Payroll'}</h2>
            <p className="text-xs text-gray-500">Please verify all hours and rates before processing.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="h-5 w-5 text-gray-500" /></button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Inputs (8 cols) */}
            <div className="xl:col-span-8 space-y-6">
              
              {/* 1. Employee & Period */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                
                {/* NEW: Filter Row (Only show if Adding new, disabled on Edit) */}
                {!initialData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                    <SearchableSelect 
                      label="Filter by Client" 
                      options={[{label: 'All Clients', value: ''}, ...uniqueClients.map(c => ({ label: c, value: c }))]}
                      value={filterClient}
                      onChange={setFilterClient}
                      placeholder="All Clients"
                    />
                    <SearchableSelect 
                      label="Filter by Dept/Location" 
                      options={[{label: 'All Locations', value: ''}, ...uniqueDepts.map(d => ({ label: d, value: d }))]}
                      value={filterDept}
                      onChange={setFilterDept}
                      placeholder="All Locations"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SearchableSelect 
                    label="Employee" 
                    options={filteredEmployeeOptions}
                    value={formData.employee_id}
                    onChange={handleEmployeeChange}
                    disabled={!!initialData}
                    placeholder={filteredEmployeeOptions.length === 0 ? "No employees found" : "Select Employee..."}
                  />
                  <SearchableSelect 
                    label="Status" 
                    options={['Pending', 'Processing', 'Released', 'Paid', 'On Hold'].map(s => ({value:s, label:s}))}
                    value={formData.status}
                    onChange={(val) => handleChange('status', val)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="md:col-span-1">
                      <SearchableSelect 
                        label="Mode of Payment" 
                        options={['AUB', 'EAST WEST', 'Cash', 'Palawan'].map(s => ({value:s, label:s}))}
                        value={formData.mode_of_payment}
                        onChange={(val) => handleChange('mode_of_payment', val)}
                      />
                   </div>
                   <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      <CustomDatePicker label="Start Date" value={formData.pay_period_start} onChange={v => handleChange('pay_period_start', v)} />
                      <CustomDatePicker label="End Date" value={formData.pay_period_end} onChange={v => handleChange('pay_period_end', v)} />
                   </div>
                </div>
              </div>

              {/* 2. Attendance & Time */}
              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                <SectionHeader icon={Clock} title="Attendance & Basic Time" color="blue" />
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                         <DualInputGroup 
                            label="Total Time Worked"
                            dayValue={formData.total_days_worked} onDayChange={v => handleChange('total_days_worked', v)}
                            hourValue={formData.total_hours_worked} onHourChange={v => handleChange('total_hours_worked', v)}
                         />
                    </div>
                  <InputGroup label="Late (Minutes)" value={formData.total_late_minutes} onChange={v => handleChange('total_late_minutes', v)} />
                </div>
              </div>

              {/* 3. Special Pay & OT Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Special Days & Holidays */}
                <div className="bg-white p-5 rounded-xl border border-gray-200">
                  <SectionHeader icon={Calendar} title="Holidays (Days & Hours)" />
                  <div className="space-y-3">
                    <DualInputGroup 
                        label="Sunday / Rest Day (130%)" 
                        dayValue={formData.sunday_rest_day_days} onDayChange={v => handleChange('sunday_rest_day_days', v)}
                        hourValue={formData.sunday_rest_day_hours} onHourChange={v => handleChange('sunday_rest_day_hours', v)}
                    />
                    <DualInputGroup 
                        label="Special Day (130%)" 
                        dayValue={formData.special_day_days} onDayChange={v => handleChange('special_day_days', v)}
                        hourValue={formData.special_day_hours} onHourChange={v => handleChange('special_day_hours', v)}
                    />
                    <DualInputGroup 
                        label="Spc. Day on Rest Day (150%)" 
                        dayValue={formData.special_day_rest_day_days} onDayChange={v => handleChange('special_day_rest_day_days', v)}
                        hourValue={formData.special_day_rest_day_hours} onHourChange={v => handleChange('special_day_rest_day_hours', v)}
                    />
                    <DualInputGroup 
                        label="Regular Holiday (200%)" 
                        dayValue={formData.regular_holiday_days} onDayChange={v => handleChange('regular_holiday_days', v)}
                        hourValue={formData.regular_holiday_hours} onHourChange={v => handleChange('regular_holiday_hours', v)}
                    />
                    <DualInputGroup 
                        label="Reg. Hol on Rest Day (260%)" 
                        dayValue={formData.regular_holiday_rest_day_days} onDayChange={v => handleChange('regular_holiday_rest_day_days', v)}
                        hourValue={formData.regular_holiday_rest_day_hours} onHourChange={v => handleChange('regular_holiday_rest_day_hours', v)}
                    />
                  </div>
                </div>

                {/* Overtime & Night Diff */}
                <div className="space-y-6">
                  {/* NOW USING DUAL INPUTS FOR NIGHT DIFF */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200">
                    <SectionHeader icon={Clock} title="Night Differential" />
                    <div className="space-y-3">
                      <DualInputGroup 
                        label="Ordinary (110%)"
                        dayValue={formData.nd_ordinary_days} onDayChange={v => handleChange('nd_ordinary_days', v)}
                        hourValue={formData.nd_ordinary_hours} onHourChange={v => handleChange('nd_ordinary_hours', v)}
                      />
                      <DualInputGroup 
                        label="Rest/Special (143%)"
                        dayValue={formData.nd_rest_special_days} onDayChange={v => handleChange('nd_rest_special_days', v)}
                        hourValue={formData.nd_rest_special_hours} onHourChange={v => handleChange('nd_rest_special_hours', v)}
                      />
                      <DualInputGroup 
                        label="Reg Holiday (220%)"
                        dayValue={formData.nd_regular_holiday_days} onDayChange={v => handleChange('nd_regular_holiday_days', v)}
                        hourValue={formData.nd_regular_holiday_hours} onHourChange={v => handleChange('nd_regular_holiday_hours', v)}
                      />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-gray-200">
                    <SectionHeader icon={Clock} title="Overtime (Hours)" />
                    <div className="grid grid-cols-2 gap-3">
                      <InputGroup label="Regular OT (125%)" value={formData.ot_regular_hours} onChange={v => handleChange('ot_regular_hours', v)} />
                      <InputGroup label="Rest Day OT (169%)" value={formData.ot_rest_day_hours} onChange={v => handleChange('ot_rest_day_hours', v)} />
                      <InputGroup label="Special Day OT (169%)" value={formData.ot_special_day_hours} onChange={v => handleChange('ot_special_day_hours', v)} />
                      <InputGroup label="Spc/Rest OT (195%)" value={formData.ot_special_rest_day_hours} onChange={v => handleChange('ot_special_rest_day_hours', v)} />
                      <InputGroup label="Reg. Hol OT (260%)" value={formData.ot_regular_holiday_hours} onChange={v => handleChange('ot_regular_holiday_hours', v)} className="col-span-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="xl:col-span-4 space-y-6">
              <div className="bg-green-50/50 p-5 rounded-xl border border-green-100">
                <SectionHeader icon={Banknote} title="Allowance" color="green" />
                <div className="space-y-3">
                  <InputGroup label="Amount" value={formData.allowance_amount} onChange={v => handleChange('allowance_amount', v)} />
                  <InputGroup label="Remarks" type="text" value={formData.allowance_remarks} onChange={v => handleChange('allowance_remarks', v)} placeholder="e.g. Rice Subsidy" />
                </div>
              </div>
              <div className="bg-red-50/50 p-5 rounded-xl border border-red-100">
                <SectionHeader icon={Wallet} title="Deductions" color="red" />
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <InputGroup label="SSS" value={formData.sss_deduction} onChange={v => handleChange('sss_deduction', v)} />
                    <InputGroup label="PhilHealth" value={formData.philhealth_deduction} onChange={v => handleChange('philhealth_deduction', v)} />
                    <InputGroup label="Pag-IBIG" value={formData.pagibig_deduction} onChange={v => handleChange('pagibig_deduction', v)} />
                    <InputGroup label="G-Bond" value={formData.gbond_deduction} onChange={v => handleChange('gbond_deduction', v)} />
                  </div>
                  <div className="pt-3 border-t border-red-200/50">
                    <label className="text-[10px] font-bold text-red-700 uppercase mb-2 block">Loans & Others</label>
                    <div className="grid grid-cols-2 gap-3">
                      <InputGroup label="SSS Loan" value={formData.sss_loan_deduction} onChange={v => handleChange('sss_loan_deduction', v)} />
                      <InputGroup label="Pag-IBIG Loan" value={formData.pagibig_loan_deduction} onChange={v => handleChange('pagibig_loan_deduction', v)} />
                      <InputGroup label="SSS Calamity" value={formData.sss_calamity_loan_deduction} onChange={v => handleChange('sss_calamity_loan_deduction', v)} />
                      <InputGroup label="Pag-IBIG Cal." value={formData.pagibig_calamity_loan_deduction} onChange={v => handleChange('pagibig_calamity_loan_deduction', v)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                     <InputGroup label="Proc. Fee" value={formData.proc_fee_deduction} onChange={v => handleChange('proc_fee_deduction', v)} />
                     <InputGroup label="Uniform" value={formData.uniform_deduction} onChange={v => handleChange('uniform_deduction', v)} />
                  </div>
                  <div className="pt-2">
                    <InputGroup label="Other Deductions" value={formData.others_deduction} onChange={v => handleChange('others_deduction', v)} />
                    <input type="text" value={formData.others_deduction_remarks} onChange={e => handleChange('others_deduction_remarks', e.target.value)} placeholder="Remarks for others..." className="w-full mt-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs"/>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t p-4 flex justify-between items-center shrink-0 shadow-lg z-10">
          <div className="flex gap-8 text-sm">
             <div><span className="text-gray-500 text-xs block uppercase">Gross Pay</span><span className="font-bold text-green-600 text-lg">₱{preview?.gross.toLocaleString(undefined, {minimumFractionDigits:2}) || '0.00'}</span></div>
             <div><span className="text-gray-500 text-xs block uppercase">Deductions</span><span className="font-bold text-red-600 text-lg">₱{preview?.deductions.toLocaleString(undefined, {minimumFractionDigits:2}) || '0.00'}</span></div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right"><span className="text-gray-500 text-xs block uppercase">Net Pay</span><span className="font-bold text-blue-700 text-2xl">₱{preview?.net.toLocaleString(undefined, {minimumFractionDigits:2}) || '0.00'}</span></div>
            <Button onClick={() => onSubmit(formData)} disabled={isLoading || !formData.employee_id} className="bg-blue-600 hover:bg-blue-700 h-12 px-8">{isLoading ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2"/>}{initialData ? 'Update Payroll' : 'Process Payroll'}</Button>
          </div>
        </div>

      </motion.div>
    </div>
  )
}

// ... ViewPayrollModal and DeleteConfirmationModal (unchanged) ...
export const ViewPayrollModal = ({ isOpen, onClose, payroll }) => {
  if (!isOpen || !payroll) return null

  // Helper to safely format dates
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <div className="bg-slate-900 p-6 text-white shrink-0">
          <div className="flex justify-between items-start">
            <div><h2 className="text-2xl font-bold">{payroll.employee_name}</h2><p className="text-slate-400 text-sm">{payroll.position} • {payroll.id_number}</p></div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full"><X className="w-5 h-5" /></button>
          </div>
          <div className="mt-4 flex justify-between text-xs text-slate-400 font-mono">
             <span>{formatDate(payroll.pay_period_start)} to {formatDate(payroll.pay_period_end)}</span>
             <span>ID: {payroll.id}</span>
          </div>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h3 className="text-xs font-bold text-green-600 uppercase mb-3 border-b border-green-100 pb-1">Earnings</h3>
            <div className="space-y-1">
              <DetailRow label="Basic Salary" subLabel={`${payroll.total_days_worked} days`} value={parseFloat(payroll.basic_salary)} />
              {(parseFloat(payroll.holiday_pay) > 0) && <DetailRow label="Holiday & Premiums" subLabel="Includes Rest/Special/Reg" value={parseFloat(payroll.holiday_pay)} />}
              {(parseFloat(payroll.night_diff_pay) > 0) && <DetailRow label="Night Differential" value={parseFloat(payroll.night_diff_pay)} />}
              {(parseFloat(payroll.overtime_pay) > 0) && <DetailRow label="Overtime Pay" value={parseFloat(payroll.overtime_pay)} />}
              {(parseFloat(payroll.allowance_amount) > 0) && <DetailRow label="Allowance" subLabel={payroll.allowance_remarks} value={parseFloat(payroll.allowance_amount)} />}
              <div className="pt-2 mt-2 border-t border-gray-100"><DetailRow label="Total Gross Pay" value={parseFloat(payroll.gross_pay)} isBold /></div>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-red-600 uppercase mb-3 border-b border-red-100 pb-1">Deductions</h3>
            <div className="space-y-1">
              {parseFloat(payroll.late_deduction) > 0 && <DetailRow label="Late Deduction" value={parseFloat(payroll.late_deduction)} isDeduction />}
              {parseFloat(payroll.sss_deduction) > 0 && <DetailRow label="SSS" value={parseFloat(payroll.sss_deduction)} isDeduction />}
              {parseFloat(payroll.philhealth_deduction) > 0 && <DetailRow label="PhilHealth" value={parseFloat(payroll.philhealth_deduction)} isDeduction />}
              {parseFloat(payroll.pagibig_deduction) > 0 && <DetailRow label="Pag-IBIG" value={parseFloat(payroll.pagibig_deduction)} isDeduction />}
              {parseFloat(payroll.gbond_deduction) > 0 && <DetailRow label="G-Bond" value={parseFloat(payroll.gbond_deduction)} isDeduction />}
              {parseFloat(payroll.uniform_deduction) > 0 && <DetailRow label="Uniform" value={parseFloat(payroll.uniform_deduction)} isDeduction />}
              {parseFloat(payroll.proc_fee_deduction) > 0 && <DetailRow label="Processing Fee" value={parseFloat(payroll.proc_fee_deduction)} isDeduction />}
              {parseFloat(payroll.sss_loan_deduction) > 0 && <DetailRow label="SSS Loan" value={parseFloat(payroll.sss_loan_deduction)} isDeduction />}
              {parseFloat(payroll.pagibig_loan_deduction) > 0 && <DetailRow label="Pag-IBIG Loan" value={parseFloat(payroll.pagibig_loan_deduction)} isDeduction />}
              {parseFloat(payroll.sss_calamity_loan_deduction) > 0 && <DetailRow label="SSS Calamity" value={parseFloat(payroll.sss_calamity_loan_deduction)} isDeduction />}
              {parseFloat(payroll.pagibig_calamity_loan_deduction) > 0 && <DetailRow label="Pag-IBIG Calamity" value={parseFloat(payroll.pagibig_calamity_loan_deduction)} isDeduction />}
              {parseFloat(payroll.others_deduction) > 0 && <DetailRow label="Others" subLabel={payroll.others_deduction_remarks} value={parseFloat(payroll.others_deduction)} isDeduction />}
              <div className="pt-2 mt-2 border-t border-red-100"><DetailRow label="Total Deductions" value={parseFloat(payroll.total_deductions)} isDeduction isBold /></div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-6 border-t shrink-0 flex justify-between items-center">
          <div className="text-left"><span className="text-gray-400 text-xs font-bold uppercase block mb-1">Payment Method</span><span className="text-gray-900 font-bold bg-gray-200 px-3 py-1 rounded-full text-xs">{payroll.mode_of_payment || 'N/A'}</span></div>
          <div className="text-right"><span className="text-gray-500 font-medium text-sm block">Net Pay</span><span className="text-3xl font-bold text-slate-900">₱{parseFloat(payroll.net_pay).toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
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
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4"><AlertCircle className="w-6 h-6 text-red-600" /></div>
        <h3 className="text-lg font-bold mb-2">Delete Record?</h3>
        <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
        <div className="flex gap-3"><Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button><Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={onConfirm} disabled={isDeleting}>{isDeleting ? <Loader2 className="animate-spin" /> : "Delete"}</Button></div>
      </motion.div>
    </div>
  )
}