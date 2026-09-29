import { useGameStore, Vec3 } from '../state/gameStore';
import { randomLocation } from '../world/locations';
import { npcToNPCExchange } from './conversationSystem';

const NPC_SPEED = 2.5;
const TALK_DIST = 2.2;
const ARRIVE_DIST = 0.15;
const WANDER_BASE_MS = 8000;

function dist2D(a: Vec3, b: Vec3): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[2] - b[2]) ** 2);
}

// Called every frame from useFrame — moves NPCs toward their targets
export function tickNPCs(delta: number): void {
  const store = useGameStore.getState();
  for (const npc of store.npcs) {
    // Following: update target to stay near the player
    if (npc.following === 'player') {
      const playerPos = store.playerPosition;
      const d = dist2D(npc.position, playerPos);
      if (d > 2.2) {
        const angle = Math.atan2(npc.position[0] - playerPos[0], npc.position[2] - playerPos[2]);
        const target: Vec3 = [
          playerPos[0] + Math.sin(angle) * 1.5,
          0,
          playerPos[2] + Math.cos(angle) * 1.5,
        ];
        if (!npc.targetPosition || dist2D(npc.targetPosition, target) > 0.4) {
          store.moveNPC(npc.id, target);
        }
      } else if (npc.targetPosition) {
        store.moveNPC(npc.id, null);
      }
    }

    if (!npc.targetPosition) continue;
    const d = dist2D(npc.position, npc.targetPosition);
    if (d < ARRIVE_DIST) {
      store.updateNPCPosition(npc.id, npc.targetPosition);
      store.moveNPC(npc.id, null);
      continue;
    }
    const step = Math.min(NPC_SPEED * delta, d);
    const t = step / d;
    const nx = npc.position[0] + (npc.targetPosition[0] - npc.position[0]) * t;
    const nz = npc.position[2] + (npc.targetPosition[2] - npc.position[2]) * t;
    store.updateNPCPosition(npc.id, [nx, 0, nz]);
  }
}

// Periodically check if two NPCs are close enough to share a rumor
function checkInteractions(): void {
  const store = useGameStore.getState();
  const npcs = store.npcs;
  for (let i = 0; i < npcs.length; i++) {
    for (let j = i + 1; j < npcs.length; j++) {
      const a = npcs[i];
      const b = npcs[j];
      if (a.isTalking || b.isTalking) continue;
      if (dist2D(a.position, b.position) > TALK_DIST) continue;

      // Share a random memory from whichever NPC has one
      const donor = a.memory.length >= b.memory.length ? a : b;
      const receiver = donor.id === a.id ? b : a;
      if (donor.memory.length === 0) continue;
      const rumor = donor.memory[Math.floor(Math.random() * donor.memory.length)];
      const alreadyKnows = receiver.memory.some((m) => m.fact === rumor.fact);
      if (alreadyKnows) continue;

      store.setNPCTalking(donor.id, receiver.id);
      store.setNPCTalking(receiver.id, donor.id);
      npcToNPCExchange(donor.id, receiver.id, rumor.fact);

      setTimeout(() => {
        useGameStore.getState().setNPCTalking(donor.id, null);
        useGameStore.getState().setNPCTalking(receiver.id, null);
      }, 3000);
    }
  }
}

// Starts autonomous NPC wandering; returns cleanup
export function startNPCWander(): () => void {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  function scheduleWander(npcId: string, delay: number): void {
    timers.set(
      npcId,
      setTimeout(() => {
        const store = useGameStore.getState();
        const npc = store.npcs.find((n) => n.id === npcId);
        if (npc && !npc.isTalking && !npc.following) {
          const loc = randomLocation();
          store.moveNPC(npcId, loc.position);
          store.setNPCActivity(npcId, `heading to ${loc.name}`);
        }
        scheduleWander(npcId, WANDER_BASE_MS + Math.random() * 5000);
      }, delay),
    );
  }

  const store = useGameStore.getState();
  for (const npc of store.npcs) {
    scheduleWander(npc.id, Math.random() * WANDER_BASE_MS);
  }

  const interactionInterval = setInterval(checkInteractions, 4000);

  return () => {
    timers.forEach((t) => clearTimeout(t));
    timers.clear();
    clearInterval(interactionInterval);
  };
}
