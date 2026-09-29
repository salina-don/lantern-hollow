export interface Location {
  name: string;
  position: [number, number, number];
  aliases: string[];
}

export const LOCATIONS: Record<string, Location> = {
  town_square: {
    name: 'Town Square',
    position: [0, 0, 0],
    aliases: ['town square', 'square', 'center'],
  },
  inn: {
    name: 'The Lantern Inn',
    position: [8, 0, 5],
    aliases: ['inn', 'lantern inn', 'tavern'],
  },
  market: {
    name: 'Market',
    position: [-8, 0, 5],
    aliases: ['market', 'marketplace', 'stalls'],
  },
  blacksmith: {
    name: 'Blacksmith',
    position: [8, 0, -6],
    aliases: ['blacksmith', 'forge', 'smith'],
  },
  well: {
    name: 'Village Well',
    position: [-3, 0, -4],
    aliases: ['well', 'village well', 'water'],
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
