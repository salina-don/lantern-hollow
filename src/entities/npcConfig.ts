export interface NPCConfig {
  id: string;
  name: string;
  role: string;
  personality: string;
  color: string;
  startPosition: [number, number, number];
  homeLocation: string; // key in LOCATIONS
}

export const NPC_CONFIGS: NPCConfig[] = [
  {
    id: 'alice',
    name: 'Alice',
    role: 'Innkeeper',
    personality:
      'Warm and gossipy. Loves a good story and knows everyone in the village. Quick to offer a drink and a rumour.',
    color: '#E06BA0',
    startPosition: [7, 0, 4],
    homeLocation: 'tavern',
  },
  {
    id: 'bob',
    name: 'Bob',
    role: 'Blacksmith',
    personality:
      'Gruff but fair. Speaks in short sentences. Respects hard work above all else.',
    color: '#E07830',
    startPosition: [7, 0, -5],
    homeLocation: 'forge',
  },
  {
    id: 'miller',
    name: 'Miller',
    role: 'Baker',
    personality:
      'Cheerful and long-winded. Always flour-dusted. Loves to share recipes and village news.',
    color: '#7EB83A',
    startPosition: [-7, 0, 4],
    homeLocation: 'bakery',
  },
  {
    id: 'elara',
    name: 'Elara',
    role: 'Herbalist',
    personality:
      'Mysterious and cryptic. Speaks in riddles. Deeply knowledgeable about plants and old lore.',
    color: '#9B59B6',
    startPosition: [-7, 0, -5],
    homeLocation: 'orchard',
  },
  {
    id: 'finn',
    name: 'Finn',
    role: 'Guard',
    personality:
      'Vigilant and formal. Takes duty very seriously. Notices everything and forgets nothing.',
    color: '#3498DB',
    startPosition: [0, 0, -11],
    homeLocation: 'gate',
  },
];

export const NPC_CONFIG_MAP: Record<string, NPCConfig> = Object.fromEntries(
  NPC_CONFIGS.map((c) => [c.id, c]),
);
