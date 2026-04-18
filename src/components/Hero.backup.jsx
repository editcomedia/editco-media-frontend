import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

const MagneticButton = ({ children, onClick }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      className="relative z-50 p-6 -m-6 cursor-pointer inline-block"
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      <button 
        onClick={onClick}
        className="relative px-8 py-4 text-[16px] md:text-[18px] font-medium text-white border border-white/20 rounded-full overflow-hidden group hover:border-[#AAA80F]/50 transition-colors duration-300 pointer-events-auto"
      >
        <span className="absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-[#AAA80F] to-[#ffd600] transition-all duration-500 ease-in-out group-hover:h-full"></span>
        <span className="relative z-10 group-hover:text-black flex items-center gap-2">
          {children}
        </span>
      </button>
    </motion.div>
  );
};

function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  const headline = "Engineering Digital Reality. Crafting Bold Creative.";
  const words = headline.split(" ");

  const scrollToServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#1d1d1f] overflow-hidden selection:bg-[#AAA80F] selection:text-black">
      
      {/* 1. Base Layer: The Video */}
      <div className="absolute inset-0 z-0">
        <video
          className="object-cover w-full h-full opacity-90"
          src="https://res.cloudinary.com/dqataciy5/video/upload/v1758301511/Timeline_1_xhvbls.mov"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      {/* 2. Text Masking Layer - Multiply Blend */}
      <div className="absolute inset-0 z-10 bg-[#000] mix-blend-multiply pointer-events-none flex flex-col justify-center items-center">
        <div className="w-full max-w-7xl px-6 md:px-12 lg:px-16 mx-auto mt-16 md:mt-24">
           {/* H1 masked text. text-white makes it a window to the video. bg-[#000] hides the rest. */}
           <h1 className="text-[11vw] md:text-[7.5vw] lg:text-[6.5vw] font-bold leading-[1.05] tracking-tight text-white uppercase flex flex-wrap gap-x-[1.5vw] md:gap-x-4">
            {words.map((word, index) => (
              <span key={index} className="overflow-hidden inline-block pb-2">
                <motion.span 
                  className="inline-block"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1], // Custom snappy cubic-bezier
                    delay: 0.2 + (index * 0.08)
                  }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>
        </div>
      </div>

      {/* 3. Interactive Spotlight & Glow */}
      {/* A subtle spotlight that trails the cursor over the whole section */}
      <motion.div 
        className="absolute inset-0 z-20 pointer-events-none mix-blend-screen"
        animate={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(170,168,15,0.08), transparent 40%)`
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.5 }}
      />

      {/* 4. Normal Foreground Content */}
      <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-center items-center">
        
        <div className="w-full max-w-7xl px-6 md:px-12 lg:px-16 mx-auto h-full flex flex-col relative pt-[10vh] md:pt-[15vh]">
          
          {/* Eyebrow */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mb-auto mt-[4vh] md:mt-[6vh]"
          >
            <p className="font-mono tracking-[0.2em] text-[10px] md:text-xs text-white/50 uppercase">
              [ EDITCO.MEDIA // TECH & CREATIVE AGENCY ]
            </p>
          </motion.div>

          {/* Subheadline and CTA */}
          <div className="mt-auto mb-[12vh] md:mb-[15vh] pr-4 md:pr-0">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-8 text-[16px] md:text-[20px] font-sans text-white/70 max-w-lg leading-relaxed mix-blend-screen"
            >
              We build scalable technical foundations and striking visual narratives for brands that refuse to blend in.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="mt-8 md:mt-10 self-start pointer-events-auto"
            >
              <MagneticButton onClick={scrollToServices}>
                Start a Project <FiArrowRight className="ml-1" />
              </MagneticButton>
            </motion.div>
          </div>

        </div>
      </div>

      {/* 5. Scroll Indicator */}
      <motion.div 
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 text-white/40 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <span className="font-mono text-[9px] uppercase tracking-widest">Scroll to Explore</span>
        <motion.div 
          className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent flex mx-auto"
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  )
}

export default Hero;
