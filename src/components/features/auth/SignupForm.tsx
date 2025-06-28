import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, School, ArrowRight, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../ui/Button';
import { universities } from '../../../data/mockData';

const SignupForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    university: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'owner' | 'admin'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, isAuthenticated, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && profile && !authLoading) {
      if (profile.role === 'owner') {
        navigate('/hostel-owner', { replace: true });
      } else if (profile.role === 'admin') {
        navigate('/hostel-broker', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, profile, authLoading, navigate]);

  // Set role based on the current route
  useEffect(() => {
    if (location.pathname === '/hostel-owner/signup') {
      setFormData(prev => ({ ...prev, role: 'owner' }));
    }
  }, [location]);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field if exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (formData.role === 'user' && !formData.university) newErrors.university = 'University is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    setIsLoading(true);
    try {
      await register(
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          university: formData.university,
          role: formData.role
        }, 
        formData.password
      );
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to create account' });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary-900" />
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 bg-primary-50 text-primary-900 rounded-full mb-4">
          <UserPlus className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-display font-bold">
          {location.pathname === '/hostel-owner/signup' ? 'Create Owner Account' : 'Create Account'}
        </h2>
        <p className="text-gray-600 mt-2">
          {location.pathname === '/hostel-owner/signup' 
            ? 'Join HostelConnect as a hostel owner' 
            : 'Join HostelConnect to find your perfect accommodation'}
        </p>
      </div>
      
      {errors.submit && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
          {errors.submit}
        </div>
      )}
      
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 bg-primary-900 text-white rounded-full">
            1
          </div>
          <div className="ml-2 text-sm font-medium">
            Personal Info
          </div>
        </div>
        <div className="w-16 h-1 bg-gray-200">
          <div className={`h-full ${step > 1 ? 'bg-primary-900' : 'bg-gray-200'}`}></div>
        </div>
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 ${step > 1 ? 'bg-primary-900 text-white' : 'bg-gray-200 text-gray-500'} rounded-full`}>
            2
          </div>
          <div className={`ml-2 text-sm font-medium ${step > 1 ? 'text-gray-900' : 'text-gray-400'}`}>
            Security
          </div>
        </div>
      </div>
      
      <form onSubmit={step === 1 ? handleNextStep : handleSubmit}>
        {step === 1 && (
          <>
            {/* Step 1: Personal Information */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  disabled={isLoading}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  disabled={isLoading}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="phone" className="block text-gray-700 text-sm font-medium mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                  placeholder="Your phone number"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  disabled={isLoading}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
            
            {location.pathname !== '/hostel-owner/signup' && (
              <div className="mb-4">
                <label htmlFor="role" className="block text-gray-700 text-sm font-medium mb-2">
                  I am a
                </label>
                <select
                  id="role"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                  value={formData.role}
                  onChange={(e) => updateFormData('role', e.target.value as 'user' | 'owner' | 'admin')}
                  disabled={isLoading}
                >
                  <option value="user">Student</option>
                  <option value="owner">Hostel Owner</option>
                </select>
              </div>
            )}
            
            {formData.role === 'user' && (
              <div className="mb-6">
                <label htmlFor="university" className="block text-gray-700 text-sm font-medium mb-2">
                  University
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <School className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="university"
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                    value={formData.university}
                    onChange={(e) => updateFormData('university', e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Select your university</option>
                    {universities.map((uni) => (
                      <option key={uni.id} value={uni.name}>
                        {uni.name}
                      </option>
                    ))}
                  </select>
                  {errors.university && <p className="text-red-500 text-xs mt-1">{errors.university}</p>}
                </div>
              </div>
            )}
            
            <Button
              variant="primary"
              fullWidth
              size="lg"
              icon={<ArrowRight className="h-5 w-5" />}
              iconPosition="right"
              disabled={isLoading}
            >
              Continue
            </Button>
          </>
        )}
        
        {step === 2 && (
          <>
            {/* Step 2: Security Information */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  disabled={isLoading}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  disabled={isLoading}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                fullWidth
                size="lg"
                onClick={handlePrevStep}
                disabled={isLoading}
              >
                Back
              </Button>
              
              <Button
                variant="primary"
                fullWidth
                size="lg"
                icon={isLoading ? <Loader className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                iconPosition="right"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </div>
          </>
        )}
        
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link 
            to={location.pathname === '/hostel-owner/signup' ? '/hostel-owner/login' : '/login'} 
            className="text-primary-900 hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </form>
    </motion.div>
  );
};

export default SignupForm;