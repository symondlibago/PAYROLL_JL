import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Loader2, Search, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { authenticatedRequest, deleteEmployee } from '../utils/auth';
import { AddEmployeeModal } from './EmployeeModals';
import { SearchableSelect } from './CustomInputs';

export default function Employee() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('All');
  const [filterClient, setFilterClient] = useState('All');
  const [filterDept, setFilterDept] = useState('All');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await authenticatedRequest('/employees');
      const data = await response.json();
      if (data.success) setEmployees(data.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const getOptions = (key) => {
    const uniqueValues = [...new Set(employees.map(emp => emp[key]).filter(Boolean))];
    return [{ label: `All ${key.replace('_', ' ')}s`, value: 'All' }, 
            ...uniqueValues.map(val => ({ label: val, value: val }))];
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = (emp.name?.toLowerCase().includes(searchTerm.toLowerCase())) || (emp.id_number?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesPos = filterPosition === 'All' || emp.position === filterPosition;
      const matchesCli = filterClient === 'All' || emp.client_name === filterClient;
      const matchesDep = filterDept === 'All' || emp.department_location === filterDept;
      return matchesSearch && matchesPos && matchesCli && matchesDep;
    });
  }, [employees, searchTerm, filterPosition, filterClient, filterDept]);

  const handleEdit = (employee) => { setSelectedEmployee(employee); setIsModalOpen(true); };
  const handleAddNew = () => { setSelectedEmployee(null); setIsModalOpen(true); };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this employee?")) {
      await deleteEmployee(id);
      fetchEmployees();
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Workforce</h1>
        <Button onClick={handleAddNew} className="bg-indigo-700 h-12 rounded-xl px-6"><Plus className="mr-2" /> Add Employee</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-xl text-sm" placeholder="Name or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5"><label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Position</label><SearchableSelect options={getOptions('position')} value={filterPosition} onChange={setFilterPosition} /></div>
        <div className="space-y-1.5"><label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Client</label><SearchableSelect options={getOptions('client_name')} value={filterClient} onChange={setFilterClient} /></div>
        <div className="space-y-1.5"><label className="text-[11px] font-bold text-gray-500 uppercase ml-1">Location</label><SearchableSelect options={getOptions('department_location')} value={filterDept} onChange={setFilterDept} /></div>
      </div>

      <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-indigo-700" /></div> : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-5 text-[11px] font-bold text-gray-500 uppercase">Employee ID</th>
                  <th className="p-5 text-[11px] font-bold text-gray-500 uppercase">Full Name</th>
                  <th className="p-5 text-[11px] font-bold text-gray-500 uppercase">Position</th>
                  <th className="p-5 text-[11px] font-bold text-gray-500 uppercase">Client</th>
                  <th className="p-5 text-[11px] font-bold text-gray-500 uppercase">Location</th>
                  <th className="p-5 text-[11px] font-bold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-indigo-50/30">
                    <td className="p-5 font-mono text-xs font-bold text-gray-600">{emp.id_number}</td>
                    <td className="p-5 font-bold text-gray-900">{emp.name}</td>
                    <td className="p-5 text-sm text-gray-600">{emp.position}</td>
                    <td className="p-5 text-sm text-gray-600">{emp.client_name}</td>
                    <td className="p-5 text-sm text-gray-600">{emp.department_location}</td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleEdit(emp)} variant="ghost" size="sm" className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg"><Edit2 className="h-4 w-4" /></Button>
                        <Button onClick={() => handleDelete(emp.id)} variant="ghost" size="sm" className="text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <AddEmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchEmployees} employeeData={selectedEmployee} />
    </div>
  );
}