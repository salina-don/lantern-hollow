import { useGameStore } from '../state/gameStore';
import { findLocation } from '../world/locations';
import { playerSaysToNPC } from './conversationSystem';

export interface CommandResult {
  handled: boolean;
  message?: string;
}

function findNPCByName(query: string) {
  const npcs = useGameStore.getState().npcs;
  const q = query.toLowerCase().trim();
  return npcs.find((npc) => npc.name.toLowerCase() === q || npc.id.toLowerCase() === q) ?? null;
}

export async function parseCommand(raw: string): Promise<CommandResult> {
  const store = useGameStore.getState();
  const text = raw.trim();
  const lower = text.toLowerCase();

  if (!text) return { handled: true };

  // close / end conversation
  if (['close', 'bye', 'goodbye', 'exit', 'leave'].includes(lower)) {
    if (store.activeConversation) {
      store.setActiveConversation(null);
      store.addLog('Conversation ended.');
    }
    return { handled: true };
  }

  // go to <location>
  const goMatch = lower.match(/^(?:go|walk|move|head|run)\s+(?:to\s+)?(.+)$/);
  if (goMatch) {
    const loc = findLocation(goMatch[1]);
    if (loc) {
      store.setPlayerPosition(loc.position);
      store.addLog(`You head to ${loc.name}.`);
      return { handled: true };
    }
  }

  // talk to <npc>
  const talkMatch = lower.match(/^(?:talk|speak|chat)\s+(?:to|with)\s+(.+)$/);
  if (talkMatch) {
    const npc = findNPCByName(talkMatch[1]);
    if (npc) {
      store.setActiveConversation(npc.id);
      store.addLog(`You start talking to ${npc.name}.`);
      return { handled: true };
    }
    return { handled: true, message: `Can't find anyone named "${talkMatch[1]}".` };
  }

  // tell <npc> to go to <location>
  const directMatch = lower.match(
    /^tell\s+(\w+)\s+to\s+(?:go|walk|move|head)\s+(?:to\s+)?(.+)$/,
  );
  if (directMatch) {
    const npc = findNPCByName(directMatch[1]);
    const loc = findLocation(directMatch[2]);
    if (!npc) return { handled: true, message: `No one named "${directMatch[1]}".` };
    if (!loc) return { handled: true, message: `Unknown location "${directMatch[2]}".` };
    store.moveNPC(npc.id, loc.position);
    store.setNPCActivity(npc.id, `heading to ${loc.name}`);
    store.addLog(`You direct ${npc.name} to go to ${loc.name}.`);
    return { handled: true };
  }

  // tell <npc> that <fact>
  const rumorMatch = text.match(/^[Tt]ell\s+(\w+)\s+that\s+(.+)$/);
  if (rumorMatch) {
    const npc = findNPCByName(rumorMatch[1]);
    if (!npc) return { handled: true, message: `No one named "${rumorMatch[1]}".` };
    store.addMemory(npc.id, { fact: rumorMatch[2], source: 'player' });
    store.addLog(`You tell ${npc.name}: "${rumorMatch[2]}"`);
    return { handled: true };
  }

  // ask <npc> about <topic>
  const askMatch = lower.match(/^ask\s+(\w+)\s+about\s+(.+)$/);
  if (askMatch) {
    const npc = findNPCByName(askMatch[1]);
    if (!npc) return { handled: true, message: `No one named "${askMatch[1]}".` };
    store.setActiveConversation(npc.id);
    await playerSaysToNPC(npc.id, `tell me about ${askMatch[2]}`);
    return { handled: true };
  }

  // if in active conversation, send the message
  if (store.activeConversation) {
    await playerSaysToNPC(store.activeConversation, text);
    return { handled: true };
  }

  return {
    handled: false,
    message: `Unknown command. Try: "go to inn", "talk to Alice", "tell Bob to go to market", "tell Alice that there is a fire".`,
  };
}
