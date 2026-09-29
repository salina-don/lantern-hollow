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
        <View style={[styles.activeCard, { borderLeftColor: activeConfig.color }]}>
          <Text style={[styles.activeName, { color: activeConfig.color }]}>
            {activeConfig.name}
          </Text>
          <Text style={styles.activeRole}>{activeConfig.role}</Text>
        </View>
      )}

      {/* Compact NPC status row */}
      <View style={styles.npcRow}>
        {npcs.map((npc) => {
          const cfg = NPC_CONFIG_MAP[npc.id];
          const color = cfg?.color ?? '#888';
          const busy = npc.isTalking || !!npc.following;
          const selected = npc.id === activeId;
          return (
            <View key={npc.id} style={styles.npcChip}>
              <View
                style={[
                  styles.npcDot,
                  { backgroundColor: color },
                  !busy && !selected && styles.npcDotIdle,
                ]}
              />
              <Text style={[styles.npcInitial, selected && { color, fontWeight: 'bold' }]}>
                {(cfg?.name ?? npc.id).charAt(0)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Kenney-style key badge controls */}
      <View style={styles.controls}>
        <View style={styles.controlGroup}>
          <View style={styles.keyBadge}>
            <Text style={styles.keyText}>WASD</Text>
          </View>
          <Text style={styles.controlLabel}>move</Text>
        </View>
        <View style={styles.controlGroup}>
          <View style={styles.keyBadge}>
            <Text style={styles.keyText}>E</Text>
          </View>
          <Text style={styles.controlLabel}>interact</Text>
        </View>
        <View style={styles.controlGroup}>
          <View style={styles.keyBadge}>
            <Text style={styles.keyText}>drag</Text>
          </View>
          <Text style={styles.controlLabel}>orbit</Text>
        </View>
      </View>
    </View>
  );
}

const shadow = {
  textShadowColor: 'rgba(0,0,0,0.7)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 3,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.38)',
    borderRadius: 12,
    padding: 14,
    minWidth: 170,
    maxWidth: 200,
  },
  title: {
    color: '#F0C040',
    fontWeight: '900',
    fontSize: 20,
    marginBottom: 1,
    ...shadow,
  },
  coord: {
    color: '#706050',
    fontSize: 10,
    marginBottom: 10,
    fontVariant: ['tabular-nums'] as any,
  },
  activeCard: {
    borderLeftWidth: 3,
    paddingLeft: 9,
    paddingVertical: 5,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 4,
  },
  activeName: {
    fontWeight: 'bold',
    fontSize: 14,
    ...shadow,
  },
  activeRole: { color: '#A89070', fontSize: 11 },
  npcRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  npcChip: { alignItems: 'center', gap: 3 },
  npcDot: { width: 8, height: 8, borderRadius: 4 },
  npcDotIdle: { opacity: 0.35 },
  npcInitial: { color: '#807060', fontSize: 10 },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  controlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  keyBadge: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  keyText: {
    color: '#E0D0B0',
    fontSize: 10,
    fontWeight: 'bold',
  },
  controlLabel: {
    color: '#908060',
    fontSize: 10,
  },
});
