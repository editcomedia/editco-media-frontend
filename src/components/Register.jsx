import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import BlurText from './BlurText';
import { apiFetch } from '../config/api';
import { toast } from 'react-toastify';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    companyName: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailPattern = /\S+@\S+\.\S+/;
      if (!emailPattern.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
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
      const response = await apiFetch('/api/users/register', {
        method: 'POST',
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          companyName: formData.companyName
        })
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        let errorMessage = 'Registration failed. Please try again.';
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
        toast.success('Account created successfully! Please sign in.');
        navigate('/login');
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Provide more specific error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Unable to connect to server. Please ensure the backend server is running.');
      } else if (error.message && error.message.includes('VITE_API_URL')) {
        toast.error('API configuration error. Please check your environment variables.');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createInputField = (fieldName, label, type, placeholder, required = true) => {
    const hasError = errors[fieldName];
    
    return (
      <div>
        <label htmlFor={fieldName} className="block text-[14px] md:text-[16px] font-medium text-white/90 mb-2">
          {label} {required && <span className="text-red-400">*</span>}
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
              text="JOIN US TODAY"
              className="text-[56px] md:text-[96px] leading-[0.9] tracking-tight font-extrabold text-[#d5d20d] mb-8"
              animateBy="words"
              direction="top"
              delay={150}
              stepDuration={0.4}
            />
            <div className="space-y-4">
              <p className="text-white/70 text-[16px] md:text-[18px] leading-relaxed">
                Create your account and start collaborating with Editco.Media on amazing projects.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#ffd600] rounded-full"></div>
                  <p className="text-white/60 text-[14px] md:text-[16px]">Track your project submissions</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#ffd600] rounded-full"></div>
                  <p className="text-white/60 text-[14px] md:text-[16px]">Manage your profile</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#ffd600] rounded-full"></div>
                  <p className="text-white/60 text-[14px] md:text-[16px]">Get exclusive updates</p>
                </div>
              </div>
              <p className="text-white/60 text-[14px] md:text-[16px] pt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-[#ffd600] hover:text-[#fff9be] transition-colors duration-200 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          {/* Right side: Registration form */}
          <div className="lg:col-span-7 pb-16">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-[24px] md:text-[28px] font-medium text-white mb-2">
                    <span className="text-[#AAA80F]">Create</span> <span className="text-[#63676A]">Account</span>
                  </h2>
                  <p className="text-white/70 text-[14px] md:text-[16px]">
                    Fill in your details to get started
                  </p>
                </div>

                {/* Account Information */}
                <div>
                  <h3 className="text-[18px] md:text-[20px] font-medium text-white mb-4">Account Information</h3>
                  <div className="space-y-4">
                    {createInputField('username', 'Username', 'text', 'Choose a unique username')}
                    {createInputField('email', 'Email Address', 'email', 'your@email.com')}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {createInputField('password', 'Password', 'password', 'At least 6 characters')}
                      {createInputField('confirmPassword', 'Confirm Password', 'password', 'Re-enter password')}
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <h3 className="text-[18px] md:text-[20px] font-medium text-white mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {createInputField('firstName', 'First Name', 'text', 'Your first name')}
                      {createInputField('lastName', 'Last Name', 'text', 'Your last name')}
                    </div>
                    {createInputField('phoneNumber', 'Phone Number', 'tel', '+1 (555) 123-4567', false)}
                    {createInputField('companyName', 'Company Name', 'text', 'Your company (optional)', false)}
                  </div>
                </div>

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
                        Creating account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </span>
                </button>

                {/* Terms Notice */}
                <div className="p-4 bg-[#ffd600]/10 border border-[#ffd600]/20 rounded-xl">
                  <p className="text-[#ffd600] text-[12px] md:text-[14px] text-center">
                    By creating an account, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
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

export default Register;

