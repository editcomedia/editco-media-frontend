import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload, Environment } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Scene from './Scene';
import ScrollController from './ScrollController';

gsap.registerPlugin(ScrollTrigger);

export default function ThreeExperience() {
  const containerRef = useRef(null);
  const scrollRef = useRef({ progress: 0 }); // Shared state between DOM and R3F
  
  const [loadFinished, setLoadFinished] = useState(false);

  useEffect(() => {
    // We attach ScrollTrigger to a very tall container to allow for a 4-beat cinematic scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1, // Smooth scrub
        onUpdate: (self) => {
          scrollRef.current.progress = self.progress;
        }
      }
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[400vh] bg-white">
      {/* 3D Canvas fixed visually to the viewport */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <Canvas 
          shadows
          camera={{ position: [0, 2, 12], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
          onCreated={() => setLoadFinished(true)}
        >
          <color attach="background" args={['#ffffff']} />
          <ambientLight intensity={0.5} />
          {/* Main cinematic directional light casting shadows */}
          <directionalLight 
            castShadow 
            position={[5, 10, 5]} 
            intensity={1.5} 
            color="#ffffff"
            shadow-mapSize={[2048, 2048]}
          >
            <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10, 0.1, 50]} />
          </directionalLight>
          
          <Environment preset="city" />
          
          <Scene scrollRef={scrollRef} />
          <ScrollController scrollRef={scrollRef} />
          <Preload all />
        </Canvas>
        
        {/* Branding Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center z-10"
        >
          <div className="brand-reveal flex flex-col items-center px-4 max-w-5xl">
            <h1 className="text-[12vw] md:text-[8vw] font-bold tracking-tight mb-2 text-center text-black leading-none">
              A Web Branding House
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl text-center font-normal leading-relaxed">
              At The Internet Company, we craft immersive 3D CGI websites, striking brand identities, and digital experiences that redefine how audiences interact with brands online.
            </p>
            <button className="pointer-events-auto px-10 py-4 rounded-full bg-black text-white text-lg font-medium hover:scale-105 transition-transform flex items-center gap-2">
              Book a Call <span className="text-xl">→</span>
            </button>
          </div>
          
          {/* Scroll Indicator */}
          <div className="scroll-indicator absolute bottom-10 flex flex-col items-center gap-2 opacity-40">
            <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></div>
            <span className="text-[10px] tracking-widest uppercase text-black font-semibold">Keep scrolling</span>
          </div>
        </div>
      </div>
    </div>
  );
}
