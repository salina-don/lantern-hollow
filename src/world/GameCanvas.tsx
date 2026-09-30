import React from 'react';
import { Canvas } from '@react-three/fiber';
import type { CanvasProps } from '@react-three/fiber';
import { View, StyleSheet } from 'react-native';

// Web Canvas: style accepts CSSProperties (% strings are valid)
export function GameCanvas({ children, ...props }: CanvasProps) {
  return (
    <View style={styles.container}>
      <Canvas {...props} style={{ width: '100%', height: '100%' } as object}>
        {children}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
