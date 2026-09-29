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
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[12, 22, 10]}
        intensity={1.1}
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
