import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, User, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import logo from '../assets/ba-logo.jpg';
import API_BASE_URL from './Config'

// Import benoya images directly
import benoya1 from '../assets/benoya1.jpg';
import benoya2 from '../assets/benoya2.jpg';
import benoya3 from '../assets/benoya3.jpg';
import benoya4 from '../assets/benoya4.jpg';
import benoya5 from '../assets/benoya5.jpg';
import benoya6 from '../assets/benoya6.jpg';
import benoya7 from '../assets/benoya7.jpg';
import benoya8 from '../assets/benoya8.jpg';
import benoya9 from '../assets/benoya9.jpg';
import benoya10 from '../assets/benoya10.jpg';

// API configuration

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)

  // Array of imported images
  const benoyaImages = [benoya1, benoya2, benoya3, benoya4, benoya5, benoya6, benoya7, benoya8, benoya9, benoya10];

  // Background slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 10)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Store the token in localStorage
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Call the onLogin callback
        onLogin(data.user)
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error. Please check if the backend server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      {/* Left Section - Image Carousel */}
      <div className="left-section">
  {benoyaImages.map((image, index) => (
    <div
      key={index}
      className={`left-section-image-slide ${currentSlide === index ? 'active' : ''}`}
      style={{ backgroundImage: `url(${image})` }}
    />
  ))}
        
        {/* Floating Elements for the left section */}
        <div className="floating-element w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-full"></div>
        <div className="floating-element w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-full"></div>
        <div className="floating-element w-24 h-24 bg-gradient-to-br from-white/20 to-white/10 rounded-full"></div>
        <div className="floating-element w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-full"></div>
      </div>

      {/* Right Section - Login Card */}
      <div className="right-section">
        {/* Background Animation for right section */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-10 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-[var(--color-secondary)]/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-[var(--color-accent)]/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
          </div>
        </div>

        <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
  className="relative z-10 w-full max-w-md mx-auto px-0 border border-transparent rounded-lg bg-transparent"
>

          <div className="snake-border-card">
            {/* Snake line elements for animated border */}
            <div className="snake-line"></div>
            <div className="snake-line"></div>
            <div className="snake-line"></div>
            <div className="snake-line"></div>
            <div className="snake-line"></div>
            <div className="snake-line"></div>
            <div className="snake-line"></div>
            <div className="snake-line"></div>
            
            {/* Motion Lines inside the card */}
            <div className="motion-lines">
              <div className="motion-line"></div>
              <div className="motion-line"></div>
              <div className="motion-line"></div>
              <div className="motion-line"></div>
              <div className="motion-line"></div>
              <div className="motion-line"></div>
            </div>
            
            <div className="enhanced-card-content p-8">
              {/* Logo Section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-center mb-8"
              >
                <div className="mb-6">
                  <img src={logo} alt="BA Logo"
                    className="w-32 h-32 mx-auto rounded-full shadow-lg border-4 border-[var(--color-border)] enhanced-logo"
                  />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent mb-2">
                  Monitoring Systems
                </h1>
                <p className="text-[var(--color-foreground)]/70 text-sm">
                  Welcome to Benoya Archistruction Monitoring 
                </p>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
                >
                  <p className="text-red-600 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Login Form */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                onSubmit={handleLogin}
                className="space-y-6"
              >
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-foreground)]">
                    Email
                  </label>
                  <div className="relative">
                  <User 
      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10 text-[#0e1048]"
    />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="enhanced-input pl-10 text-[var(--color-foreground)] placeholder-[var(--color-foreground)]/50 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20"
                      required
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-foreground)]">
                    Password
                  </label>
                  <div className="relative">
                    <Lock 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10 text-[#0e1048]"
                    />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="enhanced-input pl-10 pr-10 text-[var(--color-foreground)] placeholder-[var(--color-foreground)]/50 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20"
                      required
                      style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors z-10 hover:scale-110 text-[#0e1048]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-sm text-[var(--color-foreground)]/70">
                    <input
                      type="checkbox"
                      className="rounded border-[var(--color-border)] bg-white text-[var(--color-primary)] focus:ring-[var(--color-primary)]/20"
                    />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors">
                    Forgot password?
                  </a>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="enhanced-button w-full text-white font-medium py-3 transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </motion.form>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-8 text-center"
              >
                <p className="text-xs text-[var(--color-foreground)]/50">
                  © 2025 BA Monitoring Systems. All rights reserved.
                </p>
                <div className="flex justify-center space-x-1 mt-2">
                  <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-[var(--color-secondary)] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage

