import { useGameStore, Vec3 } from '../state/gameStore';
import { NPC_CONFIG_MAP } from '../entities/npcConfig';
import { randomLocation } from '../world/locations';

const NPC_SPEED = 2.5;
const TALK_DIST = 2.2;
const ARRIVE_DIST = 0.15;
const WANDER_BASE_MS = 8000;

function dist2D(a: Vec3, b: Vec3): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[2] - b[2]) ** 2);
}

// Personality lines for sharing / receiving a rumor
const SHARE_LINES: Record<string, string> = {
  alice: 'Oh, you simply must hear this — {fact}!',
  bob: 'Word is: {fact}.',
  miller: 'Oh oh, have you heard?! {fact}!',
  elara: 'The winds carry word that {fact}.',
  finn: 'Report: {fact}.',
};
const RECEIVE_LINES: Record<string, string> = {
  alice: "Oh my, really?! I had no idea!",
  bob: 'Hm. Noted.',
  miller: "You don't say! How fascinating!",
  elara: "So the patterns shift...",
  finn: "Understood. Logged.",
};

function shareLine(npcId: string, fact: string): string {
  const tmpl = SHARE_LINES[npcId] ?? 'Did you hear? {fact}.';
  return tmpl.replace('{fact}', fact);
}
function receiveLine(npcId: string): string {
  return RECEIVE_LINES[npcId] ?? "I hadn't heard that.";
}

function scheduleBubble(npcId: string, text: string, delayMs = 0): void {
  setTimeout(() => {
    useGameStore.getState().setSpeechBubble(npcId, text);
    setTimeout(() => {
      useGameStore.getState().setSpeechBubble(npcId, null);
    }, 4000);
  }, delayMs);
}

// Called every frame — moves NPCs, handles follow + pending deliveries
export function tickNPCs(delta: number): void {
  const store = useGameStore.getState();
  for (const npc of store.npcs) {
    // ── follow mode ──────────────────────────────────────────────────────────
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

    // ── pending delivery arrival check ───────────────────────────────────────
    if (npc.pendingDelivery && !npc.isTalking) {
      const { toNpcId, rumorId, message } = npc.pendingDelivery;
      const target = store.npcs.find((n) => n.id === toNpcId);
      if (target && dist2D(npc.position, target.position) <= TALK_DIST) {
        // Arrived — clear delivery, start talking, spread rumor, show bubbles
        store.setPendingDelivery(npc.id, null);
        store.moveNPC(npc.id, null);
        store.setNPCTalking(npc.id, toNpcId);
        store.setNPCTalking(toNpcId, npc.id);
        store.spreadRumor(rumorId, toNpcId);

        const senderCfg = NPC_CONFIG_MAP[npc.id];
        const receiverCfg = NPC_CONFIG_MAP[toNpcId];
        store.addLog(`${senderCfg?.name ?? npc.id} delivers: "${message}" → ${receiverCfg?.name ?? toNpcId}`);

        scheduleBubble(npc.id, `${receiverCfg?.name ?? 'hey'}, ${message}`);
        scheduleBubble(toNpcId, receiveLine(toNpcId), 2500);

        setTimeout(() => {
          useGameStore.getState().setNPCTalking(npc.id, null);
          useGameStore.getState().setNPCTalking(toNpcId, null);
          useGameStore.getState().setNPCActivity(npc.id, 'delivered message');
        }, 6000);
      }
    }

    // ── movement ─────────────────────────────────────────────────────────────
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

// ── NPC rumor exchange ────────────────────────────────────────────────────────

function checkInteractions(): void {
  const store = useGameStore.getState();
  const npcs = store.npcs;

  for (let i = 0; i < npcs.length; i++) {
    for (let j = i + 1; j < npcs.length; j++) {
      const a = npcs[i];
      const b = npcs[j];
      if (a.isTalking || b.isTalking) continue;
      if (a.following || b.following) continue;
      if (dist2D(a.position, b.position) > TALK_DIST) continue;

      // Find a rumor A knows that B doesn't
      const rumorToShare = Object.values(store.rumors).find(
        (r) => r.knownBy.includes(a.id) && !r.knownBy.includes(b.id),
      ) ?? Object.values(store.rumors).find(
        (r) => r.knownBy.includes(b.id) && !r.knownBy.includes(a.id),
      );

      if (!rumorToShare) continue;

      const donor = rumorToShare.knownBy.includes(a.id) ? a : b;
      const receiver = donor.id === a.id ? b : a;

      store.setNPCTalking(donor.id, receiver.id);
      store.setNPCTalking(receiver.id, donor.id);
      store.spreadRumor(rumorToShare.id, receiver.id);

      const donorCfg = NPC_CONFIG_MAP[donor.id];
      const receiverCfg = NPC_CONFIG_MAP[receiver.id];
      store.addLog(
        `${donorCfg?.name ?? donor.id} tells ${receiverCfg?.name ?? receiver.id}: "${rumorToShare.text}"`,
      );

      scheduleBubble(donor.id, shareLine(donor.id, rumorToShare.text));
      scheduleBubble(receiver.id, receiveLine(receiver.id), 3000);

      const dId = donor.id;
      const rId = receiver.id;
      setTimeout(() => {
        useGameStore.getState().setNPCTalking(dId, null);
        useGameStore.getState().setNPCTalking(rId, null);
      }, 6500);

      break; // one exchange per tick
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
        if (npc && !npc.isTalking && !npc.following && !npc.pendingDelivery) {
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
