import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useGameStore } from '../state/gameStore';

const shadow = {
  textShadowColor: 'rgba(0,0,0,0.6)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 2,
};

export function LogPanel() {
  const log = useGameStore((s) => s.log);
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    ref.current?.scrollToEnd({ animated: true });
  }, [log]);

  if (log.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView ref={ref} style={styles.scroll} contentContainerStyle={styles.content}>
        {log.slice(-8).map((entry, i, arr) => {
          const age = arr.length - 1 - i;
          const opacity = Math.max(0.3, 1 - age * 0.1);
          return (
            <Text key={i} style={[styles.entry, { opacity }]}>
              {entry}
            </Text>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  scroll: { maxHeight: 80 },
  content: { paddingBottom: 1 },
  entry: {
    color: '#908060',
    fontSize: 11,
    marginVertical: 1,
    lineHeight: 15,
    ...shadow,
  },
});
