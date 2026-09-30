import React, { useEffect, useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useGameStore } from '../state/gameStore';

function FloatItem({ id, text, color }: { id: number; text: string; color: string }) {
  const opacity = useMemo(() => new Animated.Value(1), []);
  const translateY = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -60, duration: 1200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
    ]).start(() => {
      useGameStore.getState().removeGoldFloat(id);
    });
  }, [id, opacity, translateY]);

  return (
    <Animated.Text
      style={[
        styles.floatText,
        { color, opacity, transform: [{ translateY }] },
      ]}
    >
      {text}
    </Animated.Text>
  );
}

export function GoldFloat() {
  const floats = useGameStore((s) => s.goldFloats);
  if (floats.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {floats.map((f) => (
        <FloatItem key={f.id} id={f.id} text={f.text} color={f.color} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 150,
  },
  floatText: {
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
});
