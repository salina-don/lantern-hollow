import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HUD } from './HUD';
import { ChatBox } from './ChatBox';
import { LogPanel } from './LogPanel';
import { RumorPanel } from './RumorPanel';
import { QuestPanel } from './QuestPanel';
import { ApiKeyField } from './ApiKeyField';
import { Joystick } from './Joystick';

export function GameUI() {
  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.topRow} pointerEvents="box-none">
        <HUD />
        <View style={styles.spacer} pointerEvents="none" />
        <ApiKeyField />
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
          <View style={styles.gap} />
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
    padding: 16,
    alignItems: 'flex-start',
  },
  spacer: { flex: 1 },
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
});
