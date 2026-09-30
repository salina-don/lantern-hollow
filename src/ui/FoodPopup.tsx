import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../state/gameStore';
import { ItemIcon } from './ItemIcon';

interface FoodItem {
  id: string;
  name: string;
  iconId: string;
  cost: number;
  restore: number;
}

const FOODS: FoodItem[] = [
  { id: 'apple', name: 'Apple', iconId: 'apple', cost: 3, restore: 15 },
  { id: 'bread', name: 'Bread', iconId: 'food_bread', cost: 5, restore: 30 },
  { id: 'stew', name: 'Hearty Stew', iconId: 'stew', cost: 10, restore: 60 },
];

function buyFood(food: FoodItem) {
  const store = useGameStore.getState();
  if (store.gold < food.cost) {
    store.addLog("You don't have enough gold!");
    return;
  }
  store.addGold(-food.cost);
  store.addGoldFloat(`-${food.cost} gold`, '#e06060');
  store.adjustHunger(food.restore);
  store.addLog(`You ate ${food.name}. -${food.cost} gold, +${food.restore} hunger.`);
}

export function FoodPopup() {
  const show = useGameStore((s) => s.showFoodPopup);
  const gold = useGameStore((s) => s.gold);

  if (!show) return null;

  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <Text style={styles.title}>Food Stall</Text>
        <Text style={styles.subtitle}>You have {gold} gold</Text>

        {FOODS.map((food) => (
          <TouchableOpacity
            key={food.id}
            style={[styles.foodRow, gold < food.cost && styles.foodRowDisabled]}
            activeOpacity={0.7}
            onPress={() => buyFood(food)}
            disabled={gold < food.cost}
          >
            <ItemIcon itemId={food.iconId} size={36} />
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodDesc}>+{food.restore} hunger</Text>
            </View>
            <Text style={[styles.foodCost, gold < food.cost && styles.foodCostDisabled]}>
              {food.cost}g
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => useGameStore.getState().setShowFoodPopup(false)}
        >
          <Text style={styles.closeText}>Close</Text>
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
    borderColor: '#80a050',
    padding: 20,
    minWidth: 260,
    maxWidth: 320,
  },
  title: {
    color: '#80a050',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: '#F0C040',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 14,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  foodRowDisabled: {
    opacity: 0.4,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    color: '#E0D8CC',
    fontSize: 14,
    fontWeight: 'bold',
  },
  foodDesc: {
    color: '#80a050',
    fontSize: 11,
  },
  foodCost: {
    color: '#F0C040',
    fontSize: 14,
    fontWeight: 'bold',
  },
  foodCostDisabled: {
    color: '#806830',
  },
  closeBtn: {
    marginTop: 8,
    backgroundColor: 'rgba(128,160,80,0.2)',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeText: {
    color: '#80a050',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
