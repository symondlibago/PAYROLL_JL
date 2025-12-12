import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Receipt, 
  Wrench, 
  ClipboardList, 
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Car
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import API_BASE_URL from './Config'

function Dashboard() {
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalExpenses: { value: 0, change: 0 },
    equipmentItems: { value: 0, change: 0 },
    activeTasks: { value: 0, change: 0 },
    monthlyPayroll: { value: 0, change: 0 }
  })
  
  const [recentActivities, setRecentActivities] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Helper function to check if a date is overdue or due soon
  const checkDateAlert = (dateString, alertDays = 30) => {
    if (!dateString) return { status: 'none', message: '', daysDiff: 0 }
    
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return {
        status: 'overdue',
        message: `Overdue by ${Math.abs(diffDays)} day(s)`,
        daysDiff: diffDays
      }
    } else if (diffDays <= alertDays) {
      return {
        status: 'due_soon',
        message: `Due in ${diffDays} day(s)`,
        daysDiff: diffDays
      }
    }
    
    return { status: 'none', message: '', daysDiff: diffDays }
  }

  // Fetch expenses data
  const fetchExpensesData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`)
      if (!response.ok) throw new Error('Failed to fetch expenses')
      
      const data = await response.json()
      if (data.success && data.data) {
        const expenses = data.data
        const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.total_price || 0), 0)
        
        // Calculate change (mock calculation - you might want to implement proper period comparison)
        const recentExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.date)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return expenseDate >= thirtyDaysAgo
        })
        const recentTotal = recentExpenses.reduce((sum, expense) => sum + parseFloat(expense.total_price || 0), 0)
        const previousTotal = totalExpenses - recentTotal
        const change = previousTotal > 0 ? ((recentTotal - previousTotal) / previousTotal * 100) : 0
        
        return {
          value: totalExpenses,
          change: change,
          recentExpenses: expenses.slice(0, 3) // Get 3 most recent for activities
        }
      }
      return { value: 0, change: 0, recentExpenses: [] }
    } catch (error) {
      console.error('Error fetching expenses:', error)
      return { value: 0, change: 0, recentExpenses: [] }
    }
  }, [])

  // Fetch equipment data
  const fetchEquipmentData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/equipment`)
      if (!response.ok) throw new Error('Failed to fetch equipment')
      
      const data = await response.json()
      if (data.success && data.data) {
        const equipment = data.data
        const totalEquipment = equipment.length
        
        // Calculate borrowed equipment for alerts
        const borrowedEquipment = equipment.filter(item => item.item_status === 'Borrowed')
        const maintenanceEquipment = equipment.filter(item => item.item_status === 'Maintenance')
        
        return {
          value: totalEquipment,
          change: 0, // You can implement proper change calculation
          borrowedCount: borrowedEquipment.length,
          maintenanceCount: maintenanceEquipment.length,
          recentBorrowed: borrowedEquipment.slice(0, 2)
        }
      }
      return { value: 0, change: 0, borrowedCount: 0, maintenanceCount: 0, recentBorrowed: [] }
    } catch (error) {
      console.error('Error fetching equipment:', error)
      return { value: 0, change: 0, borrowedCount: 0, maintenanceCount: 0, recentBorrowed: [] }
    }
  }, [])

  // Fetch tasks data
  const fetchTasksData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`)
      if (!response.ok) throw new Error('Failed to fetch tasks')
      
      const data = await response.json()
      if (data.success && data.data) {
        const tasks = data.data
        const activeTasks = tasks.filter(task => task.status !== 'Completed').length
        const completedTasks = tasks.filter(task => task.status === 'Completed')
        
        return {
          value: activeTasks,
          change: 0, // You can implement proper change calculation
          recentCompleted: completedTasks.slice(0, 2),
          totalTasks: tasks.length
        }
      }
      return { value: 0, change: 0, recentCompleted: [], totalTasks: 0 }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      return { value: 0, change: 0, recentCompleted: [], totalTasks: 0 }
    }
  }, [])

  // Fetch payroll data
  const fetchPayrollData = useCallback(async () => {
    try {
      // Fetch both site and office payrolls
      const [siteResponse, officeResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/payrolls/site`),
        fetch(`${API_BASE_URL}/payrolls/office`)
      ])
      
      let totalPayroll = 0
      let recentPayrolls = []
      
      if (siteResponse.ok) {
        const siteData = await siteResponse.json()
        if (siteData.success && siteData.data) {
          const siteTotal = siteData.data.reduce((sum, payroll) => sum + parseFloat(payroll.net_pay || 0), 0)
          totalPayroll += siteTotal
          recentPayrolls = [...recentPayrolls, ...siteData.data.slice(0, 2)]
        }
      }
      
      if (officeResponse.ok) {
        const officeData = await officeResponse.json()
        if (officeData.success && officeData.data) {
          const officeTotal = officeData.data.reduce((sum, payroll) => sum + parseFloat(payroll.net_pay || 0), 0)
          totalPayroll += officeTotal
          recentPayrolls = [...recentPayrolls, ...officeData.data.slice(0, 2)]
        }
      }
      
      return {
        value: totalPayroll,
        change: 0, // You can implement proper change calculation
        recentPayrolls: recentPayrolls.slice(0, 2)
      }
    } catch (error) {
      console.error('Error fetching payroll:', error)
      return { value: 0, change: 0, recentPayrolls: [] }
    }
  }, [])

  // Fetch vehicle data for alerts
  const fetchVehicleData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles`)
      if (!response.ok) throw new Error('Failed to fetch vehicles')
      
      const data = await response.json()
      if (data.success && data.data) {
        const vehicles = data.data
        
        let overdueVehicles = []
        let dueSoonVehicles = []
        
        vehicles.forEach(vehicle => {
          const ltoAlert = checkDateAlert(vehicle.lto_renewal_date, 30)
          const maintenanceAlert = checkDateAlert(vehicle.maintenance_date, 30)
          
          // Check for overdue items
          if (ltoAlert.status === 'overdue') {
            overdueVehicles.push({
              vehicle: vehicle.vehicle_name,
              type: 'LTO Renewal',
              message: `${vehicle.vehicle_name} LTO renewal ${ltoAlert.message.toLowerCase()}`
            })
          }
          
          if (maintenanceAlert.status === 'overdue') {
            overdueVehicles.push({
              vehicle: vehicle.vehicle_name,
              type: 'Maintenance',
              message: `${vehicle.vehicle_name} maintenance ${maintenanceAlert.message.toLowerCase()}`
            })
          }
          
          // Check for due soon items
          if (ltoAlert.status === 'due_soon') {
            dueSoonVehicles.push({
              vehicle: vehicle.vehicle_name,
              type: 'LTO Renewal',
              message: `${vehicle.vehicle_name} LTO renewal ${ltoAlert.message.toLowerCase()}`
            })
          }
          
          if (maintenanceAlert.status === 'due_soon') {
            dueSoonVehicles.push({
              vehicle: vehicle.vehicle_name,
              type: 'Maintenance',
              message: `${vehicle.vehicle_name} maintenance ${maintenanceAlert.message.toLowerCase()}`
            })
          }
        })
        
        return {
          totalVehicles: vehicles.length,
          overdueCount: overdueVehicles.length,
          dueSoonCount: dueSoonVehicles.length,
          overdueVehicles,
          dueSoonVehicles
        }
      }
      return { totalVehicles: 0, overdueCount: 0, dueSoonCount: 0, overdueVehicles: [], dueSoonVehicles: [] }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      return { totalVehicles: 0, overdueCount: 0, dueSoonCount: 0, overdueVehicles: [], dueSoonVehicles: [] }
    }
  }, [])

  // Main data fetching function
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [expensesData, equipmentData, tasksData, payrollData, vehicleData] = await Promise.all([
        fetchExpensesData(),
        fetchEquipmentData(),
        fetchTasksData(),
        fetchPayrollData(),
        fetchVehicleData()
      ])
      
      // Update dashboard stats
      setDashboardData({
        totalExpenses: {
          value: expensesData.value,
          change: expensesData.change
        },
        equipmentItems: {
          value: equipmentData.value,
          change: equipmentData.change
        },
        activeTasks: {
          value: tasksData.value,
          change: tasksData.change
        },
        monthlyPayroll: {
          value: payrollData.value,
          change: payrollData.change
        }
      })
      
      // Build recent activities
      const activities = []
      
      // Add recent expenses
      expensesData.recentExpenses.forEach(expense => {
        activities.push({
          type: 'expense',
          message: `New expense added: ${expense.description}`,
          amount: `₱${parseFloat(expense.total_price || 0).toFixed(2)}`,
          time: formatTimeAgo(expense.date),
          icon: Receipt,
          color: 'text-[var(--color-primary)]'
        })
      })
      
      // Add recent borrowed equipment
      equipmentData.recentBorrowed.forEach(equipment => {
        activities.push({
          type: 'equipment',
          message: `${equipment.borrowed_by || 'Someone'} borrowed ${equipment.equipment_name}`,
          time: formatTimeAgo(equipment.date_borrowed),
          icon: Wrench,
          color: 'text-[var(--color-primary)]'
        })
      })
      
      // Add recent completed tasks
      tasksData.recentCompleted.forEach(task => {
        activities.push({
          type: 'task',
          message: `${task.name} task completed`,
          time: formatTimeAgo(task.updated_at),
          icon: CheckCircle,
          color: 'text-[var(--color-primary)]'
        })
      })
      
      // Add recent payrolls
      payrollData.recentPayrolls.forEach(payroll => {
        activities.push({
          type: 'payroll',
          message: `Payroll processed for ${payroll.employee_name}`,
          amount: `₱${parseFloat(payroll.net_pay || 0).toFixed(2)}`,
          time: formatTimeAgo(payroll.created_at),
          icon: DollarSign,
          color: 'text-[var(--color-primary)]'
        })
      })
      
      // Sort activities by time and take the most recent ones
      setRecentActivities(activities.slice(0, 4))
      
      // Build alerts including vehicle alerts
      const newAlerts = []
      
      // Equipment alerts
      if (equipmentData.maintenanceCount > 0) {
        newAlerts.push({
          type: 'warning',
          message: `${equipmentData.maintenanceCount} equipment item(s) need maintenance`,
          icon: AlertTriangle,
          color: 'text-[var(--color-primary)]'
        })
      }
      
      if (equipmentData.borrowedCount > 0) {
        newAlerts.push({
          type: 'info',
          message: `${equipmentData.borrowedCount} tool(s) are currently borrowed`,
          icon: Wrench,
          color: 'text-[var(--color-primary)]'
        })
      }
      
      // Task alerts
      if (tasksData.value === 0 && tasksData.totalTasks > 0) {
        newAlerts.push({
          type: 'success',
          message: 'All tasks completed!',
          icon: CheckCircle,
          color: 'text-[var(--color-primary)]'
        })
      } else if (tasksData.value > 10) {
        newAlerts.push({
          type: 'warning',
          message: `${tasksData.value} active tasks - consider prioritizing`,
          icon: ClipboardList,
          color: 'text-[var(--color-primary)]'
        })
      }
      
      // Vehicle alerts - overdue items (critical)
      if (vehicleData.overdueCount > 0) {
        vehicleData.overdueVehicles.forEach(item => {
          newAlerts.push({
            type: 'critical',
            message: item.message,
            icon: Car,
            color: 'text-red-600'
          })
        })
      }
      
      // Vehicle alerts - due soon items (warning)
      if (vehicleData.dueSoonCount > 0) {
        vehicleData.dueSoonVehicles.forEach(item => {
          newAlerts.push({
            type: 'warning',
            message: item.message,
            icon: Car,
            color: 'text-yellow-600'
          })
        })
      }
      
      setAlerts(newAlerts)
      setLastUpdated(new Date())
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [fetchExpensesData, fetchEquipmentData, fetchTasksData, fetchPayrollData, fetchVehicleData])

  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minute(s) ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour(s) ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day(s) ago`
  }

  // Format currency
  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Format change percentage
  const formatChange = (change) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [fetchDashboardData])

  // Stats cards configuration
  const statsCards = [
    {
      title: 'Total Expenses',
      value: formatCurrency(dashboardData.totalExpenses.value),
      change: formatChange(dashboardData.totalExpenses.change),
      icon: Receipt,
      color: 'from-[var(--color-primary)] to-[var(--color-secondary)]',
      bgColor: 'bg-[var(--color-card)]',
      borderColor: 'border-[var(--color-border)]'
    },
    {
      title: 'Equipment Items',
      value: dashboardData.equipmentItems.value.toString(),
      change: formatChange(dashboardData.equipmentItems.change),
      icon: Wrench,
      color: 'from-[var(--color-primary)] to-[var(--color-secondary)]',
      bgColor: 'bg-[var(--color-card)]',
      borderColor: 'border-[var(--color-border)]'
    },
    {
      title: 'Active Tasks',
      value: dashboardData.activeTasks.value.toString(),
      change: formatChange(dashboardData.activeTasks.change),
      icon: ClipboardList,
      color: 'from-[var(--color-primary)] to-[var(--color-secondary)]',
      bgColor: 'bg-[var(--color-card)]',
      borderColor: 'border-[var(--color-border)]'
    },
    {
      title: 'Monthly Payroll',
      value: formatCurrency(dashboardData.monthlyPayroll.value),
      change: formatChange(dashboardData.monthlyPayroll.change),
      icon: DollarSign,
      color: 'from-[var(--color-primary)] to-[var(--color-secondary)]',
      bgColor: 'bg-[var(--color-card)]',
      borderColor: 'border-[var(--color-border)]'
    }
  ]

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-[var(--color-foreground)]/70 mt-2">Monitor all your systems in one place</p>
          {lastUpdated && (
            <p className="text-xs text-[var(--color-foreground)]/50 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button
          onClick={fetchDashboardData}
          disabled={loading}
          variant="outline"
          className="border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group"
            >
              <Card className={`${stat.bgColor} ${stat.borderColor} border-2 hover:border-[var(--color-primary)] transition-all duration-300 shadow-md hover:shadow-lg`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[var(--color-foreground)]/70">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[var(--color-foreground)]">
                    {loading ? (
                      <div className="flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Loading...
                      </div>
                    ) : (
                      stat.value
                    )}
                  </div>
                  <p className={`text-xs ${
                    parseFloat(stat.change) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  } mt-1`}>
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="bg-[var(--color-card)] border border-[var(--color-border)] shadow-md">
            <CardHeader>
              <CardTitle className="text-[var(--color-foreground)] flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--color-primary)]" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
                </div>
              ) : recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => {
                    const Icon = activity.icon
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <Icon className={`h-4 w-4 ${activity.color}`} />
                        <div className="flex-1">
                          <p className="text-sm text-[var(--color-foreground)]">
                            {activity.message}
                          </p>
                          <p className="text-xs text-[var(--color-foreground)]/60">
                            {activity.time}
                          </p>
                        </div>
                        {activity.amount && (
                          <div className="text-sm font-semibold text-[var(--color-primary)]">
                            {activity.amount}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--color-foreground)]/60">
                  No recent activities
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* System Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-[var(--color-card)] border border-[var(--color-border)] shadow-md">
            <CardHeader>
              <CardTitle className="text-[var(--color-foreground)] flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[var(--color-primary)]" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
                </div>
              ) : alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert, index) => {
                    const Icon = alert.icon
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <Icon className={`h-4 w-4 ${alert.color}`} />
                        <p className="text-sm text-[var(--color-foreground)] flex-1">
                          {alert.message}
                        </p>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-[var(--color-foreground)]/60">
                    All systems running smoothly
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard

