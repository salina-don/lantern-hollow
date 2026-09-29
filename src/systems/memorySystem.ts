import { useGameStore, Memory } from '../state/gameStore';

export function giveRumor(fromId: string, toId: string, fact: string): void {
  const store = useGameStore.getState();
  const toNpc = store.npcs.find((n) => n.id === toId);
  if (!toNpc) return;
  store.addMemory(toId, { fact, source: fromId });
  const fromNpc = store.npcs.find((n) => n.id === fromId);
  const fromName = fromNpc?.name ?? fromId;
  store.addLog(`${fromName} tells ${toNpc.name}: "${fact}"`);
}

export function getMemoriesAbout(npcId: string, topic: string): Memory[] {
  const npc = useGameStore.getState().npcs.find((n) => n.id === npcId);
  if (!npc) return [];
  const t = topic.toLowerCase();
  return npc.memory.filter((m) => m.fact.toLowerCase().includes(t));
}

export function formatMemoryResponse(npcId: string, topic: string): string {
  const store = useGameStore.getState();
  const npc = store.npcs.find((n) => n.id === npcId);
  if (!npc) return "I don't know anything about that.";
  const matches = getMemoriesAbout(npcId, topic);
  if (matches.length === 0) return `I don't know anything about ${topic}.`;
  const latest = matches[matches.length - 1];
  const sourceNpc = store.npcs.find((n) => n.id === latest.source);
  const sourceName = sourceNpc?.name ?? (latest.source === 'player' ? 'you' : latest.source);
  return `${sourceName} told me: "${latest.fact}"`;
}
