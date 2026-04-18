import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check if user or admin is logged in
    const userSession = localStorage.getItem('userLoggedIn');
    const adminSession = localStorage.getItem('adminLoggedIn');
    setIsLoggedIn(userSession === 'true' || adminSession === 'true');
    setIsAdmin(adminSession === 'true');

    // Get user name
    if (adminSession === 'true') {
      setUserName('Admin');
    } else if (userSession === 'true') {
      try {
        const session = JSON.parse(localStorage.getItem('userSession'));
        if (session && session.user) {
          setUserName(session.user.firstName || session.user.username);
        }
      } catch (error) {
        console.error('Error parsing user session:', error);
      }
    }
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between backdrop-blur-md bg-white/30 py-4 px-8 transition-colors duration-500">
      <div className="text-black">
        <a href="/" className="block">
          <img
            src="https://res.cloudinary.com/dqataciy5/image/upload/v1758274781/Gemini_Generated_Image_87j6z987j6z987j6_kuuycd.jpg"
            alt="editco.media logo"
            className="h-10 md:h-12 w-auto object-contain hover:scale-105 transition-transform duration-300"
          />
        </a>
      </div>
      <div className="relative flex items-center gap-8">
        <div className="hidden md:flex items-center gap-10">
          <a href="/services" className="text-black hover:opacity-100 opacity-60 transition-all duration-300 text-base font-medium tracking-tight uppercase">Services</a>
          <a href="/work" className="text-black hover:opacity-100 opacity-60 transition-all duration-300 text-base font-medium tracking-tight uppercase">Work</a>
          <a href="/about" className="text-black hover:opacity-100 opacity-60 transition-all duration-300 text-base font-medium tracking-tight uppercase">About</a>
        </div>
        <div className="flex items-center gap-3">
          {/* User Name Display - Clickable, All Screens */}
          {isLoggedIn && userName ? (
            <a 
              href={isAdmin ? "/admin" : "/dashboard"}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-[#ffd600]/50 transition-all duration-200 cursor-pointer group"
            >
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-[#ffd600] to-[#fff9be] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                <span className="text-black font-semibold text-xs md:text-sm">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-white text-[13px] md:text-[14px] font-medium truncate max-w-[80px] md:max-w-none group-hover:text-[#ffd600] transition-colors duration-200">
                {userName}
              </span>
            </a>
          ) : (
            /* Login Button - Only when not logged in */
            <a href="/login" className="block">
              <button
                className="relative flex items-center justify-center px-6 h-10 rounded-full text-[13px] font-semibold border border-black/10 overflow-hidden z-[1] group bg-transparent text-black transition-all duration-300"
              >
                <span
                  className="absolute top-0 left-0 h-full w-0 bg-black transition-all duration-500 ease-in-out z-[-1] group-hover:w-full"
                ></span>
                <span className="group-hover:text-white transition-colors duration-200">Login</span>
              </button>
            </a>
          )}
          
          {/* Connect Button - Desktop Only */}
          <a href="/connect" className="hidden md:block">
            <button
              className="relative flex items-center justify-center w-36 h-10 rounded-full text-[13px] font-semibold overflow-hidden z-[1] group bg-black text-white hover:bg-black/90 transition-all duration-300 shadow-lg shadow-black/10"
            >
              Get in Touch
            </button>
          </a>
        </div>
        
        {/* Hamburger */}
        <button
          className="md:hidden inline-flex flex-col justify-center items-center w-10 h-10 border border-black/15 rounded-full text-black"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`block h-[2px] w-5 bg-black transition-transform ${open ? 'translate-y-[6px] rotate-45' : ''}`}></span>
          <span className={`block h-[2px] w-5 bg-black my-[5px] transition-opacity ${open ? 'opacity-0' : 'opacity-100'}`}></span>
          <span className={`block h-[2px] w-5 bg-black transition-transform ${open ? '-translate-y-[6px] -rotate-45' : ''}`}></span>
        </button>
        {open && (
          <div className="md:hidden absolute right-0 top-full mt-2 w-64 rounded-xl border border-white/10 bg-[#1d1d1f]/95 backdrop-blur-sm shadow-lg overflow-hidden">
            <div className="py-2">
              {/* User Info - Mobile (only when logged in) */}
              {isLoggedIn && userName && (
                <>
                  <div className="px-4 py-3 mb-1 bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffd600] to-[#fff9be] flex items-center justify-center flex-shrink-0">
                        <span className="text-black font-semibold text-base">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium text-sm truncate">
                          {userName}
                        </p>
                        <p className="text-white/60 text-xs">
                          {isAdmin ? 'Administrator' : 'Member'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-white/10"></div>
                </>
              )}
              
              {/* Navigation Links */}
              <a href="/services" className="block px-4 py-2.5 text-white hover:text-[#ffd600] hover:bg-white/5 transition-all">Services</a>
              <a href="/work" className="block px-4 py-2.5 text-white hover:text-[#ffd600] hover:bg-white/5 transition-all">Work</a>
              <a href="/about" className="block px-4 py-2.5 text-white hover:text-[#ffd600] hover:bg-white/5 transition-all">About</a>
              {/* <a href="/blogs" className="block px-4 py-2.5 text-white hover:text-[#ffd600] hover:bg-white/5 transition-all">Blog</a> */}
              
              <div className="border-t border-white/10 my-2"></div>
              
              {/* Dashboard/Login Button */}
              <a href={isLoggedIn ? (isAdmin ? "/admin" : "/dashboard") : "/login"} className="block px-4 py-2.5 text-white hover:text-[#ffd600] hover:bg-white/5 transition-all font-medium">
                {isLoggedIn ? (isAdmin ? "Admin Panel" : "My Dashboard") : "Sign In"}
              </a>
              
              {/* Connect Button */}
              <a href="/connect" className="block px-4 py-2.5 text-[#ffd600] hover:text-[#fff9be] hover:bg-[#ffd600]/10 transition-all font-medium">
                Get in Touch
              </a>
            </div>
          </div>
        )}
      </div>

    </nav>
  )
}



export default Navbar;