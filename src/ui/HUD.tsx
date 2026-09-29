import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../state/gameStore';

export function HUD() {
  const pos = useGameStore((s) => s.playerPosition);
  const npcs = useGameStore((s) => s.npcs);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lantern Hollow</Text>
      <Text style={styles.coord}>
        {pos[0].toFixed(1)}, {pos[2].toFixed(1)}
      </Text>
      <Text style={styles.subtitle}>Villagers</Text>
      {npcs.map((npc) => (
        <Text key={npc.id} style={styles.npc}>
          {npc.name}
          {npc.isTalking ? ' [talking]' : ''} — {npc.currentActivity}
        </Text>
      ))}
      <Text style={styles.hint}>WASD / Arrow keys to move</Text>
      <Text style={styles.hint}>Click NPC to talk</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 8,
    padding: 10,
    minWidth: 170,
  },
  title: { color: '#FFD700', fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
  coord: { color: '#888', fontSize: 10, marginBottom: 6 },
  subtitle: { color: '#88CCFF', fontSize: 11, fontWeight: 'bold', marginBottom: 3 },
  npc: { color: '#ccc', fontSize: 11, marginVertical: 1 },
  hint: { color: '#666', fontSize: 10, marginTop: 4 },
});
