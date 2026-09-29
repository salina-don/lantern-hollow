import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Terrain } from './Terrain';
import { Buildings } from './Buildings';
import { PlayerMesh } from '../entities/Player';
import { NPCMesh } from '../entities/NPCMesh';
import { useGameStore } from '../state/gameStore';
import { tickNPCs, startNPCWander } from '../systems/npcAI';

function GameLoop() {
  useFrame((_, delta) => tickNPCs(delta));
  return null;
}

function WorldContent() {
  const npcIds = useGameStore((s) => s.npcs.map((n) => n.id));
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[12, 20, 10]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <Terrain />
      <Buildings />
      <PlayerMesh />
      {npcIds.map((id) => (
        <NPCMesh key={id} npcId={id} />
      ))}
      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 2.4}
        minDistance={6}
        maxDistance={35}
      />
      <GameLoop />
    </>
  );
}

export function Scene() {
  useEffect(() => startNPCWander(), []);

  return (
    <View style={styles.container}>
      <Canvas
        camera={{ position: [0, 16, 16], fov: 50 }}
        shadows
        style={styles.canvas as object}
      >
        <WorldContent />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Cast to object so React Native StyleSheet doesn't reject string values
  // that are valid CSS but not React Native ViewStyle (width/height %)
  canvas: { width: '100%', height: '100%' },
});
