import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber/native';
import type { CanvasProps } from '@react-three/fiber/native';
import { View, StyleSheet, PanResponder } from 'react-native';
import { cameraYaw } from './cameraState';

// Native Canvas: wraps r3f/native Canvas and handles camera-drag via PanResponder.
export function GameCanvas({ children, ...props }: CanvasProps) {
  const prevDx = useRef(0);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { prevDx.current = 0; },
      onPanResponderMove: (_, gs) => {
        const delta = gs.dx - prevDx.current;
        prevDx.current = gs.dx;
        cameraYaw.current -= delta * 0.008;
      },
    }),
  ).current;

  return (
    <View style={styles.container} {...pan.panHandlers}>
      <Canvas {...props} style={styles.canvas}>
        {children}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  canvas: { flex: 1 },
});
