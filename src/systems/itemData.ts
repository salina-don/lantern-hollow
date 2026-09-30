export interface Item {
  id: string;
  name: string;
  color: string;
  description: string;
}

export const ITEMS: Item[] = [
  { id: 'millstone', name: 'Millstone', color: '#8a8a8a', description: 'A heavy grinding stone' },
  { id: 'salve', name: 'Cooling Salve', color: '#4a9a5a', description: 'Herbal burn remedy' },
  { id: 'tome', name: 'Leather Tome', color: '#8a5a30', description: 'Old book of remedies' },
  { id: 'rations', name: 'Rations Pack', color: '#c07830', description: 'Food for the night watch' },
  { id: 'flour', name: 'Flour Blend', color: '#e0d0a0', description: 'Special baking flour' },
  { id: 'bread', name: 'Bread Loaf', color: '#d4a040', description: 'Fresh baked bread' },
  { id: 'horseshoe', name: 'Horseshoe', color: '#a0a8b0', description: 'Iron horseshoe' },
  { id: 'candle', name: 'Candle', color: '#f0e8c0', description: 'Beeswax candle' },
];

export const ITEM_MAP: Record<string, Item> = Object.fromEntries(
  ITEMS.map((i) => [i.id, i]),
);

export interface ItemQuest {
  id: string;
  npcId: string;
  itemId: string;
  title: string;
  description: string;
  requestLine: string;
  thankLine: string;
  wrongLine: string;
  doneLine: string;
  reward: number;
}

export const ITEM_QUESTS: ItemQuest[] = [
  {
    id: 'millstone',
    npcId: 'miller',
    itemId: 'millstone',
    title: 'The Broken Millstone',
    description: 'Miller needs a new millstone for the bakery.',
    requestLine: 'My millstone cracked! Do you have a spare?',
    thankLine: 'A new millstone! The bakery lives on! Thank you!',
    wrongLine: "That's not what I need. I need a millstone!",
    doneLine: "You've already helped me! Thank you, friend.",
    reward: 15,
  },
  {
    id: 'salve',
    npcId: 'bob',
    itemId: 'salve',
    title: 'Cooling Salve',
    description: 'Bob needs salve for his forge burns.',
    requestLine: 'These burns... I need something to cool them.',
    thankLine: 'This salve is perfect. My hands feel better already.',
    wrongLine: 'No good to me. I need cooling salve.',
    doneLine: 'All sorted. Thanks again.',
    reward: 12,
  },
  {
    id: 'tome',
    npcId: 'elara',
    itemId: 'tome',
    title: 'The Lost Tome',
    description: "Elara lost her book of remedies.",
    requestLine: "I've lost my book of remedies. Have you seen it?",
    thankLine: 'My tome! Generations of knowledge, safe again!',
    wrongLine: "That won't help. I need my leather tome.",
    doneLine: "You've done enough, kind traveler.",
    reward: 18,
  },
  {
    id: 'rations',
    npcId: 'finn',
    itemId: 'rations',
    title: 'Night Watch Rations',
    description: 'Finn needs food for his night patrol.',
    requestLine: "I'm on watch all night and I'm starving.",
    thankLine: "Rations! Now I can watch all night. Much obliged.",
    wrongLine: "Can't use that. I need rations for the watch.",
    doneLine: 'Already got what I need. Carry on.',
    reward: 10,
  },
  {
    id: 'recipe',
    npcId: 'alice',
    itemId: 'flour',
    title: 'The Secret Recipe',
    description: 'Alice needs special flour for her honey cake.',
    requestLine: 'I need special flour for my honey cake!',
    thankLine: 'The flour blend! This cake will be legendary!',
    wrongLine: "Not quite. I need Miller's special flour blend!",
    doneLine: "I'm all set! The cake is baking!",
    reward: 15,
  },
];

export const QUEST_BY_NPC: Record<string, ItemQuest> = Object.fromEntries(
  ITEM_QUESTS.map((q) => [q.npcId, q]),
);
