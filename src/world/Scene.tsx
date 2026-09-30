import React, { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { GameCanvas } from './GameCanvas';
import { Terrain } from './Terrain';
import { Buildings } from './Buildings';
import { PlayerMesh } from '../entities/Player';
import { NPCMesh } from '../entities/NPCMesh';
import { ThirdPersonCamera } from './ThirdPersonCamera';
import { DayNightLighting } from './DayNightLighting';
import { DebugOverlay } from './DebugOverlay';
import { StatsLoop } from './StatsLoop';
import { tickNPCs, startNPCWander } from '../systems/npcAI';
import { useGameStore } from '../state/gameStore';

const INITIAL_NPC_IDS = ['alice', 'bob', 'miller', 'elara', 'finn'];

function GameLoop() {
  useFrame((_, delta) => tickNPCs(delta));
  return null;
}

function WorldContent() {
  return (
    <>
      <DayNightLighting />
      <Terrain />
      <Buildings />
      <PlayerMesh />
      {INITIAL_NPC_IDS.map((id) => (
        <NPCMesh key={id} npcId={id} />
      ))}
      <DebugOverlay />
      <ThirdPersonCamera />
      <GameLoop />
      <StatsLoop />
    </>
  );
}

export function Scene() {
  useEffect(() => {
    const cleanup = startNPCWander();
    setTimeout(() => {
      useGameStore.getState().setQuestPopup({
        title: 'Lantern Hollow',
        text: 'You are the village shopkeeper. Villagers will come to your shop!',
        hint: 'Serve customers, buy food at the stall, sleep at home.',
      });
      setTimeout(() => useGameStore.getState().setQuestPopup(null), 6000);
    }, 1500);
    return cleanup;
  }, []);

  return (
    <GameCanvas camera={{ position: [0, 5.5, 13], fov: 55 }} shadows>
      <WorldContent />
    </GameCanvas>
  );
}
