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
}

interface GameStore {
  playerPosition: Vec3;
  npcs: NpcState[];
  messages: Message[];
  log: string[];
  apiKey: string;
  activeConversation: string | null;
  nearbyNpcId: string | null;

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
}));

export const useGameStore = create<GameStore>()((set) => ({
  playerPosition: [0, 0, 5],
  npcs: INITIAL_NPCS,
  messages: [],
  log: [
    'Welcome to Lantern Hollow.',
    'WASD to move · Drag to rotate camera',
    'Click an NPC or press E nearby to talk',
    '"tell Alice to go to tavern" · "tell Bob that <rumour>"',
  ],
  apiKey: '',
  activeConversation: null,
  nearbyNpcId: null,

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
}));
