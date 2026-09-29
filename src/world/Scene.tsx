import React, { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { GameCanvas } from './GameCanvas';
import { Terrain } from './Terrain';
import { Buildings } from './Buildings';
import { PlayerMesh } from '../entities/Player';
import { NPCMesh } from '../entities/NPCMesh';
import { ThirdPersonCamera } from './ThirdPersonCamera';
import { tickNPCs, startNPCWander } from '../systems/npcAI';

const INITIAL_NPC_IDS = ['alice', 'bob', 'miller', 'elara', 'finn'];

function GameLoop() {
  useFrame((_, delta) => tickNPCs(delta));
  return null;
}

function WorldContent() {
  return (
    <>
      {/* Sky & atmosphere */}
      <color attach="background" args={['#7EB5D6']} />
      <fog attach="fog" args={['#9CC8E0', 30, 60]} />

      {/* Lighting: hemisphere fill + warm directional sun */}
      <hemisphereLight args={['#B0D0FF', '#4a6a2a', 0.4]} />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[15, 25, 12]}
        intensity={1.3}
        color="#FFF0D0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      <Terrain />
      <Buildings />
      <PlayerMesh />
      {INITIAL_NPC_IDS.map((id) => (
        <NPCMesh key={id} npcId={id} />
      ))}
      <ThirdPersonCamera />
      <GameLoop />
    </>
  );
}

export function Scene() {
  useEffect(() => startNPCWander(), []);

  return (
    <GameCanvas camera={{ position: [0, 5.5, 13], fov: 55 }} shadows>
      <WorldContent />
    </GameCanvas>
  );
}
