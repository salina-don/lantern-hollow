import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../state/gameStore';
import { ITEM_QUESTS, ITEM_MAP } from '../systems/itemData';
import { NPC_CONFIG_MAP } from '../entities/npcConfig';

export function QuestPanel() {
  const [expanded, setExpanded] = useState(true);
  const quests = useGameStore((s) => s.quests);
  const festival = useGameStore((s) => s.festivalStarted);

  const completed = ITEM_QUESTS.filter((q) => (quests[q.id] ?? 0) >= 1).length;
  const total = ITEM_QUESTS.length;

  if (!expanded) {
    return (
      <TouchableOpacity style={styles.pill} onPress={() => setExpanded(true)}>
        <Text style={styles.pillText}>
          {festival ? 'Festival!' : 'Deliveries'} {completed}/{total}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setExpanded(false)}>
        <Text style={styles.title}>
          {festival ? 'Festival!' : 'Deliveries'}{' '}
          <Text style={styles.count}>{completed}/{total}</Text>
        </Text>
      </TouchableOpacity>

      {festival && (
        <Text style={styles.festivalMsg}>
          The village celebrates! All deliveries complete.
        </Text>
      )}

      {ITEM_QUESTS.map((quest) => {
        const done = (quests[quest.id] ?? 0) >= 1;
        const npcName = NPC_CONFIG_MAP[quest.npcId]?.name ?? quest.npcId;
        const itemName = ITEM_MAP[quest.itemId]?.name ?? quest.itemId;

        return (
          <View key={quest.id} style={styles.questRow}>
            <Text style={[styles.questTitle, done && styles.questDone]}>
              {done ? '✓ ' : '→ '}
              {quest.title}
            </Text>
            {!done && (
              <Text style={styles.questHint}>
                Give {itemName} to {npcName}
              </Text>
            )}
          </View>
        );
      })}
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
    maxWidth: 230,
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
  count: {
    color: '#806830',
    fontWeight: 'normal',
    fontSize: 11,
  },
  festivalMsg: {
    color: '#F0C040',
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  questRow: {
    marginBottom: 5,
  },
  questTitle: {
    color: '#E0C070',
    fontSize: 11,
    fontWeight: 'bold',
  },
  questDone: {
    color: '#5a8a3a',
    textDecorationLine: 'line-through',
    fontWeight: 'normal',
    opacity: 0.7,
  },
  questHint: {
    color: '#A08860',
    fontSize: 10,
    marginLeft: 16,
    fontStyle: 'italic',
  },
});
