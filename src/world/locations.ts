export interface Location {
  name: string;
  position: [number, number, number];
  aliases: string[];
}

export const LOCATIONS: Record<string, Location> = {
  town_square: {
    name: 'Town Square',
    position: [0, 0, 0],
    aliases: ['town square', 'square', 'center', 'plaza'],
  },
  tavern: {
    name: 'The Lantern Tavern',
    position: [8, 0, 5],
    aliases: ['tavern', 'inn', 'lantern', 'pub', 'bar'],
  },
  bakery: {
    name: 'Bakery',
    position: [-8, 0, 5],
    aliases: ['bakery', 'baker', 'bread', 'bake'],
  },
  forge: {
    name: 'Forge',
    position: [8, 0, -6],
    aliases: ['forge', 'blacksmith', 'smith', 'anvil', 'smithy'],
  },
  well: {
    name: 'Village Well',
    position: [-3, 0, -4],
    aliases: ['well', 'water', 'village well'],
  },
  orchard: {
    name: 'Orchard',
    position: [-8, 0, -6],
    aliases: ['orchard', 'trees', 'garden', 'grove'],
  },
  gate: {
    name: 'Village Gate',
    position: [0, 0, -12],
    aliases: ['gate', 'entrance', 'exit', 'door'],
  },
};

export function findLocation(query: string): Location | null {
  const q = query.toLowerCase().trim();
  for (const loc of Object.values(LOCATIONS)) {
    if (loc.aliases.some((a) => q.includes(a))) return loc;
  }
  return null;
}

export function randomLocation(): Location {
  const locs = Object.values(LOCATIONS);
  return locs[Math.floor(Math.random() * locs.length)];
}
