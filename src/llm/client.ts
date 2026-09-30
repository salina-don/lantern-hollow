import { NPC_CONFIGS, NPC_CONFIG_MAP, NPCConfig } from '../entities/npcConfig';
import { LOCATIONS } from '../world/locations';

// The structured reply the LLM is asked to return
export interface NPCReply {
  say: string;   // what the NPC says aloud
  action?: string; // optional command, e.g. "go to the well" / "follow me" / "stay"
}

const MODEL = 'claude-haiku-4-5-20251001';

function buildSystemPrompt(config: NPCConfig, rumors: string[], activity: string): string {
  const locationNames = Object.values(LOCATIONS).map((l) => l.name).join(', ');

  const otherNPCs = NPC_CONFIGS
    .filter((c) => c.id !== config.id)
    .map((c) => `${c.name} (${c.role})`)
    .join(', ');

  const rumorList = rumors.length > 0
    ? rumors.map((r, i) => `${i + 1}. "${r}"`).join('\n')
    : '(none yet)';

  return `You are ${config.name}, the ${config.role} of Lantern Hollow, a small medieval village.

PERSONALITY: ${config.personality}

CURRENT ACTIVITY: ${activity}

RUMORS YOU KNOW:
${rumorList}

VILLAGE LOCATIONS: ${locationNames}
FELLOW VILLAGERS: ${otherNPCs}

INSTRUCTIONS:
- Respond in character as ${config.name}. Stay true to your personality.
- Keep replies short (1-3 sentences max).
- You may optionally issue ONE action command — something you will physically do.
- Return ONLY valid JSON in this exact shape, no markdown fences, no extra keys:
  {"say": "<what you say>", "action": "<optional action command or omit key>"}
- Valid action strings follow these patterns:
    "go to <location>" — walk to a named village location
    "follow me" — follow the player
    "stay" — stop and wait
    "tell <NPC name> <message>" — deliver a message to another villager
- If you have nothing to physically do, omit the "action" key entirely.
- Never break character. Speak as a medieval villager would.`;
}

/**
 * Call the Anthropic API to get an in-character NPC reply with an optional action.
 * Returns null on network error, bad key, or non-JSON response — caller falls back.
 */
export async function callNPCReply(
  apiKey: string,
  npcId: string,
  playerMessage: string,
  rumors: string[],
  activity: string,
): Promise<NPCReply | null> {
  const config = NPC_CONFIG_MAP[npcId];
  if (!config) return null;

  const system = buildSystemPrompt(config, rumors, activity);

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true',
    };

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        system,
        messages: [{ role: 'user', content: playerMessage }],
      }),
    });

    if (!res.ok) return null;

    const data = await res.json() as { content: Array<{ type: string; text: string }> };
    const block = data.content?.find((b) => b.type === 'text');
    if (!block) return null;

    const raw = block.text.trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '');

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (typeof parsed.say !== 'string') return null;

    return {
      say: parsed.say,
      action: typeof parsed.action === 'string' ? parsed.action : undefined,
    };
  } catch {
    return null;
  }
}
