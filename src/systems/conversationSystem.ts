import { useGameStore } from '../state/gameStore';
import { NPC_CONFIG_MAP } from '../entities/npcConfig';
import { formatMemoryResponse } from './memorySystem';
import { callNPCReply } from '../llm/client';
import { parseAction, executeAction } from './commandParser';

// ── Canned fallback lines keyed by NPC personality flavour ───────────────────

const CANNED_BY_NPC: Record<string, string[]> = {
  alice:  ["Oh my, how interesting!", "You don't say!", "I'll keep that in mind, dear.", "Busy times in the hollow!"],
  bob:    ["Hm.", "Right.", "Got it.", "I see."],
  miller: ["Oh, that IS something!", "How wonderful!", "Good to know, good to know!", "Is that so?!"],
  elara:  ["The signs align...", "As the old roots knew.", "Curious.", "The wind agrees."],
  finn:   ["Noted.", "Understood.", "Logged.", "Acknowledged."],
};
const CANNED_DEFAULT = ["Aye, I hear you.", "Hmm, interesting...", "I'll keep that in mind.", "Good day."];

function pickCanned(npcId: string): string {
  const pool = CANNED_BY_NPC[npcId] ?? CANNED_DEFAULT;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Main entry point ─────────────────────────────────────────────────────────

export async function playerSaysToNPC(npcId: string, text: string): Promise<string> {
  const store = useGameStore.getState();
  const npc = store.npcs.find((n) => n.id === npcId);
  const config = NPC_CONFIG_MAP[npcId];
  if (!npc || !config) return '';

  store.addMessage({ from: 'player', to: npcId, text });

  // Player statements (non-questions) become rumors the NPC can spread
  if (!text.endsWith('?') && text.length > 4) {
    store.addRumor(text, 'player', npcId);
  }

  // "tell me about X" — memory recall, no LLM needed
  const aboutMatch = text.match(/(?:tell me about|what do you know about|know about)\s+(.+)/i);
  if (aboutMatch) {
    const reply = formatMemoryResponse(npcId, aboutMatch[1].trim());
    store.addMessage({ from: npcId, to: 'player', text: reply });
    store.addLog(`${config.name}: ${reply}`);
    return reply;
  }

  // ── LLM path ──────────────────────────────────────────────────────────────
  if (store.apiKey) {
    const rumorTexts = npc.memory.map((m) => m.fact);
    const llmReply = await callNPCReply(
      store.apiKey,
      npcId,
      text,
      rumorTexts,
      npc.currentActivity,
    );

    if (llmReply) {
      const { say, action } = llmReply;

      store.addMessage({ from: npcId, to: 'player', text: say });
      store.addLog(`${config.name}: ${say}`);

      store.setSpeechBubble(npcId, say);
      setTimeout(() => useGameStore.getState().setSpeechBubble(npcId, null), 5000);

      // Feed the LLM-chosen action back into the existing executor.
      // Only structural commands (not 'converse') apply; the executor adds the
      // player-intent message itself, which is fine — it records "Go to Well" style.
      if (action) {
        const parsed = parseAction(action);
        if (parsed.type !== 'converse') {
          executeAction(npcId, parsed).catch(() => {/* ignore executor errors */});
        }
      }

      return say;
    }
  }

  // ── Canned fallback ───────────────────────────────────────────────────────
  const reply = pickCanned(npcId);
  store.addMessage({ from: npcId, to: 'player', text: reply });
  store.addLog(`${config.name}: ${reply}`);
  store.setSpeechBubble(npcId, reply);
  setTimeout(() => useGameStore.getState().setSpeechBubble(npcId, null), 5000);
  return reply;
}

export function npcToNPCExchange(fromId: string, toId: string, fact: string): void {
  const store = useGameStore.getState();
  const fromConfig = NPC_CONFIG_MAP[fromId];
  const toConfig = NPC_CONFIG_MAP[toId];
  store.addMemory(toId, { fact, source: fromId });
  store.addLog(
    `${fromConfig?.name ?? fromId} tells ${toConfig?.name ?? toId}: "${fact}"`,
  );
  store.addMessage({ from: fromId, to: toId, text: fact });
}
