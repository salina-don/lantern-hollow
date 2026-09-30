import { useGameStore, Vec3 } from '../state/gameStore';
import { findLocation } from '../world/locations';
import { NPC_CONFIGS, NPC_CONFIG_MAP } from '../entities/npcConfig';
import { moveNPCTo, blockedReply } from './npcAI';

// ── Typed NPC command ─────────────────────────────────────────────────────────

export type ParsedAction =
  | { type: 'goto'; locationKey: string; locationName: string; position: Vec3 }
  | { type: 'follow' }
  | { type: 'stay' }
  | { type: 'deliver_message'; toNpcId: string; toNpcName: string; message: string }
  | { type: 'converse'; text: string };

/**
 * Pure parser — no side effects; safe to call from unit tests.
 * Converts natural-language text into a typed ParsedAction.
 */
export function parseAction(rawText: string): ParsedAction {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // goto: "go to <loc>", "walk/move/head/run/travel [to|towards] <loc>"
  const gotoMatch = lower.match(
    /^(?:go|walk|move|head|run|travel)\s+(?:to\s+|towards?\s+)?(.+)$/,
  );
  if (gotoMatch) {
    const loc = findLocation(gotoMatch[1]);
    if (loc) {
      return { type: 'goto', locationKey: loc.key, locationName: loc.name, position: loc.position };
    }
  }

  // follow: "follow [me]", "come [with me]", "stay close [to me]"
  if (/^(?:follow(?:\s+me)?|come(?:\s+with\s+me)?|stay\s+close(?:\s+to\s+me)?)$/.test(lower)) {
    return { type: 'follow' };
  }

  // stay: "stay [here|put]", "stop [here]", "wait [here]", "hold position", "stand by"
  if (
    /^(?:stay(?:\s+(?:here|put))?|stop(?:\s+here)?|wait(?:\s+here)?|hold(?:\s+position)?|stand\s+by)$/.test(
      lower,
    )
  ) {
    return { type: 'stay' };
  }

  // deliver_message: "tell <NPC name> [that] <message>"
  // Only matches when the name resolves to a known NPC.
  const tellMatch = text.match(/^tell\s+(\w+)\s+(?:that\s+)?(.+)$/i);
  if (tellMatch) {
    const targetName = tellMatch[1].toLowerCase();
    const cfg = NPC_CONFIGS.find((c) => c.name.toLowerCase() === targetName);
    if (cfg) {
      return {
        type: 'deliver_message',
        toNpcId: cfg.id,
        toNpcName: cfg.name,
        message: tellMatch[2],
      };
    }
  }

  return { type: 'converse', text };
}

// ── Personality-aware reply templates ────────────────────────────────────────

const NPC_REPLIES: Record<
  string,
  { goto: string; follow: string; stay: string; deliver: string }
> = {
  alice: {
    goto: 'Of course! I know the way to {loc} well enough.',
    follow: "Oh, are we off somewhere? I'll keep close!",
    stay: "I'll stay right here. Don't be long!",
    deliver: "I'll have a word with {name} — I know just where to find them.",
  },
  bob: {
    goto: 'Fine. {loc}.',
    follow: 'As you say.',
    stay: 'Understood.',
    deliver: "I'll tell {name}.",
  },
  miller: {
    goto: 'Oh lovely, {loc}! I\'ll be there in two shakes of a lamb\'s tail!',
    follow: 'Right behind you, friend! Lead on!',
    stay: "I'll wait here! Perhaps I'll have a little rest.",
    deliver: "Oh I'll find {name}, we were just talking the other day!",
  },
  elara: {
    goto: 'As the river bends, I go.',
    follow: 'Where you step, I step.',
    stay: 'Roots hold. I remain.',
    deliver: '{name} will hear the leaves whisper.',
  },
  finn: {
    goto: 'Moving to {loc}. Acknowledged.',
    follow: 'Maintaining proximity. Understood.',
    stay: 'Holding position.',
    deliver: 'Message will be delivered to {name}. Confirmed.',
  },
};

const DEFAULT_REPLIES = {
  goto: "I'll make my way to {loc}.",
  follow: "I'll follow you.",
  stay: "I'll stay put.",
  deliver: "I'll let {name} know.",
};

function personalityReply(npcId: string, action: ParsedAction): string {
  const r = NPC_REPLIES[npcId] ?? DEFAULT_REPLIES;
  switch (action.type) {
    case 'goto':
      return r.goto.replace('{loc}', action.locationName);
    case 'follow':
      return r.follow;
    case 'stay':
      return r.stay;
    case 'deliver_message':
      return r.deliver.replace('{name}', action.toNpcName);
    default:
      return '';
  }
}

function actionSummary(action: ParsedAction): string {
  switch (action.type) {
    case 'goto':
      return `Go to ${action.locationName}`;
    case 'follow':
      return 'Follow me';
    case 'stay':
      return 'Stay here';
    case 'deliver_message':
      return `Tell ${action.toNpcName}: "${action.message}"`;
    case 'converse':
      return action.text;
  }
}

function scheduleSpeechBubble(npcId: string, text: string): void {
  useGameStore.getState().setSpeechBubble(npcId, text);
  setTimeout(() => {
    useGameStore.getState().setSpeechBubble(npcId, null);
  }, 5000);
}

// ── Executor (has side effects: store, timers, LLM calls) ────────────────────

export async function executeAction(npcId: string, action: ParsedAction): Promise<string> {
  const store = useGameStore.getState();
  const npc = store.npcs.find((n) => n.id === npcId);
  const config = NPC_CONFIG_MAP[npcId];
  if (!npc || !config) return '';

  // 'converse' is handled by the caller (conversationSystem / ChatBox) to avoid a
  // circular dependency. executeAction only handles structural commands.
  if (action.type === 'converse') return '';

  store.addMessage({ from: 'player', to: npcId, text: actionSummary(action) });

  // Structural command
  switch (action.type) {
    case 'goto': {
      store.setNPCFollowing(npcId, null);
      const reached = moveNPCTo(npcId, action.position);
      if (!reached) {
        const blocked = blockedReply(npcId);
        store.addMessage({ from: npcId, to: 'player', text: blocked });
        store.addLog(`${config.name}: ${blocked}`);
        scheduleSpeechBubble(npcId, blocked);
        return blocked;
      }
      store.setNPCActivity(npcId, `heading to ${action.locationName}`);
      break;
    }

    case 'follow':
      store.setNPCFollowing(npcId, 'player');
      store.setNPCActivity(npcId, 'following you');
      store.moveNPC(npcId, null);
      break;

    case 'stay':
      store.setNPCFollowing(npcId, null);
      store.moveNPC(npcId, null);
      store.setNPCActivity(npcId, 'standing by');
      break;

    case 'deliver_message': {
      const rumorId = store.addRumor(action.message, 'player', npcId);
      store.setPendingDelivery(npcId, {
        toNpcId: action.toNpcId,
        rumorId,
        message: action.message,
      });
      store.setNPCFollowing(npcId, null);
      store.setNPCActivity(npcId, `heading to find ${action.toNpcName}`);
      const target = store.npcs.find((n) => n.id === action.toNpcId);
      if (target) {
        if (!moveNPCTo(npcId, target.position)) {
          store.moveNPC(npcId, target.position);
        }
      }
      break;
    }
  }

  const reply = personalityReply(npcId, action);
  store.addMessage({ from: npcId, to: 'player', text: reply });
  store.addLog(`${config.name}: ${reply}`);
  scheduleSpeechBubble(npcId, reply);
  return reply;
}

// ── Legacy player-command parser (used when no NPC is selected) ──────────────

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

  if (['close', 'bye', 'goodbye', 'exit', 'leave'].includes(lower)) {
    if (store.activeConversation) {
      store.setActiveConversation(null);
      store.addLog('Conversation ended.');
    }
    return { handled: true };
  }

  // Move the player to a location
  const goMatch = lower.match(/^(?:go|walk|move|head|run)\s+(?:to\s+)?(.+)$/);
  if (goMatch) {
    const loc = findLocation(goMatch[1]);
    if (loc) {
      store.setPlayerPosition(loc.position);
      store.addLog(`You head to ${loc.name}.`);
      return { handled: true };
    }
  }

  // Open a conversation with an NPC
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

  return {
    handled: false,
    message: `Unknown command. Try: "go to inn", "talk to Alice".`,
  };
}
