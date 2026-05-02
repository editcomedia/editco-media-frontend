import React from 'react';

function Hero() {
  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
        src="https://res.cloudinary.com/dxeoibunj/video/upload/v1776489622/Timeline_1_xhvbls_aecyri.mov"
      />

      {/* Branding Overlay */}
      <div className="relative z-20 flex flex-col items-center px-4 max-w-5xl mt-20">
        <h1 className="text-[12vw] md:text-[8vw] font-bold tracking-tight mb-2 text-center text-white leading-none">
          A Web Branding House
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl text-center font-normal leading-relaxed">
          At The Internet Company, we craft immersive 3D CGI websites, striking brand identities, and digital experiences that redefine how audiences interact with brands online.
        </p>
        <button className="pointer-events-auto px-10 py-4 rounded-full bg-white text-black text-lg font-medium hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
          Book a Call <span className="text-xl">→</span>
        </button>
      </div>
    </section>
  );
}

export default Hero;
