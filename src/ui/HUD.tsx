import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../state/gameStore';
import { NPC_CONFIG_MAP } from '../entities/npcConfig';
import { GamePhase } from '../world/timeState';

const PHASE_COLORS: Record<GamePhase, string> = {
  dawn: '#FF9060',
  morning: '#F0C040',
  noon: '#FFEE80',
  afternoon: '#F0C040',
  dusk: '#E06030',
  night: '#8090C0',
};

const PHASE_LABELS: Record<GamePhase, string> = {
  dawn: 'Dawn',
  morning: 'Morning',
  noon: 'Noon',
  afternoon: 'Afternoon',
  dusk: 'Dusk',
  night: 'Night',
};

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statBarBg}>
        <View style={[styles.statBarFill, { width: `${Math.max(0, value)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export function HUD() {
  const npcs = useGameStore((s) => s.npcs);
  const activeId = useGameStore((s) => s.activeConversation);
  const activeConfig = activeId ? NPC_CONFIG_MAP[activeId] : null;
  const phase = useGameStore((s) => s.gamePhase);
  const phaseColor = PHASE_COLORS[phase];
  const gold = useGameStore((s) => s.gold);
  const health = useGameStore((s) => s.health);
  const hunger = useGameStore((s) => s.hunger);
  const energy = useGameStore((s) => s.energy);
  const day = useGameStore((s) => s.day);
  const totalGoldEarned = useGameStore((s) => s.totalGoldEarned);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lantern Hollow</Text>
      <View style={styles.timeRow}>
        <View style={[styles.timeDot, { backgroundColor: phaseColor }]} />
        <Text style={[styles.phaseText, { color: phaseColor }]}>
          Day {day} · {PHASE_LABELS[phase]}
        </Text>
      </View>
      <Text style={styles.goldText}>{gold} gold  (earned: {totalGoldEarned})</Text>

      <View style={styles.statsBlock}>
        <StatBar label="HP" value={health} color="#c04040" />
        <StatBar label="Food" value={hunger} color="#c0a040" />
        <StatBar label="Rest" value={energy} color="#4080c0" />
      </View>

      {activeConfig && (
        <View style={[styles.activeCard, { borderLeftColor: activeConfig.color }]}>
          <Text style={[styles.activeName, { color: activeConfig.color }]}>
            {activeConfig.name}
          </Text>
          <Text style={styles.activeRole}>{activeConfig.role}</Text>
        </View>
      )}

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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  timeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  phaseText: {
    fontSize: 12,
    fontWeight: 'bold',
    ...shadow,
  },
  goldText: {
    color: '#F0C040',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
    ...shadow,
  },
  statsBlock: {
    gap: 4,
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    color: '#A09080',
    fontSize: 10,
    fontWeight: 'bold',
    width: 30,
  },
  statBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 4,
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
