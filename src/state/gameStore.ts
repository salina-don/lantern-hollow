import { create } from 'zustand';
import { NPC_CONFIGS } from '../entities/npcConfig';

export type Vec3 = [number, number, number];

export interface Message {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
}

export interface Memory {
  fact: string;
  source: string;
  timestamp: number;
}

export interface RumorEntry {
  id: string;
  text: string;
  origin: string; // 'player' or npc id that originated it
  knownBy: string[]; // npc ids
}

export interface PendingDelivery {
  toNpcId: string;
  rumorId: string;
  message: string;
}

export interface NpcState {
  id: string;
  name: string;
  position: Vec3;
  targetPosition: Vec3 | null;
  currentActivity: string;
  memory: Memory[];
  isTalking: boolean;
  talkingTo: string | null;
  following: 'player' | null;
  speechBubble: string | null;
  pendingDelivery: PendingDelivery | null;
}

interface GameStore {
  playerPosition: Vec3;
  npcs: NpcState[];
  messages: Message[];
  log: string[];
  apiKey: string;
  activeConversation: string | null;
  nearbyNpcId: string | null;
  rumors: Record<string, RumorEntry>;

  setPlayerPosition: (pos: Vec3) => void;
  moveNPC: (id: string, target: Vec3 | null) => void;
  updateNPCPosition: (id: string, pos: Vec3) => void;
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  addLog: (entry: string) => void;
  setApiKey: (key: string) => void;
  setActiveConversation: (npcId: string | null) => void;
  setNearbyNpc: (id: string | null) => void;
  addMemory: (npcId: string, memory: Omit<Memory, 'timestamp'>) => void;
  setNPCActivity: (npcId: string, activity: string) => void;
  setNPCTalking: (npcId: string, talkingTo: string | null) => void;
  setNPCFollowing: (npcId: string, following: 'player' | null) => void;
  setSpeechBubble: (npcId: string, text: string | null) => void;
  setPendingDelivery: (npcId: string, delivery: PendingDelivery | null) => void;
  addRumor: (text: string, origin: string, initialKnower: string) => string;
  spreadRumor: (rumorId: string, toNpcId: string) => void;
}

const INITIAL_NPCS: NpcState[] = NPC_CONFIGS.map((c) => ({
  id: c.id,
  name: c.name,
  position: [...c.startPosition] as Vec3,
  targetPosition: null,
  currentActivity: `at ${c.homeLocation}`,
  memory: [],
  isTalking: false,
  talkingTo: null,
  following: null,
  speechBubble: null,
  pendingDelivery: null,
}));

export const useGameStore = create<GameStore>()((set, get) => ({
  playerPosition: [0, 0, 5],
  npcs: INITIAL_NPCS,
  messages: [],
  log: [
    'Welcome to Lantern Hollow.',
    'WASD to move · Drag to rotate camera',
    'Click an NPC or press E nearby to talk',
  ],
  apiKey: '',
  activeConversation: null,
  nearbyNpcId: null,
  rumors: {},

  setPlayerPosition: (pos) => set({ playerPosition: pos }),

  moveNPC: (id, target) =>
    set((state) => ({
      npcs: state.npcs.map((npc) =>
        npc.id === id ? { ...npc, targetPosition: target } : npc,
      ),
    })),

  updateNPCPosition: (id, pos) =>
    set((state) => ({
      npcs: state.npcs.map((npc) =>
        npc.id === id ? { ...npc, position: pos } : npc,
      ),
    })),

  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...msg, id: Math.random().toString(36).slice(2), timestamp: Date.now() },
      ].slice(-50),
    })),

  addLog: (entry) =>
    set((state) => ({ log: [...state.log, entry].slice(-100) })),

  setApiKey: (key) => set({ apiKey: key }),

  setActiveConversation: (npcId) => set({ activeConversation: npcId }),

  setNearbyNpc: (id) => set({ nearbyNpcId: id }),

  addMemory: (npcId, memory) =>
    set((state) => ({
      npcs: state.npcs.map((npc) =>
        npc.id === npcId
          ? {
              ...npc,
              memory: [...npc.memory, { ...memory, timestamp: Date.now() }].slice(-20),
            }
          : npc,
      ),
    })),

  setNPCActivity: (npcId, activity) =>
    set((state) => ({
      npcs: state.npcs.map((npc) =>
        npc.id === npcId ? { ...npc, currentActivity: activity } : npc,
      ),
    })),

  setNPCTalking: (npcId, talkingTo) =>
    set((state) => ({
      npcs: state.npcs.map((npc) =>
        npc.id === npcId
          ? { ...npc, isTalking: talkingTo !== null, talkingTo }
          : npc,
      ),
    })),

  setNPCFollowing: (npcId, following) =>
    set((state) => ({
      npcs: state.npcs.map((npc) =>
        npc.id === npcId ? { ...npc, following } : npc,
      ),
    })),

  setSpeechBubble: (npcId, text) =>
    set((state) => ({
      npcs: state.npcs.map((npc) =>
        npc.id === npcId ? { ...npc, speechBubble: text } : npc,
      ),
    })),

  setPendingDelivery: (npcId, delivery) =>
    set((state) => ({
      npcs: state.npcs.map((npc) =>
        npc.id === npcId ? { ...npc, pendingDelivery: delivery } : npc,
      ),
    })),

  addRumor: (text, origin, initialKnower) => {
    const existing = Object.values(get().rumors).find(
      (r) => r.text.toLowerCase() === text.toLowerCase(),
    );
    if (existing) {
      if (!existing.knownBy.includes(initialKnower)) {
        set((state) => ({
          rumors: {
            ...state.rumors,
            [existing.id]: {
              ...existing,
              knownBy: [...existing.knownBy, initialKnower],
            },
          },
          npcs: state.npcs.map((npc) =>
            npc.id === initialKnower
              ? {
                  ...npc,
                  memory: [...npc.memory, { fact: text, source: origin, timestamp: Date.now() }].slice(-20),
                }
              : npc,
          ),
        }));
      }
      return existing.id;
    }
    const id = Math.random().toString(36).slice(2, 9);
    set((state) => ({
      rumors: {
        ...state.rumors,
        [id]: { id, text, origin, knownBy: [initialKnower] },
      },
      npcs: state.npcs.map((npc) =>
        npc.id === initialKnower
          ? {
              ...npc,
              memory: [...npc.memory, { fact: text, source: origin, timestamp: Date.now() }].slice(-20),
            }
          : npc,
      ),
    }));
    return id;
  },

  spreadRumor: (rumorId, toNpcId) =>
    set((state) => {
      const rumor = state.rumors[rumorId];
      if (!rumor || rumor.knownBy.includes(toNpcId)) return state;
      return {
        rumors: {
          ...state.rumors,
          [rumorId]: { ...rumor, knownBy: [...rumor.knownBy, toNpcId] },
        },
        npcs: state.npcs.map((npc) =>
          npc.id === toNpcId
            ? {
                ...npc,
                memory: [
                  ...npc.memory,
                  { fact: rumor.text, source: rumor.origin, timestamp: Date.now() },
                ].slice(-20),
              }
            : npc,
        ),
      };
    }),
}));
