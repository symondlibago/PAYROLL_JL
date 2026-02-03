import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, FileDown, Calendar, Type, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CustomDatePicker, SearchableSelect } from './CustomInputs'

export const ExportPayrollModal = ({ isOpen, onClose, onGenerate, count }) => {
  const [payPeriod, setPayPeriod] = useState('')
  const [payDate, setPayDate] = useState('')
  const [reportType, setReportType] = useState('payroll_sheet') // Default

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full flex flex-col relative"
      >
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex justify-between items-center rounded-t-xl">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileDown className="w-5 h-5" /> Export Reports
            </h3>
            <p className="text-xs text-slate-400 mt-1">Generating report for {count} employees</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* 1. Report Type Dropdown */}
          <div className="space-y-2 relative z-30">
            <SearchableSelect 
              label="Report Type"
              options={[
                { label: 'Payroll Sheet (PDF Landscape)', value: 'payroll_sheet' },
                { label: 'Payroll Sheet (Excel)', value: 'payroll_sheet_excel' }, // <--- NEW OPTION
                { label: 'Deduction Schedule (PDF Portrait)', value: 'deduction_schedule' },
                { label: 'Contributions (PDF Portrait)', value: 'contributions' },
                { label: 'Employee Payslips (3/Page)', value: 'payslip' }
              ]}
              value={reportType}
              onChange={setReportType}
            />
          </div>

          {/* 2. Pay Period */}
          <div className="space-y-2 relative z-20">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Pay Period (Date)
            </label>
            <CustomDatePicker 
              value={payPeriod} 
              onChange={setPayPeriod} 
            />
          </div>

          {/* 3. Pay Date */}
          <div className="space-y-2 relative z-10">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Pay Date
            </label>
            <CustomDatePicker 
              value={payDate} 
              onChange={setPayDate} 
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-gray-50 flex gap-3 rounded-b-xl">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button 
            onClick={() => onGenerate(payPeriod, payDate, reportType)} 
            disabled={!payPeriod || !payDate || !reportType}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <FileDown className="w-4 h-4 mr-2" /> Generate
          </Button>
        </div>
      </motion.div>
    </div>
  )
}