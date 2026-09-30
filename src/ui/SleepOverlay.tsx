import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../state/gameStore';
import { gameTime } from '../world/timeState';

export function SleepOverlay() {
  const isSleeping = useGameStore((s) => s.isSleeping);
  const [canWake, setCanWake] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isSleeping) {
      timerRef.current = setTimeout(() => {
        gameTime.current = 6;
        const store = useGameStore.getState();
        store.adjustEnergy(100);
        store.adjustHealth(20);
        store.addLog('You slept well and feel rested.');
        setCanWake(true);
      }, 3000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      setCanWake(false);
    };
  }, [isSleeping]);

  if (!isSleeping) return null;

  const wakeUp = () => {
    useGameStore.getState().setIsSleeping(false);
    useGameStore.getState().addLog('Good morning! A new day begins.');
  };

  return (
    <View style={styles.overlay}>
      <Text style={styles.sleepText}>
        {canWake ? 'Morning has come.' : 'Sleeping...'}
      </Text>
      {canWake && (
        <TouchableOpacity style={styles.wakeBtn} onPress={wakeUp}>
          <Text style={styles.wakeBtnText}>Wake Up</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...(StyleSheet.absoluteFill as object),
    backgroundColor: 'rgba(0, 0, 10, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 500,
  },
  sleepText: {
    color: '#8090C0',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textShadowColor: 'rgba(100,130,200,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  wakeBtn: {
    backgroundColor: '#F0C040',
    borderRadius: 12,
    paddingHorizontal: 40,
    paddingVertical: 14,
  },
  wakeBtnText: {
    color: '#1a1008',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
