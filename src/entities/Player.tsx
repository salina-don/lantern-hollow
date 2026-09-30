import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Platform } from 'react-native';
import * as THREE from 'three';
import { useGameStore } from '../state/gameStore';
import { cameraYaw } from '../world/cameraState';
import { openItemPopup, showNpcRequest } from '../systems/questSystem';
import { isNPCAtShop, isNPCFrontOfQueue } from '../systems/npcAI';
import { BoxFace } from './BoxFace';
import { joystickInput } from './joystickState';
import { wouldCollide } from '../systems/collision';

const SPEED = 5;
const INTERACT_DIST = 3.2;
const BODY_COLOR = '#3355CC';
const LEG_COLOR = '#222A60';
const SKIN = '#F5CBA7';
const HAIR = '#5a3a1a';
const held: Record<string, boolean> = {};

const BED_POS: [number, number] = [-4, 8.5];
const FOOD_POS: [number, number] = [6, 3.5];
const SPECIAL_R = 2.5;

function findNearestNpc(px: number, pz: number): string | null {
  const npcs = useGameStore.getState().npcs;
  let nearest: string | null = null;
  let best = INTERACT_DIST;
  for (const npc of npcs) {
    const d = Math.sqrt((px - npc.position[0]) ** 2 + (pz - npc.position[2]) ** 2);
    if (d < best) { best = d; nearest = npc.id; }
  }
  return nearest;
}

export function PlayerMesh() {
  const groupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  const initPos = useGameStore.getState().playerPosition;
  const posRef = useRef<[number, number, number]>([...initPos] as [number, number, number]);
  const facingRef = useRef(0);
  const setPlayerPosition = useGameStore((s) => s.setPlayerPosition);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const onDown = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      held[key] = true;

      if (key === 'e') {
        const [px, , pz] = posRef.current;
        const id = findNearestNpc(px, pz);
        if (id) {
          if (!isNPCAtShop(id) || isNPCFrontOfQueue(id)) {
            openItemPopup(id);
          }
        } else {
          const bedD = Math.sqrt((px - BED_POS[0]) ** 2 + (pz - BED_POS[1]) ** 2);
          if (bedD < SPECIAL_R) {
            useGameStore.getState().setIsSleeping(true);
          } else {
            const foodD = Math.sqrt((px - FOOD_POS[0]) ** 2 + (pz - FOOD_POS[1]) ** 2);
            if (foodD < SPECIAL_R) {
              useGameStore.getState().setShowFoodPopup(true);
            }
          }
        }
      }
      if (key === 'f3') {
        e.preventDefault();
        useGameStore.getState().toggleDebug();
      }
    };

    const onUp = (e: KeyboardEvent) => { held[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  useFrame(({ clock }, delta) => {
    const gState = useGameStore.getState();
    if (gState.isSleeping || gState.gameOver) return;

    const [x, y, z] = posRef.current;
    const yaw = cameraYaw.current;
    let dx = 0;
    let dz = 0;

    if (Platform.OS === 'web') {
      if (held['w'] || held['arrowup'])    { dx -= Math.sin(yaw); dz -= Math.cos(yaw); }
      if (held['s'] || held['arrowdown'])  { dx += Math.sin(yaw); dz += Math.cos(yaw); }
      if (held['a'] || held['arrowleft'])  { dx -= Math.cos(yaw); dz += Math.sin(yaw); }
      if (held['d'] || held['arrowright']) { dx += Math.cos(yaw); dz -= Math.sin(yaw); }
    } else {
      const { x: jx, y: jy } = joystickInput.current;
      dx = jy * Math.sin(yaw) + jx * Math.cos(yaw);
      dz = jy * Math.cos(yaw) - jx * Math.sin(yaw);
    }

    const rawLen = Math.sqrt(dx * dx + dz * dz);
    if (rawLen > 0) {
      const move = Math.min(rawLen, 1) * SPEED * delta;
      dx = (dx / rawLen) * move;
      dz = (dz / rawLen) * move;

      let nx = x + dx;
      let nz = z + dz;
      if (wouldCollide(nx, nz)) {
        nx = wouldCollide(x + dx, z) ? x : x + dx;
        nz = wouldCollide(nx, z + dz) ? z : z + dz;
      }

      if (nx !== x || nz !== z) {
        posRef.current = [nx, y, nz];
        setPlayerPosition([nx, y, nz]);
        facingRef.current = Math.atan2(nx - x, nz - z);
      }
    }

    const [cx, , cz] = posRef.current;
    const nearId = findNearestNpc(cx, cz);
    const store = useGameStore.getState();
    if (nearId !== store.nearbyNpcId) {
      store.setNearbyNpc(nearId);
      if (nearId) showNpcRequest(nearId);
    }

    if (groupRef.current) {
      const [nx, , nz] = posRef.current;
      groupRef.current.position.set(nx, y, nz);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        facingRef.current,
        0.2,
      );
    }

    // Minecraft-style limb swing
    const swing = rawLen > 0 ? Math.sin(clock.elapsedTime * 8) * 0.6 : 0;
    if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, swing, 0.12);
    if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -swing, 0.12);
    if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, -swing, 0.12);
    if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, swing, 0.12);
  });

  return (
    <group ref={groupRef} position={[initPos[0], initPos[1], initPos[2]]}>
      {/* Torso */}
      <mesh position={[0, 0.975, 0]} castShadow>
        <boxGeometry args={[0.36, 0.55, 0.22]} />
        <meshLambertMaterial color={BODY_COLOR} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.46, 0]} castShadow>
        <boxGeometry args={[0.42, 0.42, 0.42]} />
        <meshLambertMaterial color={SKIN} />
      </mesh>

      {/* Hair cap */}
      <mesh position={[0, 1.70, 0]} castShadow>
        <boxGeometry args={[0.44, 0.06, 0.44]} />
        <meshLambertMaterial color={HAIR} />
      </mesh>

      <BoxFace />

      {/* Left arm pivot (shoulder) */}
      <group ref={leftArmRef} position={[-0.26, 1.25, 0]}>
        <mesh position={[0, -0.275, 0]} castShadow>
          <boxGeometry args={[0.14, 0.55, 0.14]} />
          <meshLambertMaterial color={BODY_COLOR} />
        </mesh>
      </group>

      {/* Right arm pivot */}
      <group ref={rightArmRef} position={[0.26, 1.25, 0]}>
        <mesh position={[0, -0.275, 0]} castShadow>
          <boxGeometry args={[0.14, 0.55, 0.14]} />
          <meshLambertMaterial color={BODY_COLOR} />
        </mesh>
      </group>

      {/* Left leg pivot (hip) */}
      <group ref={leftLegRef} position={[-0.1, 0.7, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.16, 0.7, 0.17]} />
          <meshLambertMaterial color={LEG_COLOR} />
        </mesh>
      </group>

      {/* Right leg pivot */}
      <group ref={rightLegRef} position={[0.1, 0.7, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.16, 0.7, 0.17]} />
          <meshLambertMaterial color={LEG_COLOR} />
        </mesh>
      </group>
    </group>
  );
}
