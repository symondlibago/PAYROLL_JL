import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, DollarSign, User, MapPin, CreditCard, Phone, Building2, Hash, Users } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { CustomDatePicker, SearchableSelect } from './CustomInputs'; 
import { createEmployee } from '../utils/auth'; 

const SectionHeader = ({ title, icon: Icon }) => (
  <div className="col-span-full flex items-center gap-2 pt-6 pb-2 border-b border-gray-200 mb-4">
    <Icon className="h-4 w-4 text-indigo-700" />
    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">{title}</h3>
  </div>
);

const FormField = ({ label, children }) => (
  <div className="space-y-1.5">
    {/* Darkened label for better visibility */}
    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-widest ml-1">
      {label}
    </label>
    {children}
  </div>
);

export const AddEmployeeModal = ({ isOpen, onClose, onRefresh }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialForm = {
    id_number: '',
    name: '', 
    status: 'Office', // Set default as Office as requested
    position: '', 
    group: '', 
    birthday: null, 
    age: '', 
    phone_number: '', 
    address: '',
    date_started: null, 
    year_started: new Date().getFullYear(),
    rate: '', 
    hourly_rate: 0, 
    sss: '', 
    philhealth: '', 
    pagibig: '', 
    tin: '', 
    client_name: '', 
    department_location: '', 
    bank_account_number: '', 
    bank_type: 'AUB' 
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (isOpen) setFormData(initialForm);
  }, [isOpen]);

  useEffect(() => {
    const daily = parseFloat(formData.rate) || 0;
    setFormData(prev => ({ ...prev, hourly_rate: (daily / 8).toFixed(2) }));
  }, [formData.rate]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await createEmployee(formData);
      if (response.ok) {
        if (onRefresh) onRefresh();
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to save employee'}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("A network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b flex justify-between items-center bg-[#0e1048] sticky top-0 z-10 ">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight ">Add New Employee</h2>
              <p className="text-sm text-white font-medium">Please fill out the details below.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-white hover:text-gray-900 cursor-pointer">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              
              {/* Personal Details Section - Employment Core removed as requested */}
              <SectionHeader title="Personal Details" icon={User} />
              
              <FormField label="ID Number">
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <input 
                    type="text" value={formData.id_number} onChange={e => setFormData({...formData, id_number: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-gray-900 font-medium"
                    placeholder="EMP-001"
                  />
                </div>
              </FormField>

              <FormField label="Full Name">
                <input 
                  type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-gray-900 font-medium"
                  placeholder="Juan Dela Cruz"
                />
              </FormField>

              <FormField label="Work Status">
                <SearchableSelect 
                  options={[{label: 'Office Based', value: 'Office'}, {label: 'Site Based', value: 'Site'}]}
                  value={formData.status}
                  onChange={v => setFormData({...formData, status: v})}
                />
              </FormField>

              <FormField label="Position">
                <input 
                  type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-gray-900 font-medium"
                  placeholder="Software Engineer"
                />
              </FormField>

              <FormField label="Group / Team">
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <input 
                    type="text" value={formData.group} onChange={e => setFormData({...formData, group: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-gray-900 font-medium"
                    placeholder="Team Alpha"
                  />
                </div>
              </FormField>

              <FormField label="Birthday">
                <CustomDatePicker value={formData.birthday} onChange={v => setFormData({...formData, birthday: v})} />
              </FormField>

              <FormField label="Age">
                <input 
                  type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-gray-900 font-medium"
                />
              </FormField>

              <FormField label="Phone Number">
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <input 
                    type="text" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-gray-900 font-medium"
                    placeholder="09XXXXXXXXX"
                  />
                </div>
              </FormField>

              <FormField label="Date Started">
                <CustomDatePicker value={formData.date_started} onChange={v => setFormData({...formData, date_started: v})} />
              </FormField>

              <div className="col-span-full">
                <FormField label="Residential Residence">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                    <textarea 
                      value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-gray-900 font-medium min-h-[60px]"
                      placeholder="Street, City, Province..."
                    />
                  </div>
                </FormField>
              </div>

              {/* Project Assignment Section */}
              <SectionHeader title="Project Assignment" icon={Building2} />

              <FormField label="Client Name">
                <input 
                  type="text" value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm text-gray-900 font-medium"
                />
              </FormField>

              <FormField label="Department / Location">
                <input 
                  type="text" value={formData.department_location} onChange={e => setFormData({...formData, department_location: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm text-gray-900 font-medium"
                />
              </FormField>

              {/* Payroll Section */}
              <SectionHeader title="Payroll & Government" icon={DollarSign} />

              <FormField label="Daily Rate (₱)">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 text-sm font-bold">₱</span>
                  <input 
                    type="number" value={formData.rate} onChange={e => setFormData({...formData, rate: e.target.value})}
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-bold text-gray-900"
                    placeholder="0.00"
                  />
                </div>
              </FormField>

              <FormField label="SSS No."><input type="text" value={formData.sss} onChange={e => setFormData({...formData, sss: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-400 rounded-xl text-sm text-gray-900 font-medium" /></FormField>
              <FormField label="PhilHealth"><input type="text" value={formData.philhealth} onChange={e => setFormData({...formData, philhealth: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-400 rounded-xl text-sm text-gray-900 font-medium" /></FormField>
              <FormField label="Pag-IBIG"><input type="text" value={formData.pagibig} onChange={e => setFormData({...formData, pagibig: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-400 rounded-xl text-sm text-gray-900 font-medium" /></FormField>
              <FormField label="TIN"><input type="text" value={formData.tin} onChange={e => setFormData({...formData, tin: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-400 rounded-xl text-sm text-gray-900 font-medium" /></FormField>

              {/* Banking Section */}
              <SectionHeader title="Banking Details" icon={CreditCard} />

              <FormField label="Bank Type">
                {/* Now using SearchableSelect for consistent UI with Work Status */}
                <SearchableSelect 
                  options={[{label: 'AUB', value: 'AUB'}, {label: 'EAST WEST', value: 'EAST WEST'}]}
                  value={formData.bank_type}
                  onChange={v => setFormData({...formData, bank_type: v})}
                />
              </FormField>

              <FormField label="Bank Account Number">
                <input 
                  type="text" value={formData.bank_account_number} onChange={e => setFormData({...formData, bank_account_number: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-400 rounded-xl text-sm text-gray-900 font-medium"
                  placeholder="0000-0000-0000"
                />
              </FormField>

            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t bg-gray-50 flex gap-4 sticky bottom-0">
            <Button variant="outline" className="flex-1 rounded-xl py-6 border-red-700 font-bold uppercase tracking-wider text-red-700 hover:bg-red-700 hover:text-white cursor-pointer" onClick={onClose}>
              Discard
            </Button>
            <Button 
              className="flex-1 rounded-xl py-6 bg-[#0e1048] hover:bg-[#0e1048] shadow-lg shadow-indigo-100 font-bold uppercase tracking-wider text-white cursor-pointer" 
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.name || !formData.rate}
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : 'Save Employee Profile'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};