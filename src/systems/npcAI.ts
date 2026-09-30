import { useGameStore, Vec3 } from '../state/gameStore';
import { NPC_CONFIG_MAP } from '../entities/npcConfig';
import { Location, randomLocation, LOCATIONS } from '../world/locations';
import { gameTime, isNight } from '../world/timeState';
import { findPath } from './pathfinding';
import { wouldCollide } from './collision';
import { showNpcRequest } from './questSystem';
import { QUEST_BY_NPC } from './itemData';

const NPC_SPEED = 2.5;
const NPC_RADIUS = 0.3;
const TALK_DIST = 2.2;
const ARRIVE_DIST = 0.15;
const WANDER_BASE_MS = 3000;

interface DoorPos { id: string; x: number; z: number }
const BUILDING_DOORS: DoorPos[] = [
  { id: 'tavern', x: 8 - 4 * 0.12, z: 5 - 3.5 / 2 },
  { id: 'bakery', x: -8 - 4 * 0.12, z: 5 - 3 / 2 },
  { id: 'forge', x: 8 - 3 * 0.12, z: -6 - 3 / 2 },
  { id: 'player_house', x: -4 - 3 * 0.12, z: 8 - 2.5 / 2 },
];
const DOOR_OPEN_DIST = 1.8;
const DOOR_CLOSE_DIST = 3.0;
const npcNearDoor = new Map<string, string>();

const SHOP_SPOTS: Vec3[] = [
  [-0.2, 0, 0.6],
  [0.15, 0, -0.2],
  [-0.1, 0, -1.0],
  [0.2, 0, -1.8],
  [-0.15, 0, -2.6],
];

const shopVisitors = new Map<string, 'visiting' | 'waiting'>();
const shopSpotAssignment = new Map<string, number>();
const lastBubbleRefresh = new Map<string, number>();
const servedToday = new Set<string>();
let nextVisitTimer: ReturnType<typeof setTimeout> | null = null;

function sendNextNPC(): void {
  if (nextVisitTimer !== null) { clearTimeout(nextVisitTimer); nextVisitTimer = null; }
  nextVisitTimer = setTimeout(() => {
    nextVisitTimer = null;
    const s = useGameStore.getState();
    if (s.isSleeping || s.gameOver || isNight(gameTime.current)) return;
    if (shopVisitors.size > 0) return;
    const candidates = s.npcs.filter((n) => {
      if (shopVisitors.has(n.id) || n.isTalking || n.following || n.pendingDelivery) return false;
      if (servedToday.has(n.id)) return false;
      const quest = QUEST_BY_NPC[n.id];
      if (quest && (s.quests[quest.id] ?? 0) >= 1) return false;
      return true;
    });
    if (candidates.length > 0) {
      const npc = candidates[Math.floor(Math.random() * candidates.length)];
      shopSpotAssignment.clear();
      shopSpotAssignment.set(npc.id, 0);
      shopVisitors.clear();
      shopVisitors.set(npc.id, 'visiting');
      moveNPCTo(npc.id, SHOP_SPOTS[0]);
      const cfg = NPC_CONFIG_MAP[npc.id];
      s.setNPCActivity(npc.id, 'heading to the shop');
      s.addLog(`${cfg?.name ?? npc.id} is coming to your shop!`);
    }
  }, 5000);
}

function nextFreeSpot(): number {
  const taken = new Set(shopSpotAssignment.values());
  for (let i = 0; i < SHOP_SPOTS.length; i++) {
    if (!taken.has(i)) return i;
  }
  return -1;
}

export function isNPCAtShop(npcId: string): boolean {
  return shopVisitors.has(npcId);
}

export function isNPCFrontOfQueue(npcId: string): boolean {
  return shopVisitors.has(npcId) && shopSpotAssignment.get(npcId) === 0;
}

function randomLocationAwayFromShop(): Location {
  const locs = Object.values(LOCATIONS).filter((l) => l.name !== 'Town Square');
  return locs[Math.floor(Math.random() * locs.length)];
}

export function markNPCServed(npcId: string): void {
  shopVisitors.delete(npcId);
  shopSpotAssignment.delete(npcId);
  lastBubbleRefresh.delete(npcId);
  servedToday.add(npcId);
  const cfg = NPC_CONFIG_MAP[npcId];
  const homeLoc = cfg ? LOCATIONS[cfg.homeLocation] : null;
  const loc = homeLoc ?? randomLocationAwayFromShop();
  moveNPCTo(npcId, [...loc.position] as Vec3);
  const store = useGameStore.getState();
  store.setNPCActivity(npcId, 'leaving the shop');
  store.setNPCEmotion(npcId, 'happy');
  setTimeout(() => {
    useGameStore.getState().setNPCEmotion(npcId, 'neutral');
  }, 4000);

  sendNextNPC();
}


const TAVERN_SPOTS: Vec3[] = [
  [7, 0, 4.5],
  [8.5, 0, 5.5],
  [9, 0, 4.5],
  [7.5, 0, 5.5],
  [9, 0, 5.5],
];

const NIGHT_LINES: Record<string, string> = {
  alice: 'Time to close up. Good night!',
  bob: "Long day at the forge. Time for bed.",
  miller: 'Off to bed. Early morning tomorrow!',
  elara: 'The stars watch over us. Good night.',
  finn: 'Night watch is set. Heading in.',
};

const HOME_DOOR: Record<string, string> = {
  tavern: 'tavern',
  forge: 'forge',
  bakery: 'bakery',
};

const MORNING_LINES: Record<string, string> = {
  alice: 'Another beautiful morning in the Hollow!',
  bob: 'Back to the forge. Iron waits for no one.',
  miller: 'Time to get the ovens going!',
  elara: 'The morning dew holds many secrets...',
  finn: 'Dawn watch begins. All clear.',
};

const BLOCKED_LINES: Record<string, string> = {
  alice: "Oh dear, I can't seem to find a way there!",
  bob: "Path's blocked. Not going anywhere.",
  miller: "Goodness, I can't get through!",
  elara: 'The way is shrouded... I cannot pass.',
  finn: 'Route obstructed. Cannot proceed.',
};

const MIN_NPC_DIST = 0.6;

function dist2D(a: Vec3, b: Vec3): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[2] - b[2]) ** 2);
}

function wouldCollideNPC(nx: number, nz: number, myId: string): boolean {
  const npcs = useGameStore.getState().npcs;
  for (const other of npcs) {
    if (other.id === myId) continue;
    const dx = nx - other.position[0];
    const dz = nz - other.position[2];
    if (dx * dx + dz * dz < MIN_NPC_DIST * MIN_NPC_DIST) return true;
  }
  return false;
}

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

export function blockedReply(npcId: string): string {
  return BLOCKED_LINES[npcId] ?? "I can't find a way there.";
}

export function moveNPCTo(npcId: string, dest: Vec3): boolean {
  const store = useGameStore.getState();
  const npc = store.npcs.find((n) => n.id === npcId);
  if (!npc) return false;
  const path = findPath(npc.position[0], npc.position[2], dest[0], dest[2]);
  if (!path || path.length === 0) return false;
  store.setNPCPath(npcId, path);
  return true;
}

export function tickNPCs(delta: number): void {
  const store = useGameStore.getState();
  for (const npc of store.npcs) {
    // ── shop arrival + waiting ──
    if (shopVisitors.get(npc.id) === 'visiting' && npc.path.length === 0 && !npc.targetPosition) {
      shopVisitors.set(npc.id, 'waiting');
      const isFirst = shopSpotAssignment.get(npc.id) === 0;
      if (isFirst) {
        showNpcRequest(npc.id);
        lastBubbleRefresh.set(npc.id, Date.now());
      }
      store.setNPCActivity(npc.id, 'waiting at the shop');
      store.setNPCEmotion(npc.id, 'waiting');
    }
    if (shopVisitors.get(npc.id) === 'waiting') {
      const isFirst = shopSpotAssignment.get(npc.id) === 0;
      if (isFirst) {
        const now = Date.now();
        if (!npc.speechBubble && now - (lastBubbleRefresh.get(npc.id) ?? 0) > 4500) {
          showNpcRequest(npc.id);
          lastBubbleRefresh.set(npc.id, now);
        }
      }
      continue;
    }

    // ── follow mode ──
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

    // ── pending delivery arrival check ──
    if (npc.pendingDelivery && !npc.isTalking) {
      const { toNpcId, rumorId, message } = npc.pendingDelivery;
      const target = store.npcs.find((n) => n.id === toNpcId);
      if (target && dist2D(npc.position, target.position) <= TALK_DIST) {
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

    // ── path-based movement ──
    if (npc.path.length > 0) {
      const wp = npc.path[0];
      const d = dist2D(npc.position, wp);
      if (d < ARRIVE_DIST) {
        store.updateNPCPosition(npc.id, wp);
        store.shiftNPCPath(npc.id);
      } else {
        const step = Math.min(NPC_SPEED * delta, d);
        const t = step / d;
        let nx = npc.position[0] + (wp[0] - npc.position[0]) * t;
        let nz = npc.position[2] + (wp[2] - npc.position[2]) * t;
        if (wouldCollide(nx, nz, NPC_RADIUS, true)) {
          const dx = nx - npc.position[0];
          const dz = nz - npc.position[2];
          nx = wouldCollide(npc.position[0] + dx, npc.position[2], NPC_RADIUS, true) ? npc.position[0] : npc.position[0] + dx;
          nz = wouldCollide(nx, npc.position[2] + dz, NPC_RADIUS, true) ? npc.position[2] : npc.position[2] + dz;
        }
        if (!wouldCollideNPC(nx, nz, npc.id)) {
          store.updateNPCPosition(npc.id, [nx, 0, nz]);
        }
      }
      continue;
    }

    // ── direct movement (follow mode) ──
    if (!npc.targetPosition) continue;
    const d = dist2D(npc.position, npc.targetPosition);
    if (d < ARRIVE_DIST) {
      store.updateNPCPosition(npc.id, npc.targetPosition);
      store.moveNPC(npc.id, null);
      continue;
    }
    const step = Math.min(NPC_SPEED * delta, d);
    const t = step / d;
    let nx = npc.position[0] + (npc.targetPosition[0] - npc.position[0]) * t;
    let nz = npc.position[2] + (npc.targetPosition[2] - npc.position[2]) * t;
    if (wouldCollide(nx, nz, NPC_RADIUS, true)) {
      const dx = nx - npc.position[0];
      const dz = nz - npc.position[2];
      nx = wouldCollide(npc.position[0] + dx, npc.position[2], NPC_RADIUS, true) ? npc.position[0] : npc.position[0] + dx;
      nz = wouldCollide(nx, npc.position[2] + dz, NPC_RADIUS, true) ? npc.position[2] : npc.position[2] + dz;
    }
    if (!wouldCollideNPC(nx, nz, npc.id)) {
      store.updateNPCPosition(npc.id, [nx, 0, nz]);
    }
  }

  // ── NPC door open/close ──
  for (const npc of store.npcs) {
    const pos = npc.position;
    let nearestDoor: DoorPos | null = null;
    let nearestDist = Infinity;
    for (const dp of BUILDING_DOORS) {
      const dd = Math.sqrt((pos[0] - dp.x) ** 2 + (pos[2] - dp.z) ** 2);
      if (dd < nearestDist) { nearestDist = dd; nearestDoor = dp; }
    }
    const prevDoor = npcNearDoor.get(npc.id);
    if (nearestDoor && nearestDist < DOOR_OPEN_DIST && !store.doors[nearestDoor.id]) {
      store.toggleDoor(nearestDoor.id);
      npcNearDoor.set(npc.id, nearestDoor.id);
    } else if (prevDoor && nearestDist > DOOR_CLOSE_DIST && store.doors[prevDoor]) {
      const othersNear = [...npcNearDoor.entries()].some(
        ([id, did]) => id !== npc.id && did === prevDoor,
      );
      if (!othersNear) store.toggleDoor(prevDoor);
      npcNearDoor.delete(npc.id);
    }
  }
}

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

      break;
    }
  }
}

export function triggerNightBehavior(): void {
  const store = useGameStore.getState();

  const unserved = store.npcs.filter((npc) => {
    const quest = QUEST_BY_NPC[npc.id];
    if (!quest) return false;
    if ((store.quests[quest.id] ?? 0) >= 1) return false;
    return !servedToday.has(npc.id);
  });

  shopVisitors.clear();
  shopSpotAssignment.clear();

  store.npcs.forEach((npc, i) => {
    if (npc.following || npc.isTalking || npc.pendingDelivery) return;
    const config = NPC_CONFIG_MAP[npc.id];
    if (!config) return;
    const homeLoc = LOCATIONS[config.homeLocation];
    if (!homeLoc) return;
    const dest = [...homeLoc.position] as Vec3;
    if (!moveNPCTo(npc.id, dest)) {
      store.moveNPC(npc.id, dest);
    }

    const isUnserved = unserved.some((u) => u.id === npc.id);
    if (isUnserved) {
      store.setNPCEmotion(npc.id, 'waiting');
      store.setNPCActivity(npc.id, 'leaving angry');
      setTimeout(() => {
        const s = useGameStore.getState();
        s.setSpeechBubble(npc.id, 'You never helped me!');
        setTimeout(() => useGameStore.getState().setSpeechBubble(npc.id, null), 3000);
      }, i * 800);
    } else {
      store.setNPCActivity(npc.id, 'going home to sleep');
      setTimeout(() => {
        const s = useGameStore.getState();
        s.setSpeechBubble(npc.id, NIGHT_LINES[npc.id] ?? 'Good night!');
        setTimeout(() => useGameStore.getState().setSpeechBubble(npc.id, null), 4000);
      }, i * 1200);
    }

    const doorId = HOME_DOOR[config.homeLocation];
    if (doorId) {
      setTimeout(() => {
        const s = useGameStore.getState();
        if (!s.doors[doorId]) s.toggleDoor(doorId);
        setTimeout(() => {
          const s2 = useGameStore.getState();
          if (s2.doors[doorId]) s2.toggleDoor(doorId);
        }, 3000);
      }, 4000 + i * 1200);
    }
  });

  if (unserved.length > 0) {
    const names = unserved.map((n) => NPC_CONFIG_MAP[n.id]?.name ?? n.id).join(', ');
    store.addLog(`${names} left unhappy — you didn't serve them today!`);
    setTimeout(() => {
      const s = useGameStore.getState();
      s.setGameOver(true, `You didn't serve everyone today! ${names} left unhappy.`);
    }, 3000);
  }
}

export function triggerDawnBehavior(): void {
  servedToday.clear();
  const store = useGameStore.getState();
  store.incrementDay();
  store.npcs.forEach((npc, i) => {
    if (npc.following || npc.isTalking || npc.pendingDelivery || shopVisitors.has(npc.id)) return;
    const config = NPC_CONFIG_MAP[npc.id];
    if (!config) return;

    const doorId = HOME_DOOR[config.homeLocation];
    if (doorId) {
      setTimeout(() => {
        const s = useGameStore.getState();
        if (!s.doors[doorId]) s.toggleDoor(doorId);
      }, i * 1200);
    }

    const loc = randomLocation();
    setTimeout(() => {
      moveNPCTo(npc.id, loc.position);
      const s = useGameStore.getState();
      s.setNPCActivity(npc.id, 'starting the day');
      s.setSpeechBubble(npc.id, MORNING_LINES[npc.id] ?? 'Good morning!');
      setTimeout(() => useGameStore.getState().setSpeechBubble(npc.id, null), 4000);

      if (doorId) {
        setTimeout(() => {
          const s2 = useGameStore.getState();
          if (s2.doors[doorId]) s2.toggleDoor(doorId);
        }, 3000);
      }
    }, 1000 + i * 1200);
  });
  sendNextNPC();
}

export function startNPCWander(): () => void {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  function scheduleWander(npcId: string, delay: number): void {
    timers.set(
      npcId,
      setTimeout(() => {
        const store = useGameStore.getState();
        const npc = store.npcs.find((n) => n.id === npcId);
        if (npc && !npc.isTalking && !npc.following && !npc.pendingDelivery && !shopVisitors.has(npcId)) {
          if (isNight(gameTime.current)) {
            const cfg = NPC_CONFIG_MAP[npcId];
            if (cfg) {
              const homeLoc = LOCATIONS[cfg.homeLocation];
              if (homeLoc) {
                moveNPCTo(npcId, [...homeLoc.position] as Vec3);
                store.setNPCActivity(npcId, 'sleeping');
              }
            }
          } else {
            const loc = randomLocationAwayFromShop();
            if (!moveNPCTo(npcId, loc.position)) {
              store.moveNPC(npcId, loc.position);
            }
            store.setNPCActivity(npcId, `heading to ${loc.name}`);
          }
        }
        scheduleWander(npcId, WANDER_BASE_MS + Math.random() * 3000);
      }, delay),
    );
  }

  const store = useGameStore.getState();
  for (const npc of store.npcs) {
    scheduleWander(npc.id, Math.random() * WANDER_BASE_MS);
  }

  const interactionInterval = setInterval(checkInteractions, 4000);

  sendNextNPC();

  return () => {
    timers.forEach((t) => clearTimeout(t));
    timers.clear();
    clearInterval(interactionInterval);
    if (nextVisitTimer !== null) { clearTimeout(nextVisitTimer); nextVisitTimer = null; }
  };
}
