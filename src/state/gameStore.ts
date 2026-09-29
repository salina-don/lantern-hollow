import { create } from 'zustand';

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
}

interface GameStore {
  playerPosition: Vec3;
  npcs: NpcState[];
  messages: Message[];
  log: string[];
  apiKey: string;
  activeConversation: string | null;

  setPlayerPosition: (pos: Vec3) => void;
  moveNPC: (id: string, target: Vec3 | null) => void;
  updateNPCPosition: (id: string, pos: Vec3) => void;
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  addLog: (entry: string) => void;
  setApiKey: (key: string) => void;
  setActiveConversation: (npcId: string | null) => void;
  addMemory: (npcId: string, memory: Omit<Memory, 'timestamp'>) => void;
  setNPCActivity: (npcId: string, activity: string) => void;
  setNPCTalking: (npcId: string, talkingTo: string | null) => void;
}

const INITIAL_NPCS: NpcState[] = [
  {
    id: 'alice',
    name: 'Alice',
    position: [3, 0, 2],
    targetPosition: null,
    currentActivity: 'wandering',
    memory: [],
    isTalking: false,
    talkingTo: null,
  },
  {
    id: 'bob',
    name: 'Bob',
    position: [-4, 0, 1],
    targetPosition: null,
    currentActivity: 'wandering',
    memory: [],
    isTalking: false,
    talkingTo: null,
  },
  {
    id: 'miller',
    name: 'Miller',
    position: [7, 0, -2],
    targetPosition: null,
    currentActivity: 'working',
    memory: [],
    isTalking: false,
    talkingTo: null,
  },
];

export const useGameStore = create<GameStore>()((set) => ({
  playerPosition: [0, 0, 5],
  npcs: INITIAL_NPCS,
  messages: [],
  log: ['Welcome to Lantern Hollow.', 'Commands: "go to inn", "talk to Alice", "tell Bob to go to market", "tell Alice that <rumor>"'],
  apiKey: '',
  activeConversation: null,

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

  addMemory: (npcId, memory) =>
    set((state) => ({
      npcs: state.npcs.map((npc) =>
        npc.id === npcId
          ? { ...npc, memory: [...npc.memory, { ...memory, timestamp: Date.now() }].slice(-20) }
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
}));
