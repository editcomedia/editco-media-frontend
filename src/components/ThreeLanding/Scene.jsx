import React from 'react';
import * as THREE from 'three';
import Door from './Door';
import LiquidEffect from './LiquidEffect';

export default function Scene({ scrollRef }) {
  // Common material for the white studio room
  // High-key finish
  const wallMaterial = <meshStandardMaterial color="#f2f2f2" roughness={0.9} metalness={0.0} />;

  return (
    <group>
      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 10]}>
        <planeGeometry args={[30, 40]} />
        {/* Slightly glossy floor for cinematic reflection */}
        <meshPhysicalMaterial 
          color="#e0e0e0" 
          roughness={0.2} 
          metalness={0.1}
          clearcoat={0.5}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 10]}>
        <planeGeometry args={[30, 40]} />
        {wallMaterial}
      </mesh>

      {/* Left Wall */}
      <mesh receiveShadow rotation={[0, Math.PI / 2, 0]} position={[-15, 5, 10]}>
        <planeGeometry args={[40, 10]} />
        {wallMaterial}
      </mesh>

      {/* Right Wall */}
      <mesh receiveShadow rotation={[0, -Math.PI / 2, 0]} position={[15, 5, 10]}>
        <planeGeometry args={[40, 10]} />
        {wallMaterial}
      </mesh>

      {/* 
        Back Wall split into 3 pieces to leave a hole for the door (w: 2, h: 4) at x=0
        Total width: 30. Door is at x=0. Width=2.
        Left piece: width 14, x=-8
        Right piece: width 14, x=8
        Top piece: height 6, y=7
      */}
      <mesh receiveShadow position={[-8, 5, -10]}>
        <planeGeometry args={[14, 10]} />
        {wallMaterial}
      </mesh>
      <mesh receiveShadow position={[8, 5, -10]}>
        <planeGeometry args={[14, 10]} />
        {wallMaterial}
      </mesh>
      <mesh receiveShadow position={[0, 7, -10]}>
        <planeGeometry args={[2, 6]} />
        {wallMaterial}
      </mesh>

      {/* The door mounts flush at z=-10 */}
      <Door scrollRef={scrollRef} />
      <LiquidEffect scrollRef={scrollRef} />
    </group>
  );
}
