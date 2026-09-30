import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../state/gameStore';

export function StatsLoop() {
  const hungerAcc = useRef(0);
  const energyAcc = useRef(0);
  const healthAcc = useRef(0);
  const grace = useRef(60);

  useFrame((_, delta) => {
    const store = useGameStore.getState();
    if (store.isSleeping || store.gameOver) return;

    if (grace.current > 0) {
      grace.current -= delta;
      return;
    }

    hungerAcc.current += delta;
    if (hungerAcc.current >= 4) {
      hungerAcc.current -= 4;
      if (store.hunger > 0) store.adjustHunger(-1);
    }

    energyAcc.current += delta;
    if (energyAcc.current >= 12) {
      energyAcc.current -= 12;
      if (store.energy > 0) store.adjustEnergy(-1);
    }

    if (store.hunger <= 0 || store.energy <= 0) {
      healthAcc.current += delta;
      if (healthAcc.current >= 5) {
        healthAcc.current -= 5;
        let dmg = 0;
        if (store.hunger <= 0) dmg += 2;
        if (store.energy <= 0) dmg += 1;
        store.adjustHealth(-dmg);
      }
    } else {
      healthAcc.current = 0;
    }

    if (store.health <= 0) store.setGameOver(true);
  });

  return null;
}
