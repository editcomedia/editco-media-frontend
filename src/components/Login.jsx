import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import BlurText from './BlurText';
import { apiFetch } from '../config/api';
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleRedirectUri =
    import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
    (typeof window !== 'undefined' ? window.location.origin : undefined);
  const googleEnabled = Boolean(googleClientId);

  // Admin credentials (same as before)
  const ADMIN_CREDENTIALS = {
    username: "superadmin@editcomedia.com",
    password: "editcomedia@DHT"
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.usernameOrEmail) {
      newErrors.usernameOrEmail = 'Username or email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First, check if it's admin credentials
      if (formData.usernameOrEmail === ADMIN_CREDENTIALS.username && 
          formData.password === ADMIN_CREDENTIALS.password) {
        // Admin login
        const response = await apiFetch('/api/admin/login', {
          method: 'POST',
          body: JSON.stringify({
            username: formData.usernameOrEmail,
            password: formData.password
          })
        });

        // Check if response is ok before parsing JSON
        if (!response.ok) {
          let errorMessage = 'Admin login failed. Please try again.';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            errorMessage = response.statusText || errorMessage;
          }
          toast.error(errorMessage);
          return;
        }

        const data = await response.json();

        if (data.success) {
          localStorage.setItem('adminLoggedIn', 'true');
          localStorage.setItem('adminSession', JSON.stringify({ 
            loggedIn: true, 
            timestamp: Date.now() 
          }));
          toast.success('Welcome, Admin!');
          navigate('/admin');
          return;
        }
      }

      // If not admin, try user login
      const response = await apiFetch('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({
          usernameOrEmail: formData.usernameOrEmail,
          password: formData.password
        })
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        let errorMessage = 'Login failed. Please check your credentials.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        toast.error(errorMessage);
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Store user session in localStorage
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userSession', JSON.stringify({ 
          loggedIn: true, 
          user: data.user,
          timestamp: Date.now() 
        }));
        
        toast.success(`Welcome back, ${data.user.firstName}!`);
        navigate('/dashboard');
      } else {
        toast.error(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Provide more specific error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Unable to connect to server. Please ensure the backend server is running.');
      } else if (error.message && error.message.includes('VITE_API_URL')) {
        toast.error('API configuration error. Please check your environment variables.');
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuthentication = async (accessToken) => {
    try {
      const response = await apiFetch('/api/users/google-login', {
        method: 'POST',
        body: JSON.stringify({ accessToken })
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        let errorMessage = 'Google sign-in failed. Please try again.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        toast.error(errorMessage);
        return false;
      }

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userSession', JSON.stringify({
          loggedIn: true,
          user: data.user,
          timestamp: Date.now()
        }));
        toast.success(`Welcome back, ${data.user.firstName}!`);
        navigate('/dashboard');
        return true;
      }

      toast.error(data.error || 'Google sign-in failed');
      return false;
    } catch (error) {
      console.error('Google sign-in error:', error);
      // Provide more specific error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Unable to connect to server. Please ensure the backend server is running.');
      } else if (error.message && error.message.includes('VITE_API_URL')) {
        toast.error('API configuration error. Please check your environment variables.');
      } else {
        toast.error('Google sign-in failed. Please try again.');
      }
      return false;
    }
  };

  const createInputField = (fieldName, label, type, placeholder) => {
    const hasError = errors[fieldName];
    
    return (
      <div>
        <label htmlFor={fieldName} className="block text-[14px] md:text-[16px] font-medium text-white/90 mb-2">
          {label}
        </label>
        <input
          type={type}
          id={fieldName}
          name={fieldName}
          value={formData[fieldName]}
          onChange={handleChange}
          className={`w-full px-4 py-3 bg-black/20 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#ffd600]/50 focus:border-transparent transition-all duration-200 text-[14px] md:text-[16px] ${
            hasError ? 'border-red-500' : 'border-white/20'
          }`}
          placeholder={placeholder}
        />
        {hasError && (
          <p className="mt-1 text-[12px] md:text-[14px] text-red-400">{hasError}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0b0b0c]">
      <Navbar />
      
      <div className="pt-28 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left side: Animated heading */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 lg:h-fit">
            <BlurText
              text="WELCOME BACK"
              className="text-[56px] md:text-[96px] leading-[0.9] tracking-tight font-extrabold text-[#d5d20d] mb-8"
              animateBy="words"
              direction="top"
              delay={150}
              stepDuration={0.4}
            />
            <div className="space-y-4">
              <p className="text-white/70 text-[16px] md:text-[18px] leading-relaxed">
                Sign in to access your account and manage your projects with Editco.Media.
              </p>
              <p className="text-white/60 text-[14px] md:text-[16px]">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#ffd600] hover:text-[#fff9be] transition-colors duration-200 font-medium">
                  Create one here
                </Link>
              </p>
            </div>
          </div>

          {/* Right side: Login form */}
          <div className="lg:col-span-7 pb-16">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-[24px] md:text-[28px] font-medium text-white mb-2">
                    <span className="text-[#AAA80F]">Sign</span> <span className="text-[#63676A]">In</span>
                  </h2>
                  <p className="text-white/70 text-[14px] md:text-[16px]">
                    Access your account dashboard
                  </p>
                </div>

                {createInputField('usernameOrEmail', 'Username or Email', 'text', 'Enter your username or email')}
                {createInputField('password', 'Password', 'password', 'Enter your password')}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full px-6 py-3 text-[16px] md:text-[18px] text-white border border-white/30 rounded-xl overflow-hidden group hover:text-black transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-[#ffd600] to-[#fff9be] transition-all duration-500 ease-in-out group-hover:h-full disabled:group-hover:h-0"></span>
                  <span className="relative z-10">
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </span>
                </button>

                {googleEnabled ? (
                  <GoogleSignInButton 
                    disabled={isLoading}
                    onAuthenticated={handleGoogleAuthentication}
                    redirectUri={googleRedirectUri}
                  />
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex items-center justify-center w-full gap-3 px-6 py-3 text-[16px] md:text-[18px] text-white/60 border border-dashed border-white/10 rounded-xl bg-black/20 cursor-not-allowed"
                    title="Google sign-in is unavailable because VITE_GOOGLE_CLIENT_ID is not configured."
                  >
                    <svg className="w-5 h-5" viewBox="0 0 488 512" aria-hidden="true">
                      <path fill="#EA4335" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C318.6 106.1 285.7 92 248 92c-86.8 0-157.4 71-157.4 164s70.6 164 157.4 164c74.9 0 123.5-42.9 135.4-102.9H248v-82.1h240.6c2.1 11.4 3.4 23.3 3.4 35.8z"></path>
                    </svg>
                    <span>Google sign-in unavailable</span>
                  </button>
                )}

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/[0.03] text-white/60">New to Editco.Media?</span>
                  </div>
                </div>

                {/* Register Link */}
                <Link 
                  to="/register"
                  className="relative block w-full px-6 py-3 text-center text-[16px] md:text-[18px] text-white/80 border border-white/20 rounded-xl overflow-hidden group hover:text-black transition-colors duration-200"
                >
                  <span className="absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-[#63676A] to-[#AAA80F] transition-all duration-500 ease-in-out group-hover:h-full"></span>
                  <span className="relative z-10">Create New Account</span>
                </Link>
              </form>

              {/* Back to Home */}
              <div className="text-center mt-6">
                <button
                  onClick={() => navigate('/')}
                  className="text-white/70 hover:text-white transition-colors duration-200 text-[14px] md:text-[16px]"
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleSignInButton({ disabled, onAuthenticated, redirectUri }) {
  const [isLoading, setIsLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid profile email',
    ux_mode: 'popup',
    redirect_uri: redirectUri,
    onSuccess: async (tokenResponse) => {
      try {
        if (!tokenResponse?.access_token) {
          throw new Error('Missing Google access token');
        }
        await onAuthenticated(tokenResponse.access_token);
      } catch (error) {
        console.error('Google sign-in error:', error);
        toast.error('Google sign-in failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error('Google sign-in was cancelled or failed.');
      setIsLoading(false);
    }
  });

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await googleLogin();
    } catch (error) {
      console.error('Google sign-in failed to start:', error);
      toast.error('Unable to launch Google sign-in. Please check your popup blocker or try again.');
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className="flex items-center justify-center w-full gap-3 px-6 py-3 text-[16px] md:text-[18px] text-white border border-white/20 rounded-xl bg-black/30 hover:bg-black/40 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          Signing in with Google...
        </div>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 488 512" aria-hidden="true">
            <path fill="#EA4335" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C318.6 106.1 285.7 92 248 92c-86.8 0-157.4 71-157.4 164s70.6 164 157.4 164c74.9 0 123.5-42.9 135.4-102.9H248v-82.1h240.6c2.1 11.4 3.4 23.3 3.4 35.8z"></path>
          </svg>
          <span className="text-white/90">Continue with Google</span>
        </>
      )}
    </button>
  );
}

export default Login;

