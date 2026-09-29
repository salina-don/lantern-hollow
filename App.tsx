import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Scene } from './src/world/Scene';
import { GameUI } from './src/ui/GameUI';

export default function App() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Scene />
      <GameUI />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});
