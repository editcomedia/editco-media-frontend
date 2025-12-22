import React, { useEffect, useRef, useState } from 'react';
import './ContactOptionsPopup.css';

const ContactOptionsPopup = ({ 
  isOpen, 
  onClose, 
  isLoggedIn, 
  userInfo,
  onChatClick,
  onBookCallClick 
}) => {
  const popupRef = useRef(null);
  const overlayRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      setIsClosing(false);
      setShowLoginPrompt(false);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setShowLoginPrompt(false);
    }, 300);
  };

  // Handle click outside to close
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      handleClose();
    }
  };

  // Handle Chat button click
  const handleChatClick = () => {
    if (isLoggedIn && userInfo) {
      handleClose();
      setTimeout(() => {
        onChatClick();
      }, 300);
    } else {
      setShowLoginPrompt(true);
    }
  };

  // Handle Book Call button click
  const handleBookCallClick = () => {
    handleClose();
    setTimeout(() => {
      onBookCallClick();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className={`contact-popup-backdrop ${isClosing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      {/* Backdrop with blur effect */}
      <div className="contact-popup-backdrop-blur" />
      
      {/* Popup container */}
      <div
        ref={popupRef}
        className={`contact-popup-container ${isClosing ? 'closing' : ''}`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="contact-popup-close-btn"
          aria-label="Close popup"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Popup content */}
        <div className="contact-popup-content">
          <div className="contact-popup-header">
            <h2 className="contact-popup-title">Get in Touch</h2>
            <p className="contact-popup-subtitle">Choose how you'd like to connect with us</p>
          </div>

          <div className="contact-popup-options">
            {/* Chat Option */}
            <button
              onClick={handleChatClick}
              className="contact-option-button chat-option"
              aria-label="Chat with team"
            >
              <div className="contact-option-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="contact-option-content">
                <h3 className="contact-option-title">Chat with Team</h3>
                <p className="contact-option-description">
                  {isLoggedIn ? 'Start a conversation with our team' : 'Login to access chat'}
                </p>
              </div>
              {isLoggedIn && (
                <div className="contact-option-arrow">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </button>

            {/* Login Prompt */}
            {showLoginPrompt && !isLoggedIn && (
              <div className="login-prompt">
                <p className="login-prompt-text">Please login to access chat</p>
                <a href="/login" className="login-prompt-button">
                  Go to Login
                </a>
              </div>
            )}

            {/* Book Call Option */}
            <button
              onClick={handleBookCallClick}
              className="contact-option-button call-option"
              aria-label="Book a call or meeting"
            >
              <div className="contact-option-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="contact-option-content">
                <h3 className="contact-option-title">Book a Call / Meet</h3>
                <p className="contact-option-description">
                  Schedule a meeting with our team
                </p>
              </div>
              <div className="contact-option-arrow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactOptionsPopup;

