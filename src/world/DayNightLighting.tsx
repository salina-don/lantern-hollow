import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../state/gameStore';
import { gameTime, getPhase, HOURS_PER_SECOND, GamePhase } from './timeState';
import { triggerNightBehavior, triggerDawnBehavior } from '../systems/npcAI';

interface TimeKey {
  hour: number;
  sky: [number, number, number];
  fog: [number, number, number];
  fogNear: number;
  fogFar: number;
  sunColor: [number, number, number];
  sunIntensity: number;
  ambientIntensity: number;
  hemiIntensity: number;
}

const TIME_KEYS: TimeKey[] = [
  { hour: 0,    sky: [0.04, 0.09, 0.16], fog: [0.04, 0.10, 0.19], fogNear: 15, fogFar: 40, sunColor: [0.38, 0.50, 0.75], sunIntensity: 0.08, ambientIntensity: 0.05, hemiIntensity: 0.08 },
  { hour: 5,    sky: [0.10, 0.12, 0.25], fog: [0.10, 0.12, 0.25], fogNear: 18, fogFar: 45, sunColor: [0.50, 0.56, 0.75], sunIntensity: 0.1,  ambientIntensity: 0.06, hemiIntensity: 0.1  },
  { hour: 6.5,  sky: [0.83, 0.53, 0.42], fog: [0.75, 0.53, 0.41], fogNear: 25, fogFar: 55, sunColor: [1.0,  0.56, 0.38], sunIntensity: 0.6,  ambientIntensity: 0.15, hemiIntensity: 0.25 },
  { hour: 8,    sky: [0.49, 0.71, 0.84], fog: [0.61, 0.78, 0.88], fogNear: 30, fogFar: 60, sunColor: [1.0,  0.94, 0.82], sunIntensity: 1.1,  ambientIntensity: 0.25, hemiIntensity: 0.4  },
  { hour: 12,   sky: [0.49, 0.71, 0.84], fog: [0.61, 0.78, 0.88], fogNear: 30, fogFar: 60, sunColor: [1.0,  0.97, 0.88], sunIntensity: 1.3,  ambientIntensity: 0.3,  hemiIntensity: 0.4  },
  { hour: 17,   sky: [0.56, 0.69, 0.78], fog: [0.63, 0.72, 0.78], fogNear: 28, fogFar: 55, sunColor: [1.0,  0.88, 0.63], sunIntensity: 1.0,  ambientIntensity: 0.25, hemiIntensity: 0.35 },
  { hour: 19,   sky: [0.82, 0.50, 0.31], fog: [0.75, 0.50, 0.38], fogNear: 22, fogFar: 50, sunColor: [1.0,  0.44, 0.19], sunIntensity: 0.5,  ambientIntensity: 0.12, hemiIntensity: 0.2  },
  { hour: 20.5, sky: [0.16, 0.09, 0.22], fog: [0.13, 0.08, 0.19], fogNear: 15, fogFar: 42, sunColor: [0.50, 0.38, 0.63], sunIntensity: 0.15, ambientIntensity: 0.06, hemiIntensity: 0.1  },
  { hour: 22,   sky: [0.04, 0.09, 0.16], fog: [0.04, 0.10, 0.19], fogNear: 15, fogFar: 40, sunColor: [0.38, 0.50, 0.75], sunIntensity: 0.08, ambientIntensity: 0.05, hemiIntensity: 0.08 },
  { hour: 24,   sky: [0.04, 0.09, 0.16], fog: [0.04, 0.10, 0.19], fogNear: 15, fogFar: 40, sunColor: [0.38, 0.50, 0.75], sunIntensity: 0.08, ambientIntensity: 0.05, hemiIntensity: 0.08 },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function getTimeValues(hour: number) {
  for (let i = 0; i < TIME_KEYS.length - 1; i++) {
    const a = TIME_KEYS[i];
    const b = TIME_KEYS[i + 1];
    if (hour >= a.hour && hour <= b.hour) {
      const t = (hour - a.hour) / (b.hour - a.hour);
      return {
        sky: [lerp(a.sky[0], b.sky[0], t), lerp(a.sky[1], b.sky[1], t), lerp(a.sky[2], b.sky[2], t)] as [number, number, number],
        fog: [lerp(a.fog[0], b.fog[0], t), lerp(a.fog[1], b.fog[1], t), lerp(a.fog[2], b.fog[2], t)] as [number, number, number],
        fogNear: lerp(a.fogNear, b.fogNear, t),
        fogFar: lerp(a.fogFar, b.fogFar, t),
        sunColor: [lerp(a.sunColor[0], b.sunColor[0], t), lerp(a.sunColor[1], b.sunColor[1], t), lerp(a.sunColor[2], b.sunColor[2], t)] as [number, number, number],
        sunIntensity: lerp(a.sunIntensity, b.sunIntensity, t),
        ambientIntensity: lerp(a.ambientIntensity, b.ambientIntensity, t),
        hemiIntensity: lerp(a.hemiIntensity, b.hemiIntensity, t),
      };
    }
  }
  const k = TIME_KEYS[0];
  return {
    sky: k.sky, fog: k.fog, fogNear: k.fogNear, fogFar: k.fogFar,
    sunColor: k.sunColor, sunIntensity: k.sunIntensity,
    ambientIntensity: k.ambientIntensity, hemiIntensity: k.hemiIntensity,
  };
}

export function DayNightLighting() {
  const { scene } = useThree();
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const lastPhase = useRef<GamePhase>('morning');

  useEffect(() => {
    scene.fog = new THREE.Fog('#9CC8E0', 30, 60);
    scene.background = new THREE.Color(0.49, 0.71, 0.84);
    return () => {
      scene.fog = null;
      scene.background = null;
    };
  }, [scene]);

  useFrame((_, delta) => {
    gameTime.current = (gameTime.current + delta * HOURS_PER_SECOND) % 24;

    const phase = getPhase(gameTime.current);
    if (phase !== lastPhase.current) {
      const prev = lastPhase.current;
      lastPhase.current = phase;
      useGameStore.getState().setGamePhase(phase);

      if (phase === 'dusk') {
        useGameStore.getState().addLog('The sun begins to set. Villagers head to the tavern.');
        triggerNightBehavior();
      } else if (phase === 'dawn' && prev === 'night') {
        useGameStore.getState().addLog('Dawn breaks over Lantern Hollow.');
        triggerDawnBehavior();
      }
    }

    const hour = gameTime.current;
    const v = getTimeValues(hour);

    if (scene.background instanceof THREE.Color) {
      scene.background.setRGB(v.sky[0], v.sky[1], v.sky[2]);
    }

    const fog = scene.fog as THREE.Fog | null;
    if (fog) {
      fog.color.setRGB(v.fog[0], v.fog[1], v.fog[2]);
      fog.near = v.fogNear;
      fog.far = v.fogFar;
    }

    if (sunRef.current) {
      sunRef.current.color.setRGB(v.sunColor[0], v.sunColor[1], v.sunColor[2]);
      sunRef.current.intensity = v.sunIntensity;
      const sunAngle = ((hour - 6) / 12) * Math.PI;
      sunRef.current.position.set(
        Math.cos(sunAngle) * 15,
        Math.max(Math.sin(sunAngle) * 25, 2),
        12,
      );
    }

    if (ambientRef.current) ambientRef.current.intensity = v.ambientIntensity;
    if (hemiRef.current) hemiRef.current.intensity = v.hemiIntensity;
  });

  return (
    <>
      <hemisphereLight ref={hemiRef} args={['#B0D0FF', '#4a6a2a', 0.4]} />
      <ambientLight ref={ambientRef} intensity={0.3} />
      <directionalLight
        ref={sunRef}
        position={[15, 25, 12]}
        intensity={1.3}
        color="#FFF0D0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
    </>
  );
}
