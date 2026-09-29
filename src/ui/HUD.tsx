import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../state/gameStore';
import { NPC_CONFIG_MAP } from '../entities/npcConfig';

export function HUD() {
  const pos = useGameStore((s) => s.playerPosition);
  const npcs = useGameStore((s) => s.npcs);
  const activeId = useGameStore((s) => s.activeConversation);

  const activeConfig = activeId ? NPC_CONFIG_MAP[activeId] : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lantern Hollow</Text>
      <Text style={styles.coord}>
        {pos[0].toFixed(1)}, {pos[2].toFixed(1)}
      </Text>

      {activeConfig && (
        <View style={styles.activeBox}>
          <Text style={styles.activeName}>{activeConfig.name}</Text>
          <Text style={styles.activeRole}>{activeConfig.role}</Text>
          <Text style={styles.activePersonality} numberOfLines={2}>
            {activeConfig.personality}
          </Text>
        </View>
      )}

      <Text style={styles.subtitle}>Villagers</Text>
      {npcs.map((npc) => {
        const cfg = NPC_CONFIG_MAP[npc.id];
        return (
          <Text key={npc.id} style={styles.npc}>
            {cfg?.name ?? npc.id}
            {npc.isTalking ? ' [talking]' : ''} — {npc.currentActivity}
          </Text>
        );
      })}

      <Text style={styles.hint}>WASD · drag to orbit</Text>
      <Text style={styles.hint}>Click NPC or press E</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 8,
    padding: 10,
    minWidth: 175,
    maxWidth: 200,
  },
  title: { color: '#FFD700', fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
  coord: { color: '#666', fontSize: 10, marginBottom: 6 },
  activeBox: {
    borderTopWidth: 1,
    borderTopColor: '#444',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingVertical: 5,
    marginBottom: 6,
  },
  activeName: { color: '#FFD700', fontWeight: 'bold', fontSize: 13 },
  activeRole: { color: '#aaa', fontSize: 11, marginBottom: 2 },
  activePersonality: { color: '#888', fontSize: 10, fontStyle: 'italic' },
  subtitle: { color: '#88CCFF', fontSize: 11, fontWeight: 'bold', marginBottom: 3 },
  npc: { color: '#bbb', fontSize: 11, marginVertical: 1 },
  hint: { color: '#555', fontSize: 10, marginTop: 3 },
});
