import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { liquidVertexShader, liquidFragmentShader } from '../../shaders/liquidShader';

export default function LiquidEffect({ scrollRef }) {
  const materialRef = useRef();
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uColor: { value: new THREE.Color('#050505') }
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      const p = scrollRef.current.progress;
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Liquid starts emerging past the door opening phase (p > 0.45)
      let liquidProgress = 0;
      if (p > 0.45) {
        // map 0.45 -> 1.0 to 0.0 -> 1.0
        liquidProgress = (p - 0.45) / 0.55;
      }
      
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uProgress.value,
        liquidProgress,
        0.1
      );
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 
        This sphere is positioned at the base of the doorway (x=0, y=0, z=-10).
        As progress increases, the shader will morph it into a puddle that spreads forward.
      */}
      <mesh receiveShadow position={[0, 0, -10]}>
        <sphereGeometry args={[1, 128, 128]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={liquidVertexShader}
          fragmentShader={liquidFragmentShader}
          uniforms={uniforms}
          transparent={false} // Liquid is dense, not transparent
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
