import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useGameStore } from '../state/gameStore';
import { NPC_CONFIG_MAP } from '../entities/npcConfig';
import { ITEMS } from '../systems/itemData';
import { giveItem } from '../systems/questSystem';
import { ItemIcon } from './ItemIcon';

export function ItemPopup() {
  const npcId = useGameStore((s) => s.showItemPopup);
  const setShowItemPopup = useGameStore((s) => s.setShowItemPopup);

  if (!npcId) return null;

  const cfg = NPC_CONFIG_MAP[npcId];
  const npcName = cfg?.name ?? npcId;

  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <Text style={styles.title}>Give to {npcName}</Text>
        <Text style={styles.subtitle}>Select an item from your shop</Text>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.grid}>
          {ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              activeOpacity={0.7}
              onPress={() => giveItem(npcId, item.id)}
            >
              <ItemIcon itemId={item.id} size={48} />
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDesc}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.closeBtn} onPress={() => setShowItemPopup(null)}>
          <Text style={styles.closeText}>Close Shop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...(StyleSheet.absoluteFill as object),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 200,
  },
  card: {
    backgroundColor: 'rgba(16, 10, 6, 0.95)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#C89030',
    padding: 20,
    maxWidth: 420,
    minWidth: 300,
    maxHeight: '80%',
  },
  title: {
    color: '#C89030',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: '#806830',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 14,
  },
  scroll: {
    maxHeight: 340,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  itemCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: 12,
    width: 110,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200,144,48,0.2)',
    gap: 6,
  },
  itemName: {
    color: '#E0D8CC',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  itemDesc: {
    color: '#807060',
    fontSize: 9,
    textAlign: 'center',
  },
  closeBtn: {
    marginTop: 14,
    backgroundColor: 'rgba(200,144,48,0.2)',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeText: {
    color: '#C89030',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
