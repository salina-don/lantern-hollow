import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Billboard } from '@react-three/drei';
import { useGameStore } from '../state/gameStore';
import { NPC_CONFIG_MAP } from './npcConfig';
import { openItemPopup } from '../systems/questSystem';
import { BoxFace } from './BoxFace';

const SKIN = '#F5CBA7';

function darkenHex(hex: string, f = 0.6): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 0xff) * f);
  const g = Math.round(((n >> 8) & 0xff) * f);
  const b = Math.round((n & 0xff) * f);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function RoleAccessory({ npcId }: { npcId: string }) {
  switch (npcId) {
    case 'alice':
      return (
        <mesh position={[0, 1.72, -0.15]} castShadow>
          <boxGeometry args={[0.14, 0.14, 0.14]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
      );
    case 'bob':
      return (
        <mesh position={[0, 1.70, 0]} castShadow>
          <boxGeometry args={[0.44, 0.06, 0.44]} />
          <meshLambertMaterial color="#3a2a18" />
        </mesh>
      );
    case 'miller':
      return (
        <mesh position={[0, 1.80, 0]} castShadow>
          <boxGeometry args={[0.28, 0.25, 0.28]} />
          <meshLambertMaterial color="#F0E8D0" />
        </mesh>
      );
    case 'elara':
      return (
        <mesh position={[0, 1.88, 0]} castShadow>
          <coneGeometry args={[0.22, 0.5, 4]} />
          <meshLambertMaterial color="#6a3a8a" flatShading />
        </mesh>
      );
    case 'finn':
      return (
        <mesh position={[0, 1.64, 0]} castShadow>
          <boxGeometry args={[0.46, 0.22, 0.46]} />
          <meshLambertMaterial color="#6a7080" />
        </mesh>
      );
    default:
      return null;
  }
}

const DUST_COUNT = 4;

function DustPuff({ movingRef }: { movingRef: React.RefObject<boolean> }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const offsets = useMemo(
    () => Array.from({ length: DUST_COUNT }, () => Math.random() * Math.PI * 2),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (let i = 0; i < DUST_COUNT; i++) {
      const m = refs.current[i];
      if (!m) continue;
      if (!movingRef.current) {
        m.visible = false;
        continue;
      }
      m.visible = true;
      const p = ((t * 1.5 + offsets[i]) % 1.5);
      m.position.x = Math.sin(offsets[i] + t) * 0.2;
      m.position.z = Math.cos(offsets[i] + t * 0.8) * 0.2;
      m.position.y = p * 0.3;
      const s = 0.04 + p * 0.04;
      m.scale.setScalar(s);
      (m.material as THREE.MeshBasicMaterial).opacity = 0.35 * (1 - p / 1.5);
    }
  });

  return (
    <group position={[0, 0.05, 0]}>
      {offsets.map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }} visible={false}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#b0a080" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

interface Props { npcId: string }

export function NPCMesh({ npcId }: Props) {
  const npc = useGameStore((s) => s.npcs.find((n) => n.id === npcId));
  const isSelected = useGameStore((s) => s.activeConversation === npcId);
  const isNearby = useGameStore((s) => s.nearbyNpcId === npcId);
  const speechBubble = useGameStore((s) => s.npcs.find((n) => n.id === npcId)?.speechBubble ?? null);
  const emotion = useGameStore((s) => s.npcs.find((n) => n.id === npcId)?.emotion ?? 'neutral');

  const talkingToPos = useGameStore((s) => {
    const me = s.npcs.find((n) => n.id === npcId);
    if (!me?.talkingTo) return null;
    return s.npcs.find((n) => n.id === me.talkingTo)?.position ?? null;
  });

  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const prevXZ = useRef<[number, number]>([0, 0]);
  const isMoving = useRef(false);

  const config = NPC_CONFIG_MAP[npcId];

  // Per-NPC phase offset so they don't all swing in sync
  const phase = npcId.charCodeAt(0) + npcId.charCodeAt(npcId.length - 1);

  useFrame(({ clock }) => {
    const cur = useGameStore.getState().npcs.find((n) => n.id === npcId);
    if (!cur) return;

    const dx = cur.position[0] - prevXZ.current[0];
    const dz = cur.position[2] - prevXZ.current[1];
    const moving = Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001;
    isMoving.current = moving;
    prevXZ.current = [cur.position[0], cur.position[2]];

    const swing = moving ? Math.sin(clock.elapsedTime * 8 + phase) * 0.6 : 0;
    if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, swing, 0.12);
    if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -swing, 0.12);
    if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, -swing, 0.12);
    if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, swing, 0.12);
  });

  if (!npc || !config) return null;

  const [x, y, z] = npc.position;
  const facingY = talkingToPos
    ? Math.atan2(talkingToPos[0] - x, talkingToPos[2] - z)
    : 0;

  const handleClick = () => openItemPopup(npcId);

  const color = config.color;
  const legColor = darkenHex(color);
  const em = isSelected ? 0.25 : 0;
  const emLeg = isSelected ? 0.15 : 0;

  return (
    <group position={[x, y, z]} rotation={[0, facingY, 0]}>
      {/* Selection / proximity ring */}
      {(isSelected || isNearby) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.52, 0.72, 24]} />
          <meshBasicMaterial
            color={isSelected ? '#FFD700' : '#ffffff'}
            transparent
            opacity={isSelected ? 0.85 : 0.5}
          />
        </mesh>
      )}

      {/* Torso */}
      <mesh position={[0, 0.975, 0]} castShadow onClick={handleClick}>
        <boxGeometry args={[0.36, 0.55, 0.22]} />
        <meshLambertMaterial color={color} emissive={color} emissiveIntensity={em} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.46, 0]} castShadow onClick={handleClick}>
        <boxGeometry args={[0.42, 0.42, 0.42]} />
        <meshLambertMaterial color={SKIN} />
      </mesh>

      <BoxFace emotion={emotion} />

      {/* Left arm pivot */}
      <group ref={leftArmRef} position={[-0.26, 1.25, 0]}>
        <mesh position={[0, -0.275, 0]} castShadow onClick={handleClick}>
          <boxGeometry args={[0.14, 0.55, 0.14]} />
          <meshLambertMaterial color={color} emissive={color} emissiveIntensity={em} />
        </mesh>
      </group>

      {/* Right arm pivot */}
      <group ref={rightArmRef} position={[0.26, 1.25, 0]}>
        <mesh position={[0, -0.275, 0]} castShadow onClick={handleClick}>
          <boxGeometry args={[0.14, 0.55, 0.14]} />
          <meshLambertMaterial color={color} emissive={color} emissiveIntensity={em} />
        </mesh>
      </group>

      {/* Left leg pivot */}
      <group ref={leftLegRef} position={[-0.1, 0.7, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow onClick={handleClick}>
          <boxGeometry args={[0.16, 0.7, 0.17]} />
          <meshLambertMaterial color={legColor} emissive={color} emissiveIntensity={emLeg} />
        </mesh>
      </group>

      {/* Right leg pivot */}
      <group ref={rightLegRef} position={[0.1, 0.7, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow onClick={handleClick}>
          <boxGeometry args={[0.16, 0.7, 0.17]} />
          <meshLambertMaterial color={legColor} emissive={color} emissiveIntensity={emLeg} />
        </mesh>
      </group>

      {/* Role-specific accessory */}
      <RoleAccessory npcId={npcId} />

      {/* Dust puff when walking */}
      <DustPuff movingRef={isMoving} />

      {/* Talking indicator */}
      {npc.isTalking && (
        <mesh position={[0.4, 2.1, 0]}>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
      )}

      {/* Speech bubble */}
      {speechBubble && (
        <Billboard position={[0, 3.5, 0]}>
          <Text
            fontSize={0.28}
            color="#FFFDE7"
            anchorX="center"
            anchorY="middle"
            maxWidth={3.5}
            textAlign="center"
            outlineWidth={0.06}
            outlineColor="#1a0800"
          >
            {`"${speechBubble}"`}
          </Text>
        </Billboard>
      )}

      {/* Floating label */}
      <Billboard position={[0, 2.4, 0]}>
        <Text
          fontSize={0.38}
          color="#ffffff"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.05}
          outlineColor="#000000"
          position={[0, 0.2, 0]}
        >
          {config.name}
        </Text>
        <Text
          fontSize={0.24}
          color="#dddddd"
          anchorX="center"
          anchorY="top"
          outlineWidth={0.03}
          outlineColor="#000000"
          position={[0, 0.14, 0]}
        >
          {config.role}
        </Text>
        {isNearby && !isSelected && (
          <Text
            fontSize={0.22}
            color="#FFD700"
            anchorX="center"
            anchorY="top"
            outlineWidth={0.03}
            outlineColor="#000000"
            position={[0, -0.15, 0]}
          >
            Press E
          </Text>
        )}
      </Billboard>
    </group>
  );
}
