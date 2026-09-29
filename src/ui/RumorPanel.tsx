import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useGameStore } from '../state/gameStore';
import { NPC_CONFIGS } from '../entities/npcConfig';

const TOTAL_NPCS = NPC_CONFIGS.length;

export function RumorPanel() {
  const rumors = useGameStore((s) => s.rumors);
  const entries = Object.values(rumors);

  if (entries.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rumors</Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {entries.map((rumor) => {
          const count = rumor.knownBy.length;
          const spread = count / TOTAL_NPCS;
          return (
            <View key={rumor.id} style={styles.row}>
              <Text style={styles.rumorText} numberOfLines={2}>
                {`"${rumor.text}"`}
              </Text>
              <View style={styles.barRow}>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${Math.round(spread * 100)}%` as any }]} />
                </View>
                <Text style={styles.count}>
                  {count}/{TOTAL_NPCS}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 8,
    padding: 8,
    minWidth: 175,
    maxWidth: 220,
    maxHeight: 200,
  },
  title: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 3,
  },
  scroll: { maxHeight: 160 },
  scrollContent: { gap: 6 },
  row: {},
  rumorText: {
    color: '#ddd',
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 3,
    lineHeight: 15,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  barBg: {
    flex: 1,
    height: 5,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 5,
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  count: {
    color: '#888',
    fontSize: 10,
    minWidth: 24,
    textAlign: 'right',
  },
});
