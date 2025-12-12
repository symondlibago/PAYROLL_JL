import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Download, Trash2, Edit, Eye,
  TrendingUp, TrendingDown, Wallet, Users,
  Filter, ChevronDown, CheckCircle2, FileText, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProcessPayrollModal, DeleteConfirmationModal, ViewPayrollModal } from '@/components/PayrollModals'
import { CustomDatePicker } from '@/components/CustomInputs'
import * as XLSX from 'xlsx'
import API_BASE_URL from './Config'

// --- Filter Dropdown ---
const FilterDropdown = ({ label, value, options, onChange, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-white hover:border-blue-300 transition-all text-sm font-medium text-gray-700 min-w-[160px] justify-between h-[42px]"
      >
        <span className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          {value || label}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
              className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden"
            >
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { onChange(opt); setIsOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// --- Status Changing Dropdown ---
const StatusCell = ({ id, currentStatus, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false)
  
  const statusColors = {
    'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
    'Processing': 'bg-blue-100 text-blue-700 border-blue-200',
    'Released': 'bg-purple-100 text-purple-700 border-purple-200',
    'Paid': 'bg-green-100 text-green-700 border-green-200',
    'On Hold': 'bg-gray-100 text-gray-700 border-gray-200',
  }

  return (
    <div className="relative">
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 mx-auto hover:brightness-95 transition-all ${statusColors[currentStatus] || statusColors['Pending']}`}
      >
        {currentStatus}
        <ChevronDown className="w-3 h-3 opacity-50" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-36 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden"
            >
              {['Pending', 'Processing', 'Released', 'Paid', 'On Hold'].map(status => (
                <button
                  key={status}
                  onClick={(e) => { e.stopPropagation(); onUpdate(id, status); setIsOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors ${status === currentStatus ? 'font-bold text-blue-600 bg-blue-50' : 'text-gray-700'}`}
                >
                  {status}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

const SuccessToast = ({ message, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-6 right-6 bg-white border-l-4 border-green-500 shadow-2xl rounded-lg p-4 flex items-center gap-3 z-50">
      <CheckCircle2 className="w-5 h-5 text-green-600" />
      <span className="text-sm font-medium text-gray-800">{message}</span>
    </motion.div>
  )
}

const WorkersPayroll = () => {
  const [payrolls, setPayrolls] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedPayroll, setSelectedPayroll] = useState(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [payrollRes, employeeRes] = await Promise.all([
        fetch(`${API_BASE_URL}/office-payrolls`),
        fetch(`${API_BASE_URL}/employees?status=Office`)
      ])
      const pData = await payrollRes.json()
      const eData = await employeeRes.json()
      if (pData.success) setPayrolls(pData.data)
      if (eData.success) setEmployees(eData.data.filter(e => e.status === 'Office'))
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/office-payrolls/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if(res.ok) {
        setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
        setToast(`Status updated to ${newStatus}`)
      }
    } catch (e) { console.error(e) }
  }

  const handleProcessPayroll = async (formData) => {
    try {
      setIsSubmitting(true)
      const method = formData.id ? 'PUT' : 'POST'
      const url = formData.id ? `${API_BASE_URL}/office-payrolls/${formData.id}` : `${API_BASE_URL}/office-payrolls`
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      const data = await res.json()
      if (data.success) {
        setIsProcessModalOpen(false)
        fetchData()
        setToast(formData.id ? 'Payroll updated' : 'Payroll created')
      }
    } catch (e) { console.error(e) } finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!selectedPayroll) return
    try {
      setIsSubmitting(true)
      await fetch(`${API_BASE_URL}/office-payrolls/${selectedPayroll.id}`, { method: 'DELETE' })
      setPayrolls(prev => prev.filter(p => p.id !== selectedPayroll.id))
      setIsDeleteModalOpen(false)
      setToast('Record deleted')
    } catch (e) { console.error(e) } finally { setIsSubmitting(false) }
  }

  const filteredPayrolls = payrolls.filter(p => {
    const matchesSearch = p.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.employee_code?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'All Status' || p.status === statusFilter

    let matchesDate = true
    if (filterStartDate) matchesDate = matchesDate && new Date(p.pay_period_start) >= new Date(filterStartDate)
    if (filterEndDate) matchesDate = matchesDate && new Date(p.pay_period_end) <= new Date(filterEndDate)
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const stats = {
    gross: filteredPayrolls.reduce((sum, p) => sum + parseFloat(p.gross_pay), 0),
    net: filteredPayrolls.reduce((sum, p) => sum + parseFloat(p.net_pay), 0),
    deductions: filteredPayrolls.reduce((sum, p) => sum + parseFloat(p.total_deductions), 0),
    count: filteredPayrolls.length
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50/30">
      <AnimatePresence>{toast && <SuccessToast message={toast} onClose={() => setToast(null)} />}</AnimatePresence>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">Office Payroll</h1>
          <p className="text-gray-500 mt-2">Manage salaries, government deductions, and pay slips.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => {/* Export Logic */}}><Download className="h-4 w-4 mr-2" /> Export</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20" onClick={() => { setSelectedPayroll(null); setIsProcessModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> New Payroll
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Total Gross Pay" amount={stats.gross} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-100" />
        <StatsCard title="Total Deductions" amount={stats.deductions} icon={TrendingDown} color="text-rose-600" bg="bg-rose-50" border="border-rose-100" />
        <StatsCard title="Total Net Pay" amount={stats.net} icon={Wallet} color="text-blue-600" bg="bg-blue-50" border="border-blue-100" />
        <StatsCard title="Employees Paid" value={stats.count} icon={Users} color="text-violet-600" bg="bg-violet-50" border="border-violet-100" isCurrency={false} />
      </div>

      {/* --- Controls Bar (Full width Search + Status Filter) --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4 z-20 relative">
        {/* Row 1: Search (Full Width) */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" placeholder="Search by name, code, or position..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-gray-200 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-base"
          />
        </div>

        {/* Row 2: Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-auto">
             <FilterDropdown 
                label="Status" 
                value={statusFilter} 
                options={['All Status', 'Pending', 'Processing', 'Released', 'Paid', 'On Hold']} 
                onChange={setStatusFilter} 
                icon={Filter} 
              />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
             <div className="w-40 relative z-30">
               <CustomDatePicker label="From" value={filterStartDate} onChange={setFilterStartDate} />
             </div>
             <div className="w-40 relative z-30">
               {/* Added align="right" here */}
               <CustomDatePicker label="To" value={filterEndDate} onChange={setFilterEndDate} align="right" />
             </div>
             {(filterStartDate || filterEndDate) && (
               <button onClick={() => { setFilterStartDate(''); setFilterEndDate('') }} className="p-2 text-gray-400 hover:text-red-500 mt-6 transition-colors rounded-full hover:bg-gray-100">
                 <X className="w-4 h-4" />
               </button>
             )}
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-xl shadow-gray-200/50 bg-white rounded-2xl z-10 relative">
        <CardContent className="p-0">
          <div className="w-full">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 font-semibold uppercase tracking-wider text-xs border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Pay Period</th>
                  <th className="px-6 py-4 text-right">Govt Deductions</th>
                  <th className="px-6 py-4 text-right">Net Pay</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPayrolls.length > 0 ? (
                  filteredPayrolls.map(item => (
                    <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">{item.employee_name.charAt(0)}</div>
                          <div><div className="font-bold text-gray-900">{item.employee_name}</div><div className="text-xs text-gray-500">{item.position}</div></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {new Date(item.pay_period_start).toLocaleDateString()} - {new Date(item.pay_period_end).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-red-600">
                        ₱{parseFloat(item.total_deductions).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <span className="font-bold text-blue-600 text-lg">₱{parseFloat(item.net_pay).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </td>
                      <td className="px-6 py-4 text-center relative">
                        <StatusCell id={item.id} currentStatus={item.status} onUpdate={handleStatusUpdate} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setSelectedPayroll(item); setIsViewModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => { setSelectedPayroll(item); setIsProcessModalOpen(true); }} className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => { setSelectedPayroll(item); setIsDeleteModalOpen(true); }} className="p-2 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="px-6 py-20 text-center text-gray-400"><div className="flex flex-col items-center"><div className="bg-gray-50 p-4 rounded-full mb-3"><FileText className="w-8 h-8 text-gray-300" /></div><p>No records found.</p></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ProcessPayrollModal isOpen={isProcessModalOpen} onClose={() => setIsProcessModalOpen(false)} onSubmit={handleProcessPayroll} employees={employees} isLoading={isSubmitting} initialData={selectedPayroll} />
      <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} isDeleting={isSubmitting} />
      <ViewPayrollModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} payroll={selectedPayroll} />
    </div>
  )
}

const StatsCard = ({ title, amount, value, icon: Icon, color, bg, border, isCurrency = true }) => (
  <div className={`bg-white rounded-xl p-6 shadow-sm border ${border} hover:-translate-y-1 transition-transform`}>
    <div className="flex justify-between items-start mb-4"><div className={`p-3 rounded-xl ${bg}`}><Icon className={`w-6 h-6 ${color}`} /></div></div>
    <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">{isCurrency ? `₱${amount?.toLocaleString(undefined, {minimumFractionDigits: 2})}` : value}</p>
  </div>
)

export default WorkersPayroll