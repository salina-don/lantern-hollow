import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HUD } from './HUD';
import { ChatBox } from './ChatBox';
import { LogPanel } from './LogPanel';
import { ApiKeyField } from './ApiKeyField';

export function GameUI() {
  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.topRow} pointerEvents="box-none">
        <HUD />
        <View style={styles.spacer} pointerEvents="none" />
        <ApiKeyField />
      </View>
      <View style={styles.bottomRow} pointerEvents="box-none">
        <View style={styles.half}>
          <LogPanel />
        </View>
        <View style={styles.half}>
          <ChatBox />
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
    padding: 10,
    alignItems: 'flex-start',
  },
  spacer: { flex: 1 },
  bottomRow: {
    flexDirection: 'row',
    padding: 10,
    gap: 10,
    alignItems: 'flex-end',
  },
  half: { flex: 1 },
});
