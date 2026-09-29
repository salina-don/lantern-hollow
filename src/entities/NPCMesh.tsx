import React from 'react';
import { Text, Billboard } from '@react-three/drei';
import { useGameStore } from '../state/gameStore';
import { NPC_CONFIG_MAP } from './npcConfig';

interface Props {
  npcId: string;
}

export function NPCMesh({ npcId }: Props) {
  const npc = useGameStore((s) => s.npcs.find((n) => n.id === npcId));
  const isSelected = useGameStore((s) => s.activeConversation === npcId);
  const isNearby = useGameStore((s) => s.nearbyNpcId === npcId);
  const speechBubble = useGameStore((s) => s.npcs.find((n) => n.id === npcId)?.speechBubble ?? null);
  const setActiveConversation = useGameStore((s) => s.setActiveConversation);
  const addLog = useGameStore((s) => s.addLog);

  const talkingToPos = useGameStore((s) => {
    const me = s.npcs.find((n) => n.id === npcId);
    if (!me?.talkingTo) return null;
    return s.npcs.find((n) => n.id === me.talkingTo)?.position ?? null;
  });

  const config = NPC_CONFIG_MAP[npcId];
  if (!npc || !config) return null;

  const [x, y, z] = npc.position;
  const facingY = talkingToPos
    ? Math.atan2(talkingToPos[0] - x, talkingToPos[2] - z)
    : 0;

  const handleClick = () => {
    setActiveConversation(npcId);
    addLog(`You approach ${config.name} the ${config.role}.`);
  };

  return (
    <group position={[x, y, z]} rotation={[0, facingY, 0]}>
      {/* Ground ring: gold when selected, white when nearby, hidden otherwise */}
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

      {/* Body */}
      <mesh position={[0, 0.75, 0]} castShadow onClick={handleClick}>
        <capsuleGeometry args={[0.3, 0.9, 4, 8]} />
        <meshLambertMaterial
          color={config.color}
          emissive={config.color}
          emissiveIntensity={isSelected ? 0.25 : 0}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.72, 0]} castShadow onClick={handleClick}>
        <sphereGeometry args={[0.27, 8, 8]} />
        <meshLambertMaterial color="#F5CBA7" />
      </mesh>

      {/* Speech bubble indicator when talking to another NPC */}
      {npc.isTalking && (
        <mesh position={[0.4, 2.1, 0]}>
          <sphereGeometry args={[0.14, 6, 6]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
      )}

      {/* Speech bubble — fades after 5s via store timer */}
      {speechBubble && (
        <Billboard position={[0, 3.9, 0]}>
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

      {/* Floating label: always faces camera */}
      <Billboard position={[0, 2.65, 0]}>
        {/* Name */}
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
        {/* Role */}
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
        {/* E-to-interact prompt */}
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
