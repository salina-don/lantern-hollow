import React from 'react';
import { LOCATIONS } from './locations';

interface BuildingProps {
  position: [number, number, number];
  wallColor: string;
  width?: number;
  depth?: number;
  height?: number;
  label?: string;
}

function Building({ position, wallColor, width = 3, depth = 3, height = 2.5 }: BuildingProps) {
  const roofRadius = (Math.max(width, depth) / 2) * 1.2;
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshLambertMaterial color={wallColor} />
      </mesh>
      <mesh position={[0, height + 0.7, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[roofRadius, 1.4, 4]} />
        <meshLambertMaterial color="#7B3F00" />
      </mesh>
    </group>
  );
}

function Well() {
  const pos = LOCATIONS.well.position;
  return (
    <group position={pos}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.55, 1.2, 10]} />
        <meshLambertMaterial color="#999" />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <torusGeometry args={[0.55, 0.07, 6, 16]} />
        <meshLambertMaterial color="#555" />
      </mesh>
    </group>
  );
}

export function Buildings() {
  return (
    <group>
      <Building
        position={LOCATIONS.inn.position}
        wallColor="#C8A96E"
        width={4}
        depth={3.5}
        height={3}
      />
      <Building
        position={LOCATIONS.market.position}
        wallColor="#BDB76B"
        width={5}
        depth={4}
        height={2.2}
      />
      <Building
        position={LOCATIONS.blacksmith.position}
        wallColor="#778899"
        width={3}
        depth={3}
        height={2.8}
      />
      <Well />
    </group>
  );
}
