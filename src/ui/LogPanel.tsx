import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useGameStore } from '../state/gameStore';

export function LogPanel() {
  const log = useGameStore((s) => s.log);
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    ref.current?.scrollToEnd({ animated: true });
  }, [log]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log</Text>
      <ScrollView ref={ref} style={styles.scroll} contentContainerStyle={styles.content}>
        {log.slice(-30).map((entry, i) => (
          <Text key={i} style={styles.entry}>
            {entry}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 8,
  },
  title: { color: '#FFD700', fontWeight: 'bold', fontSize: 12, marginBottom: 3 },
  scroll: { maxHeight: 120 },
  content: { paddingBottom: 2 },
  entry: { color: '#ccc', fontSize: 11, marginVertical: 1 },
});
