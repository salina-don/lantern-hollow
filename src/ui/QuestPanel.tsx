import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../state/gameStore';
import { QUESTS } from '../systems/questData';
import { NPC_CONFIG_MAP } from '../entities/npcConfig';

export function QuestPanel() {
  const [expanded, setExpanded] = useState(true);
  const quests = useGameStore((s) => s.quests);
  const festival = useGameStore((s) => s.festivalStarted);

  const completed = QUESTS.filter((q) => (quests[q.id] ?? 0) >= q.steps.length).length;
  const total = QUESTS.length;

  if (!expanded) {
    return (
      <TouchableOpacity style={styles.pill} onPress={() => setExpanded(true)}>
        <Text style={styles.pillText}>
          {festival ? '★ Festival!' : 'Quests'} {completed}/{total}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setExpanded(false)}>
        <Text style={styles.title}>
          {festival ? '★ Festival! ★' : 'Quests'}{' '}
          <Text style={styles.count}>{completed}/{total} ▾</Text>
        </Text>
      </TouchableOpacity>

      {festival && (
        <Text style={styles.festivalMsg}>
          The village celebrates! All quests complete.
        </Text>
      )}

      {QUESTS.map((quest) => {
        const step = quests[quest.id] ?? 0;
        const done = step >= quest.steps.length;
        const active = step > 0 && !done;
        const discovered = step > 0;

        let hint = '';
        if (active) {
          const target = quest.steps[step].target;
          const name = NPC_CONFIG_MAP[target]?.name ?? target;
          hint = `Talk to ${name}`;
        }

        return (
          <View key={quest.id} style={styles.questRow}>
            <Text
              style={[
                styles.questTitle,
                done && styles.questDone,
                active && styles.questActive,
              ]}
            >
              {done ? '✓ ' : active ? '→ ' : '  '}
              {quest.title}
            </Text>
            {active && <Text style={styles.questHint}>{hint}</Text>}
            {!discovered && !done && (
              <Text style={styles.questGiver}>
                {NPC_CONFIG_MAP[quest.giver]?.name ?? quest.giver}
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
    color: '#807060',
    fontSize: 11,
  },
  questDone: {
    color: '#5a8a3a',
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  questActive: {
    color: '#E0C070',
    fontWeight: 'bold',
  },
  questHint: {
    color: '#A08860',
    fontSize: 10,
    marginLeft: 16,
    fontStyle: 'italic',
  },
  questGiver: {
    color: '#605040',
    fontSize: 10,
    marginLeft: 16,
  },
});
