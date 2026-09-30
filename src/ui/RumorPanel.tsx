import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../state/gameStore';
import { NPC_CONFIGS } from '../entities/npcConfig';

const TOTAL_NPCS = NPC_CONFIGS.length;

export function RumorPanel() {
  const [expanded, setExpanded] = useState(false);
  const rumors = useGameStore((s) => s.rumors);
  const entries = Object.values(rumors);

  if (entries.length === 0) return null;

  if (!expanded) {
    return (
      <TouchableOpacity style={styles.pill} onPress={() => setExpanded(true)}>
        <Text style={styles.pillText}>
          ◈ {entries.length} whisper{entries.length !== 1 ? 's' : ''}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setExpanded(false)}>
        <Text style={styles.title}>◈ Whispers ▾</Text>
      </TouchableOpacity>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {entries.map((rumor) => {
          const count = rumor.knownBy.length;
          const spread = count / TOTAL_NPCS;
          return (
            <View key={rumor.id} style={styles.row}>
              <Text style={styles.rumorText} numberOfLines={2}>
                "{rumor.text}"
              </Text>
              <View style={styles.barRow}>
                <View style={styles.barBg}>
                  <View
                    style={[styles.barFill, { width: `${Math.round(spread * 100)}%` as any }]}
                  />
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
  pill: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  pillText: {
    color: '#C89030',
    fontSize: 12,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: 'rgba(8,5,2,0.72)',
    borderRadius: 12,
    padding: 10,
    minWidth: 185,
    maxWidth: 220,
    maxHeight: 210,
  },
  title: {
    color: '#C89030',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 7,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  scroll: { maxHeight: 160 },
  scrollContent: { gap: 8 },
  row: {},
  rumorText: {
    color: '#A08860',
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
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    backgroundColor: '#C89030',
    borderRadius: 2,
  },
  count: {
    color: '#605040',
    fontSize: 10,
    minWidth: 24,
    textAlign: 'right',
  },
});
