import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

export default function ScrollController({ scrollRef }) {
  const { camera } = useThree();

  // Handle the text color transition (Black to White) when liquid fills
  useEffect(() => {
    const brandElement = document.querySelector('.brand-reveal h1');
    const brandDesc = document.querySelector('.brand-reveal p');
    
    if (brandElement && brandDesc) {
      gsap.to([brandElement, brandDesc], {
        scrollTrigger: {
          trigger: document.body,
          start: "70% top",
          end: "90% top",
          scrub: true,
        },
        color: "#ffffff",
        ease: "none"
      });
      
      // Slight parallax and blur on the text as we scroll
      gsap.to('.brand-reveal', {
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "50% top",
          scrub: true,
        },
        y: -50,
        filter: "blur(2px)",
        opacity: 0.8,
        ease: "none"
      });
      
      // Fade out scroll indicator
      gsap.to('.scroll-indicator', {
        scrollTrigger: {
          trigger: document.body,
          start: "1% top",
          end: "5% top",
          scrub: true,
        },
        opacity: 0,
        y: 20,
        ease: "none"
      });
    }
  }, []);

  useFrame((state, delta) => {
    const p = scrollRef.current.progress;

    // MULTI-PHASE SCROLL TACTIC:
    // 0 -> 0.7: Slow push, stay away (z=15 to z=5)
    // 0.7 -> 1.0: Final zoom through (z=5 to z=-11.5)
    
    let targetZ;
    if (p < 0.7) {
      // Map 0 -> 0.7 to 15 -> 5
      targetZ = THREE.MathUtils.mapLinear(p, 0, 0.7, 15, 5);
    } else {
      // Map 0.7 -> 1.0 to 5 -> -11.5
      targetZ = THREE.MathUtils.mapLinear(p, 0.7, 1.0, 5, -11.5);
    }
    
    // Smooth camera motion
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1);
    
    // Smooth parallax wobble
    const pointer = state.pointer;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.4, 0.1);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2 + pointer.y * 0.4, 0.1);
    
    // Maintain focus on the doorway
    camera.lookAt(0, 2, -10);
  });

  return null;
}
