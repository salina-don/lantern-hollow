import React from 'react';

const FZ = 0.215;

export function BoxFace() {
  return (
    <>
      {/* Eye whites */}
      <mesh position={[-0.09, 1.50, FZ]}>
        <planeGeometry args={[0.10, 0.10]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.09, 1.50, FZ]}>
        <planeGeometry args={[0.10, 0.10]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Pupils */}
      <mesh position={[-0.09, 1.50, FZ + 0.003]}>
        <planeGeometry args={[0.055, 0.055]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.09, 1.50, FZ + 0.003]}>
        <planeGeometry args={[0.055, 0.055]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      {/* Mouth */}
      <mesh position={[0, 1.38, FZ]}>
        <planeGeometry args={[0.14, 0.04]} />
        <meshBasicMaterial color="#3a2a2a" />
      </mesh>
    </>
  );
}
