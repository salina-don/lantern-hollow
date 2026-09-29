import { useGameStore } from '../state/gameStore';
import { giveRumor, formatMemoryResponse } from './memorySystem';
import { callAnthropic } from '../llm/client';

const CANNED: string[] = [
  'Aye, I hear you.',
  'Hmm, interesting...',
  "I'll keep that in mind.",
  "You don't say!",
  'Is that so?',
  'Good day to you.',
  'Busy times in the hollow.',
];

function pickCanned(): string {
  return CANNED[Math.floor(Math.random() * CANNED.length)];
}

export async function playerSaysToNPC(npcId: string, text: string): Promise<string> {
  const store = useGameStore.getState();
  const npc = store.npcs.find((n) => n.id === npcId);
  if (!npc) return '';

  store.addMessage({ from: 'player', to: npcId, text });

  // "tell me about X" / "what do you know about X"
  const aboutMatch = text.match(/(?:tell me about|what do you know about|know about)\s+(.+)/i);
  if (aboutMatch) {
    const response = formatMemoryResponse(npcId, aboutMatch[1].trim());
    store.addMessage({ from: npcId, to: 'player', text: response });
    store.addLog(`${npc.name}: ${response}`);
    return response;
  }

  if (store.apiKey) {
    try {
      const knownFacts = npc.memory.map((m) => m.fact).join('; ') || 'nothing in particular';
      const systemPrompt = `You are ${npc.name}, a villager in Lantern Hollow. Your current activity: ${npc.currentActivity}. Things you know: ${knownFacts}. Respond in 1-2 short sentences, in character as a medieval villager.`;
      const response = await callAnthropic(store.apiKey, systemPrompt, text);
      store.addMessage({ from: npcId, to: 'player', text: response });
      store.addLog(`${npc.name}: ${response}`);
      return response;
    } catch {
      // fall through to canned
    }
  }

  const response = pickCanned();
  store.addMessage({ from: npcId, to: 'player', text: response });
  store.addLog(`${npc.name}: ${response}`);
  return response;
}

export function npcToNPCExchange(fromId: string, toId: string, fact: string): void {
  giveRumor(fromId, toId, fact);
  const store = useGameStore.getState();
  store.addMessage({ from: fromId, to: toId, text: fact });
}
