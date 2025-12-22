import React, { useState, useEffect } from 'react';
import ContactOptionsPopup from './ContactOptionsPopup';
import CalPopup from './CalPopup';
import Chat from './Chat';
import './CallButton.css';

const CallButton = () => {
  const [isContactPopupOpen, setIsContactPopupOpen] = useState(false);
  const [isCalPopupOpen, setIsCalPopupOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const userSession = localStorage.getItem('userLoggedIn');
      const adminSession = localStorage.getItem('adminLoggedIn');
      const isUserLoggedIn = userSession === 'true' || adminSession === 'true';
      
      setIsLoggedIn(isUserLoggedIn);

      if (isUserLoggedIn && userSession === 'true') {
        try {
          const session = JSON.parse(localStorage.getItem('userSession'));
          if (session && session.user) {
            setUserInfo({
              userId: session.user._id || session.user.id,
              userName: session.user.firstName || session.user.username,
              userEmail: session.user.email
            });
          }
        } catch (error) {
          console.error('Error parsing user session:', error);
          setUserInfo(null);
        }
      } else {
        setUserInfo(null);
      }
    };

    checkAuth();

    // Listen for storage changes (in case user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case of same-tab login/logout
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleOpenContactPopup = () => {
    setIsContactPopupOpen(true);
  };

  const handleCloseContactPopup = () => {
    setIsContactPopupOpen(false);
  };

  const handleChatClick = () => {
    if (isLoggedIn && userInfo) {
      setIsChatOpen(true);
    }
  };

  const handleBookCallClick = () => {
    setIsCalPopupOpen(true);
  };

  const handleCloseCalPopup = () => {
    setIsCalPopupOpen(false);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpenContactPopup}
        className="call-button"
        aria-label="Contact options"
      >
        <svg
          className="call-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      </button>
      
      <ContactOptionsPopup
        isOpen={isContactPopupOpen}
        onClose={handleCloseContactPopup}
        isLoggedIn={isLoggedIn}
        userInfo={userInfo}
        onChatClick={handleChatClick}
        onBookCallClick={handleBookCallClick}
      />
      
      <CalPopup isOpen={isCalPopupOpen} onClose={handleCloseCalPopup} />
      
      {isChatOpen && userInfo && (
        <Chat
          userId={userInfo.userId}
          userName={userInfo.userName}
          userEmail={userInfo.userEmail}
          onClose={handleCloseChat}
        />
      )}
    </>
  );
};

export default CallButton;

