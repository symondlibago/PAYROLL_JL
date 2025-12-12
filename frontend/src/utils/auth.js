// Authentication utility functions
import API_BASE_URL from "@/components/Config"

// Get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('auth_token')
}

// Get user data from localStorage
export const getUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken()
}

// Logout function with redirect to login page
export const logout = async () => {
  const token = getAuthToken()
  
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  // Clear local storage
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')
  
  // Redirect to login page by reloading the app
  // This will trigger the authentication check and show login page
  window.location.href = '/'
}

// API request with authentication
export const authenticatedRequest = async (url, options = {}) => {
  const token = getAuthToken()
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config)
    
    // If unauthorized, logout user
    if (response.status === 401) {
      logout()
      return
    }
    
    return response
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}

// Register function
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    
    const data = await response.json()
    
    if (data.success) {
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    
    return data
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

