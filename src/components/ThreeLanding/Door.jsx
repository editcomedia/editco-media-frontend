import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Door({ scrollRef }) {
  const doorGroupRef = useRef(null);

  useFrame((state) => {
    const p = scrollRef.current.progress;

    // Door opens inward smoothly between p=0.4 and p=0.6
    let phase = 0;
    if (p > 0.4 && p <= 0.6) {
      phase = (p - 0.4) / 0.2; // 0 to 1
    } else if (p > 0.6) {
      phase = 1;
    }

    if (doorGroupRef.current) {
      // Hinge on the right side if looking towards z=0, or left side? The reference had it on left. 
      // Open inwards (towards negative Z)
      const targetRotation = THREE.MathUtils.lerp(0, -1.8, phase); // about -100 deg
      doorGroupRef.current.rotation.y = THREE.MathUtils.lerp(doorGroupRef.current.rotation.y, targetRotation, 0.1);
    }
  });

  return (
    <group position={[0, 2, -10]}>
      {/* 
        The black void room BEHIND the door. 
        It absorbs all light so the fluid pops perfectly against it.
        We place it at z = -0.5, extending backwards deep.
      */}
      <mesh position={[0, 0, -2]}>
        <boxGeometry args={[4, 5, 4]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* 
        The Door Panel. Perfectly matches the wall color. 
        Placed at z=0 (flush with the wall back plane which is at z=-10).
      */}
      <group ref={doorGroupRef} position={[-1, 0, 0]}>
        <mesh position={[1, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2, 4, 0.1]} />
          {/* Exact color match to the back wall of Scene.jsx to make it "invisible" */}
          <meshStandardMaterial color="#f2f2f2" roughness={0.8} metalness={0.1} />
        </mesh>
      </group>
    </group>
  );
}
