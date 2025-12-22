import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import BlurText from './BlurText';
import Chat from './Chat';
import { apiFetch } from '../config/api.js';
import { toast } from 'react-toastify';

function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    companyName: ''
  });

  useEffect(() => {
    // Check if user is logged in
    const userSession = localStorage.getItem('userSession');
    if (!userSession) {
      navigate('/login');
      return;
    }

    try {
      const session = JSON.parse(userSession);
      setUser(session.user);
      setFormData({
        firstName: session.user.firstName || '',
        lastName: session.user.lastName || '',
        phoneNumber: session.user.phoneNumber || '',
        companyName: session.user.companyName || ''
      });
    } catch (error) {
      console.error('Error parsing user session:', error);
      navigate('/login');
    }
  }, [navigate]);

  // Fetch unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user?.id) return;
      try {
        const response = await apiFetch(`/api/chat/unread/${user.id}?userType=user`);
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    if (user?.id) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    
    // Update user data in localStorage
    const userSession = JSON.parse(localStorage.getItem('userSession'));
    const updatedUser = {
      ...userSession.user,
      ...formData
    };
    
    localStorage.setItem('userSession', JSON.stringify({
      ...userSession,
      user: updatedUser
    }));
    
    setUser(updatedUser);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userSession');
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffd600] mx-auto mb-4"></div>
          <p className="text-white/70 text-[16px] md:text-[18px]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0c]">
      <Navbar />
      
      <div className="pt-28 md:pt-32 px-4 md:px-8 max-w-7xl mx-auto pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left side: Welcome message */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:h-fit">
            <BlurText
              text="MY DASHBOARD"
              className="text-[48px] md:text-[80px] lg:text-[96px] leading-[0.9] tracking-tight font-extrabold text-[#d5d20d] mb-6 md:mb-8"
              animateBy="words"
              direction="top"
              delay={150}
              stepDuration={0.4}
            />
            <div className="space-y-4">
              <p className="text-white/70 text-[16px] md:text-[18px] leading-relaxed">
                Welcome back, <span className="text-[#ffd600] font-medium">{user.firstName}</span>! 
                Manage your profile and track your projects here.
              </p>
              <div className="space-y-2 pt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#ffd600] rounded-full"></div>
                  <p className="text-white/60 text-[14px] md:text-[16px]">Update your information</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#ffd600] rounded-full"></div>
                  <p className="text-white/60 text-[14px] md:text-[16px]">View your account details</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#ffd600] rounded-full"></div>
                  <p className="text-white/60 text-[14px] md:text-[16px]">Manage your preferences</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Dashboard content */}
          <div className="lg:col-span-7 space-y-6 lg:mt-0">
            {/* Header with logout */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-[24px] md:text-[28px] font-medium text-white mb-2">
                    <span className="text-[#AAA80F]">Account</span> <span className="text-[#63676A]">Overview</span>
                  </h2>
                  <p className="text-white/70 text-[14px] md:text-[16px]">
                    Manage your personal information
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="relative px-4 md:px-6 py-2 text-[14px] md:text-[16px] text-white border border-white/30 rounded-xl overflow-hidden group hover:text-black transition-colors duration-200"
                >
                  <span className="absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-red-500 to-red-400 transition-all duration-500 ease-in-out group-hover:h-full"></span>
                  <span className="relative z-10">Logout</span>
                </button>
              </div>

              {/* Account Info */}
              <div className="space-y-4">
                <div className="p-4 bg-black/20 border border-white/10 rounded-xl">
                  <p className="text-white/60 text-[12px] md:text-[14px] mb-1">Username</p>
                  <p className="text-white text-[16px] md:text-[18px] font-medium">@{user.username}</p>
                </div>
                <div className="p-4 bg-black/20 border border-white/10 rounded-xl">
                  <p className="text-white/60 text-[12px] md:text-[14px] mb-1">Email Address</p>
                  <p className="text-white text-[16px] md:text-[18px] font-medium">{user.email}</p>
                </div>
                <div className="p-4 bg-black/20 border border-white/10 rounded-xl">
                  <p className="text-white/60 text-[12px] md:text-[14px] mb-1">Member Since</p>
                  <p className="text-white text-[16px] md:text-[18px] font-medium">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[20px] md:text-[24px] font-medium text-white">
                  <span className="text-[#AAA80F]">Profile</span> <span className="text-[#63676A]">Information</span>
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="relative px-4 md:px-6 py-2 text-[14px] md:text-[16px] text-white border border-white/30 rounded-xl overflow-hidden group hover:text-black transition-colors duration-200"
                  >
                    <span className="absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-[#ffd600] to-[#fff9be] transition-all duration-500 ease-in-out group-hover:h-full"></span>
                    <span className="relative z-10">Edit Profile</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[14px] md:text-[16px] font-medium text-white/90 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#ffd600]/50 focus:border-transparent transition-all duration-200 text-[14px] md:text-[16px]"
                        placeholder="Your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-[14px] md:text-[16px] font-medium text-white/90 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#ffd600]/50 focus:border-transparent transition-all duration-200 text-[14px] md:text-[16px]"
                        placeholder="Your last name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[14px] md:text-[16px] font-medium text-white/90 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#ffd600]/50 focus:border-transparent transition-all duration-200 text-[14px] md:text-[16px]"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] md:text-[16px] font-medium text-white/90 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#ffd600]/50 focus:border-transparent transition-all duration-200 text-[14px] md:text-[16px]"
                      placeholder="Your company (optional)"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="relative flex-1 px-6 py-3 text-[16px] md:text-[18px] text-white border border-white/30 rounded-xl overflow-hidden group hover:text-black transition-colors duration-200"
                    >
                      <span className="absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-[#ffd600] to-[#fff9be] transition-all duration-500 ease-in-out group-hover:h-full"></span>
                      <span className="relative z-10">Save Changes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          firstName: user.firstName || '',
                          lastName: user.lastName || '',
                          phoneNumber: user.phoneNumber || '',
                          companyName: user.companyName || ''
                        });
                      }}
                      className="relative flex-1 px-6 py-3 text-[16px] md:text-[18px] text-white/80 border border-white/20 rounded-xl overflow-hidden group hover:text-black transition-colors duration-200"
                    >
                      <span className="absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-[#63676A] to-[#AAA80F] transition-all duration-500 ease-in-out group-hover:h-full"></span>
                      <span className="relative z-10">Cancel</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-black/20 border border-white/10 rounded-xl">
                      <p className="text-white/60 text-[12px] md:text-[14px] mb-1">First Name</p>
                      <p className="text-white text-[16px] md:text-[18px] font-medium">
                        {user.firstName || 'Not provided'}
                      </p>
                    </div>
                    <div className="p-4 bg-black/20 border border-white/10 rounded-xl">
                      <p className="text-white/60 text-[12px] md:text-[14px] mb-1">Last Name</p>
                      <p className="text-white text-[16px] md:text-[18px] font-medium">
                        {user.lastName || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-black/20 border border-white/10 rounded-xl">
                    <p className="text-white/60 text-[12px] md:text-[14px] mb-1">Phone Number</p>
                    <p className="text-white text-[16px] md:text-[18px] font-medium">
                      {user.phoneNumber || 'Not provided'}
                    </p>
                  </div>
                  <div className="p-4 bg-black/20 border border-white/10 rounded-xl">
                    <p className="text-white/60 text-[12px] md:text-[14px] mb-1">Company Name</p>
                    <p className="text-white text-[16px] md:text-[18px] font-medium">
                      {user.companyName || 'Not provided'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:p-8">
              <h3 className="text-[20px] md:text-[24px] font-medium text-white mb-6">
                <span className="text-[#AAA80F]">Quick</span> <span className="text-[#63676A]">Actions</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/connect')}
                  className="relative p-6 text-left border border-white/20 rounded-xl overflow-hidden group hover:border-[#ffd600]/50 transition-all duration-200"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#ffd600]/0 to-[#ffd600]/0 group-hover:from-[#ffd600]/5 group-hover:to-[#ffd600]/10 transition-all duration-300"></div>
                  <div className="relative z-10">
                    <h4 className="text-white text-[16px] md:text-[18px] font-medium mb-2">New Project</h4>
                    <p className="text-white/60 text-[12px] md:text-[14px]">Submit a new project request</p>
                  </div>
                </button>
                <button
                  onClick={() => setShowChat(true)}
                  className="relative p-6 text-left border border-white/20 rounded-xl overflow-hidden group hover:border-[#ffd600]/50 transition-all duration-200"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#ffd600]/0 to-[#ffd600]/0 group-hover:from-[#ffd600]/5 group-hover:to-[#ffd600]/10 transition-all duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white text-[16px] md:text-[18px] font-medium">Chat with Team</h4>
                      {unreadCount > 0 && (
                        <span className="bg-[#ffd600] text-black text-xs font-bold px-2 py-1 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 text-[12px] md:text-[14px]">Get instant support</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="relative p-6 text-left border border-white/20 rounded-xl overflow-hidden group hover:border-[#ffd600]/50 transition-all duration-200"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#ffd600]/0 to-[#ffd600]/0 group-hover:from-[#ffd600]/5 group-hover:to-[#ffd600]/10 transition-all duration-300"></div>
                  <div className="relative z-10">
                    <h4 className="text-white text-[16px] md:text-[18px] font-medium mb-2">View Services</h4>
                    <p className="text-white/60 text-[12px] md:text-[14px]">Explore what we offer</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Component */}
      {showChat && user && (
        <Chat
          userId={user.id}
          userName={`${user.firstName} ${user.lastName}`}
          userEmail={user.email}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}

export default UserDashboard;

