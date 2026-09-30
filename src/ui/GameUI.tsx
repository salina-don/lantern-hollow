import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HUD } from './HUD';
import { LogPanel } from './LogPanel';
import { RumorPanel } from './RumorPanel';
import { QuestPanel } from './QuestPanel';
import { QuestPopup } from './QuestPopup';
import { ItemPopup } from './ItemPopup';
import { SleepOverlay } from './SleepOverlay';
import { FoodPopup } from './FoodPopup';
import { GoldFloat } from './GoldFloat';
import { Joystick } from './Joystick';
import { useGameStore } from '../state/gameStore';

function GameOverOverlay() {
  const gameOver = useGameStore((s) => s.gameOver);
  const reason = useGameStore((s) => s.gameOverReason);
  if (!gameOver) return null;

  const isUnserved = reason.includes("didn't serve");
  const title = isUnserved ? 'Shop Closed!' : 'You passed out!';
  const sub = isUnserved
    ? reason
    : 'Remember to eat food and sleep at home.';

  return (
    <View style={styles.gameOverOverlay}>
      <Text style={styles.gameOverText}>{title}</Text>
      <Text style={styles.gameOverSub}>{sub}</Text>
      <TouchableOpacity
        style={styles.retryBtn}
        onPress={() => useGameStore.getState().resetStats()}
      >
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

export function GameUI() {
  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <SleepOverlay />
      <GameOverOverlay />
      <QuestPopup />
      <ItemPopup />
      <FoodPopup />
      <GoldFloat />
      <View style={styles.topRow} pointerEvents="box-none">
        <HUD />
      </View>
      <View style={styles.bottomRow} pointerEvents="box-none">
        <View style={styles.leftCol} pointerEvents="box-none">
          <QuestPanel />
          <View style={styles.gap} />
          <RumorPanel />
          <View style={styles.gap} />
          <Joystick />
        </View>
        <View style={styles.rightCol} pointerEvents="box-none">
          <LogPanel />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  bottomRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-end',
    gap: 14,
  },
  leftCol: {
    justifyContent: 'flex-end',
  },
  rightCol: {
    flex: 1,
  },
  gap: { height: 8 },
  gameOverOverlay: {
    ...(StyleSheet.absoluteFill as object),
    backgroundColor: 'rgba(30, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 600,
  },
  gameOverText: {
    color: '#c04040',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  gameOverSub: {
    color: '#a08060',
    fontSize: 14,
    marginBottom: 30,
  },
  retryBtn: {
    backgroundColor: '#c04040',
    borderRadius: 12,
    paddingHorizontal: 36,
    paddingVertical: 14,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
