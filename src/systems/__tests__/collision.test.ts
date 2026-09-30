import { wouldCollide } from '../collision';
import { useGameStore } from '../../state/gameStore';

describe('collision', () => {
  it('blocks on a tavern wall', () => {
    expect(wouldCollide(8, 6.75, 0.3)).toBe(true);
  });

  it('allows walking inside the tavern', () => {
    expect(wouldCollide(8, 5, 0.3)).toBe(false);
  });

  it('blocks the tavern door gap when closed', () => {
    expect(wouldCollide(7.5, 3.25, 0.3)).toBe(true);
  });

  it('allows walking through the tavern door gap when open', () => {
    useGameStore.getState().toggleDoor('tavern');
    expect(wouldCollide(7.5, 3.25, 0.3)).toBe(false);
    useGameStore.getState().toggleDoor('tavern');
  });

  it('blocks next to the tavern front wall away from the door', () => {
    expect(wouldCollide(9.5, 3.25, 0.3)).toBe(true);
  });

  it('blocks on a tree trunk', () => {
    expect(wouldCollide(-10, -4.5, 0.3)).toBe(true);
  });

  it('allows open ground', () => {
    expect(wouldCollide(0, 0, 0.3)).toBe(false);
  });

  it('blocks on the well', () => {
    expect(wouldCollide(-3, -4, 0.3)).toBe(true);
  });

  it('blocks on a gate pillar', () => {
    expect(wouldCollide(-1.8, -12, 0.3)).toBe(true);
  });

  it('allows walking through the gate gap', () => {
    expect(wouldCollide(0, -12, 0.3)).toBe(false);
  });

  it('blocks on the pond', () => {
    expect(wouldCollide(5.5, 10, 0.3)).toBe(true);
  });

  it('allows inside the bakery', () => {
    expect(wouldCollide(-8, 5, 0.3)).toBe(false);
  });

  it('blocks the bakery door gap when closed', () => {
    expect(wouldCollide(-8.48, 3.5, 0.3)).toBe(true);
  });

  it('allows through the bakery door gap when open', () => {
    useGameStore.getState().toggleDoor('bakery');
    expect(wouldCollide(-8.48, 3.5, 0.3)).toBe(false);
    useGameStore.getState().toggleDoor('bakery');
  });

  it('allows inside the forge', () => {
    expect(wouldCollide(8, -6, 0.3)).toBe(false);
  });
});
