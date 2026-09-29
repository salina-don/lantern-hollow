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
      <Text style={styles.title}>◈ Whispers</Text>
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
    backgroundColor: 'rgba(16,10,4,0.92)',
    borderRadius: 10,
    padding: 10,
    minWidth: 185,
    maxWidth: 220,
    maxHeight: 210,
    borderWidth: 1,
    borderColor: 'rgba(200,150,50,0.28)',
  },
  title: {
    color: '#E8A830',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200,150,50,0.2)',
    paddingBottom: 5,
    letterSpacing: 0.4,
  },
  scroll: { maxHeight: 165 },
  scrollContent: { gap: 8 },
  row: {},
  rumorText: {
    color: '#B8A070',
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 4,
    lineHeight: 16,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barBg: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255,200,80,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 5,
    backgroundColor: '#C88020',
    borderRadius: 3,
  },
  count: {
    color: '#706050',
    fontSize: 10,
    minWidth: 24,
    textAlign: 'right',
  },
});
