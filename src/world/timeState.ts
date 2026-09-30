export type GamePhase = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night';

export const DAY_DURATION = 240;
export const HOURS_PER_SECOND = 24 / DAY_DURATION;

export const gameTime = { current: 8 };

export function getPhase(hour: number): GamePhase {
  if (hour >= 5.5 && hour < 7.5) return 'dawn';
  if (hour >= 7.5 && hour < 11.5) return 'morning';
  if (hour >= 11.5 && hour < 14) return 'noon';
  if (hour >= 14 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 20.5) return 'dusk';
  return 'night';
}

export function isNight(hour: number): boolean {
  return hour >= 20.5 || hour < 5.5;
}
