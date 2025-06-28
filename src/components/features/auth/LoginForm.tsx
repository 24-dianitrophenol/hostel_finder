import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../ui/Button';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && profile && !authLoading) {
      // Redirect based on user role and current path
      if (location.pathname.includes('/hostel-owner')) {
        if (profile.role === 'owner') {
          navigate('/hostel-owner', { replace: true });
        } else {
          setError('Access denied. Owner account required.');
        }
      } else if (location.pathname.includes('/hostel-broker')) {
        if (profile.role === 'admin') {
          navigate('/hostel-broker', { replace: true });
        } else {
          setError('Access denied. Broker account required.');
        }
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, profile, authLoading, navigate, location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
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
          <User className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-display font-bold">
          {location.pathname.includes('/hostel-owner') ? 'Owner Login' : 
           location.pathname.includes('/hostel-broker') ? 'Broker Login' : 'Login'}
        </h2>
        <p className="text-gray-600 mt-2">
          {location.pathname.includes('/hostel-owner')
            ? 'Sign in to your hostel owner account'
            : location.pathname.includes('/hostel-broker')
            ? 'Sign in to your broker account'
            : 'Sign in to your account'}
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium">
              Password
            </label>
            {!location.pathname.includes('/hostel-owner') && !location.pathname.includes('/hostel-broker') && (
              <a href="#" className="text-sm text-primary-900 hover:text-primary-700">
                Forgot password?
              </a>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </div>
        
        <Button
          variant="primary"
          fullWidth
          size="lg"
          icon={isLoading ? <Loader className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
          iconPosition="right"
          disabled={isLoading}
          className="mb-4"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
        
        {location.pathname.includes('/hostel-owner') ? (
          <p className="text-center text-gray-600 mt-6">
            Don't have an owner account?{' '}
            <Link to="/hostel-owner/signup" className="text-primary-900 hover:underline font-medium">
              Sign up as owner
            </Link>
          </p>
        ) : location.pathname.includes('/hostel-broker') ? (
          <p className="text-center text-gray-600 mt-6">
            Contact admin for broker account access
          </p>
        ) : (
          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-900 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        )}
      </form>
    </motion.div>
  );
};

export default LoginForm;