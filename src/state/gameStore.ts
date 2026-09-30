import { create } from 'zustand';
import { NPC_CONFIGS } from '../entities/npcConfig';
import { GamePhase } from '../world/timeState';

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
  path: Vec3[];
  currentActivity: string;
  memory: Memory[];
  isTalking: boolean;
  talkingTo: string | null;
  following: 'player' | null;
  speechBubble: string | null;
  pendingDelivery: PendingDelivery | null;
  emotion: 'neutral' | 'happy' | 'waiting';
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
  gamePhase: GamePhase;
  quests: Record<string, number>;
  festivalStarted: boolean;
  debugMode: boolean;
  questPopup: { title: string; text: string; hint: string } | null;
  showItemPopup: string | null;
  gold: number;
  health: number;
  hunger: number;
  energy: number;
  isSleeping: boolean;
  showFoodPopup: boolean;
  gameOver: boolean;
  gameOverReason: string;
  goldFloats: Array<{ id: number; text: string; color: string }>;
  day: number;
  totalGoldEarned: number;
  doors: Record<string, boolean>;

  setPlayerPosition: (pos: Vec3) => void;
  moveNPC: (id: string, target: Vec3 | null) => void;
  setNPCPath: (id: string, path: Vec3[]) => void;
  shiftNPCPath: (id: string) => void;
  toggleDebug: () => void;
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
  setNPCEmotion: (npcId: string, emotion: 'neutral' | 'happy' | 'waiting') => void;
  setGamePhase: (phase: GamePhase) => void;
  advanceQuest: (questId: string) => void;
  setFestivalStarted: () => void;
  setQuestPopup: (popup: { title: string; text: string; hint: string } | null) => void;
  setShowItemPopup: (npcId: string | null) => void;
  addGold: (amount: number) => void;
  adjustHealth: (delta: number) => void;
  adjustHunger: (delta: number) => void;
  adjustEnergy: (delta: number) => void;
  setIsSleeping: (sleeping: boolean) => void;
  setShowFoodPopup: (show: boolean) => void;
  setGameOver: (over: boolean, reason?: string) => void;
  resetStats: () => void;
  addGoldFloat: (text: string, color: string) => void;
  removeGoldFloat: (id: number) => void;
  incrementDay: () => void;
  toggleDoor: (doorId: string) => void;
  addRumor: (text: string, origin: string, initialKnower: string) => string;
  spreadRumor: (rumorId: string, toNpcId: string) => void;
}

const INITIAL_NPCS: NpcState[] = NPC_CONFIGS.map((c) => ({
  id: c.id,
  name: c.name,
  position: [...c.startPosition] as Vec3,
  targetPosition: null,
  path: [],
  currentActivity: `at ${c.homeLocation}`,
  memory: [],
  isTalking: false,
  talkingTo: null,
  following: null,
  speechBubble: null,
  pendingDelivery: null,
  emotion: 'neutral' as const,
}));

export const useGameStore = create<GameStore>()((set, get) => ({
  playerPosition: [0, 0, 5],
  npcs: INITIAL_NPCS,
  messages: [],
  log: [
    'Welcome to Lantern Hollow!',
    'You are the village shopkeeper.',
    'WASD to move · E to interact · Visit your house to sleep',
  ],
  apiKey: '',
  activeConversation: null,
  nearbyNpcId: null,
  rumors: {},
  gamePhase: 'morning' as GamePhase,
  quests: {} as Record<string, number>,
  festivalStarted: false,
  debugMode: false,
  questPopup: null,
  showItemPopup: null,
  gold: 20,
  health: 100,
  hunger: 100,
  energy: 100,
  isSleeping: false,
  showFoodPopup: false,
  gameOver: false,
  gameOverReason: '',
  goldFloats: [],
  day: 1,
  totalGoldEarned: 0,
  doors: { tavern: false, bakery: false, forge: false, player_house: false },

  setPlayerPosition: (pos) => set({ playerPosition: pos }),

  moveNPC: (id, target) =>
    set((state) => ({
      npcs: state.npcs.map((npc) =>
        npc.id === id ? { ...npc, targetPosition: target, path: [] } : npc,
      ),
    })),

  setNPCPath: (id, path) =>
    set((state) => ({
      npcs: state.npcs.map((npc) =>
        npc.id === id ? { ...npc, path, targetPosition: null } : npc,
      ),
    })),

  shiftNPCPath: (id) =>
    set((state) => ({
      npcs: state.npcs.map((npc) => {
        if (npc.id !== id) return npc;
        return { ...npc, path: npc.path.slice(1) };
      }),
    })),

  toggleDebug: () => set((state) => ({ debugMode: !state.debugMode })),

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

  setGamePhase: (phase) => set({ gamePhase: phase }),

  advanceQuest: (questId) =>
    set((state) => ({
      quests: {
        ...state.quests,
        [questId]: (state.quests[questId] ?? 0) + 1,
      },
    })),

  setFestivalStarted: () => set({ festivalStarted: true }),

  setQuestPopup: (popup) => set({ questPopup: popup }),

  setShowItemPopup: (npcId) => set({ showItemPopup: npcId }),

  addGold: (amount) => set((s) => ({
    gold: s.gold + amount,
    totalGoldEarned: amount > 0 ? s.totalGoldEarned + amount : s.totalGoldEarned,
  })),
  adjustHealth: (delta) => set((s) => ({ health: Math.max(0, Math.min(100, s.health + delta)) })),
  adjustHunger: (delta) => set((s) => ({ hunger: Math.max(0, Math.min(100, s.hunger + delta)) })),
  adjustEnergy: (delta) => set((s) => ({ energy: Math.max(0, Math.min(100, s.energy + delta)) })),
  setIsSleeping: (sleeping) => set({ isSleeping: sleeping }),
  setShowFoodPopup: (show) => set({ showFoodPopup: show }),
  setGameOver: (over, reason) => set({ gameOver: over, gameOverReason: reason ?? '' }),
  resetStats: () => set({ health: 100, hunger: 100, energy: 100, gold: 20, gameOver: false, gameOverReason: '', day: 1, totalGoldEarned: 0 }),
  addGoldFloat: (text, color) => {
    const id = Date.now() + Math.random();
    set((s) => ({ goldFloats: [...s.goldFloats, { id, text, color }] }));
  },
  removeGoldFloat: (id) =>
    set((s) => ({ goldFloats: s.goldFloats.filter((f) => f.id !== id) })),
  incrementDay: () => set((s) => ({ day: s.day + 1 })),
  toggleDoor: (doorId) => set((s) => ({ doors: { ...s.doors, [doorId]: !s.doors[doorId] } })),

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

  setNPCEmotion: (npcId, emotion) =>
    set((state) => ({
      npcs: state.npcs.map((npc) =>
        npc.id === npcId ? { ...npc, emotion } : npc,
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
