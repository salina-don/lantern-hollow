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
      <Text style={styles.titleSub}>MEDIEVAL VILLAGE</Text>
      <Text style={styles.coord}>
        {pos[0].toFixed(1)}, {pos[2].toFixed(1)}
      </Text>

      {activeConfig && (
        <View style={[styles.activeBox, { borderLeftColor: activeConfig.color }]}>
          <View style={[styles.activeColorDot, { backgroundColor: activeConfig.color }]} />
          <View>
            <Text style={[styles.activeName, { color: activeConfig.color }]}>{activeConfig.name}</Text>
            <Text style={styles.activeRole}>{activeConfig.role}</Text>
          </View>
        </View>
      )}

      <View style={styles.divider} />
      <Text style={styles.sectionLabel}>VILLAGERS</Text>
      {npcs.map((npc) => {
        const cfg = NPC_CONFIG_MAP[npc.id];
        const isActive = npc.id === activeId;
        const statusText = npc.following
          ? 'following'
          : npc.isTalking
          ? 'talking'
          : npc.currentActivity;
        return (
          <View key={npc.id} style={styles.npcRow}>
            <View
              style={[
                styles.npcDot,
                { backgroundColor: cfg?.color ?? '#888' },
                !npc.isTalking && !isActive && styles.npcDotDim,
              ]}
            />
            <Text style={[styles.npcName, isActive && styles.npcNameActive]}>
              {cfg?.name ?? npc.id}
            </Text>
            <Text style={styles.npcStatus} numberOfLines={1}>
              {statusText}
            </Text>
          </View>
        );
      })}

      <View style={styles.hintBox}>
        <Text style={styles.hint}>WASD · drag to orbit</Text>
        <Text style={styles.hint}>Click NPC or press E</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(16,10,4,0.92)',
    borderRadius: 10,
    padding: 12,
    minWidth: 185,
    maxWidth: 215,
    borderWidth: 1,
    borderColor: 'rgba(200,150,50,0.28)',
  },
  title: {
    color: '#F0C040',
    fontWeight: '900',
    fontSize: 18,
    marginBottom: 1,
  },
  titleSub: {
    color: '#7A5A20',
    fontSize: 9,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  coord: { color: '#60503A', fontSize: 10, marginBottom: 8, fontVariant: ['tabular-nums'] as any },
  activeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
    paddingLeft: 8,
    paddingVertical: 5,
    marginBottom: 8,
    backgroundColor: 'rgba(255,200,80,0.06)',
    borderRadius: 4,
  },
  activeColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  activeName: { fontWeight: 'bold', fontSize: 14 },
  activeRole: { color: '#A89070', fontSize: 11 },
  divider: {
    height: 1,
    backgroundColor: 'rgba(200,150,50,0.2)',
    marginBottom: 7,
  },
  sectionLabel: {
    color: '#7A9AC0',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  npcRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  npcDot: { width: 7, height: 7, borderRadius: 4, marginRight: 7 },
  npcDotDim: { opacity: 0.45 },
  npcName: { color: '#C8B890', fontSize: 12, width: 56 },
  npcNameActive: { color: '#F0C040', fontWeight: 'bold' },
  npcStatus: { color: '#60503A', fontSize: 10, flex: 1 },
  hintBox: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(200,150,50,0.15)',
    paddingTop: 6,
  },
  hint: { color: '#50402A', fontSize: 10, marginVertical: 1 },
});
