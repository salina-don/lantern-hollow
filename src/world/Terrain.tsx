import React from 'react';

export function Terrain() {
  return (
    <>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshLambertMaterial color="#5a7a3a" />
      </mesh>
      {/* Dirt paths */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <planeGeometry args={[1.5, 18]} />
        <meshLambertMaterial color="#8B7355" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <planeGeometry args={[18, 1.5]} />
        <meshLambertMaterial color="#8B7355" />
      </mesh>
    </>
  );
}
