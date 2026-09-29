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
      <Text style={styles.title}>› Activity</Text>
      <ScrollView ref={ref} style={styles.scroll} contentContainerStyle={styles.content}>
        {log.slice(-25).map((entry, i) => (
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
    backgroundColor: 'rgba(16,10,4,0.88)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(200,150,50,0.2)',
  },
  title: {
    color: '#8090A8',
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: 5,
    letterSpacing: 0.6,
  },
  scroll: { maxHeight: 100 },
  content: { paddingBottom: 2 },
  entry: { color: '#907060', fontSize: 11, marginVertical: 1, lineHeight: 16 },
});
