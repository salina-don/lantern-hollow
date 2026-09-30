import { findPath, buildNavGrid, resetNavGrid } from '../pathfinding';

beforeAll(() => {
  resetNavGrid();
  buildNavGrid();
});

describe('pathfinding', () => {
  it('finds a path between two open points', () => {
    const path = findPath(0, 0, 2, 2);
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThan(0);
    const last = path![path!.length - 1];
    expect(last[0]).toBeCloseTo(2, 0);
    expect(last[2]).toBeCloseTo(2, 0);
  });

  it('path from outside tavern to inside goes through the door', () => {
    const path = findPath(8, 1, 8, 5);
    expect(path).not.toBeNull();
    const doorZ = 3.25;
    const doorX = 7.52;
    const passesNearDoor = path!.some(
      ([x, , z]) => Math.abs(z - doorZ) < 1.5 && Math.abs(x - doorX) < 2,
    );
    expect(passesNearDoor).toBe(true);
  });

  it('path from outside bakery to inside goes through the door', () => {
    const path = findPath(-8, 1, -8, 5);
    expect(path).not.toBeNull();
    const doorZ = 3.5;
    const passesNearDoor = path!.some(([, , z]) => Math.abs(z - doorZ) < 1.5);
    expect(passesNearDoor).toBe(true);
  });

  it('same start and end returns minimal path', () => {
    const path = findPath(0, 0, 0, 0);
    expect(path).not.toBeNull();
    expect(path!.length).toBe(1);
  });

  it('path goes around the well', () => {
    const path = findPath(-5, -4, -1, -4);
    expect(path).not.toBeNull();
    const hitsWell = path!.some(
      ([x, , z]) => Math.abs(x - (-3)) < 0.7 && Math.abs(z - (-4)) < 0.7,
    );
    expect(hitsWell).toBe(false);
  });

  it('path goes through the gate gap', () => {
    const path = findPath(0, -10, 0, -14);
    expect(path).not.toBeNull();
    const passesGate = path!.some(([, , z]) => Math.abs(z - (-12)) < 1.5);
    expect(passesGate).toBe(true);
  });
});
