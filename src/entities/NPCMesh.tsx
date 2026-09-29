import React from 'react';
import { useGameStore } from '../state/gameStore';

const NPC_COLORS: Record<string, string> = {
  alice: '#FF69B4',
  bob: '#FFA500',
  miller: '#32CD32',
};

interface Props {
  npcId: string;
}

export function NPCMesh({ npcId }: Props) {
  const npc = useGameStore((s) => s.npcs.find((n) => n.id === npcId));
  const setActiveConversation = useGameStore((s) => s.setActiveConversation);

  if (!npc) return null;

  const color = NPC_COLORS[npcId] ?? '#FFD700';
  const [x, y, z] = npc.position;

  return (
    <group position={[x, y, z]}>
      {/* Body */}
      <mesh
        position={[0, 0.75, 0]}
        castShadow
        onClick={() => setActiveConversation(npcId)}
      >
        <capsuleGeometry args={[0.3, 0.9, 4, 8]} />
        <meshLambertMaterial color={color} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.28, 8, 8]} />
        <meshLambertMaterial color="#FDBCB4" />
      </mesh>
      {/* Speech ring when talking */}
      {npc.isTalking && (
        <mesh position={[0, 2.2, 0]}>
          <torusGeometry args={[0.22, 0.05, 6, 16]} />
          <meshLambertMaterial color="#FFD700" />
        </mesh>
      )}
    </group>
  );
}
