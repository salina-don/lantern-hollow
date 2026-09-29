import React, { useRef, useState } from 'react';
import { Platform, View, StyleSheet, PanResponder } from 'react-native';
import { joystickInput } from '../entities/joystickState';

const BASE_R = 50;
const KNOB_R = 22;

export function Joystick() {
  // Web: WASD handles movement; joystick is native-only
  if (Platform.OS === 'web') return null;
  return <NativeJoystick />;
}

function NativeJoystick() {
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        const len = Math.sqrt(gs.dx ** 2 + gs.dy ** 2);
        const scale = len > BASE_R ? BASE_R / len : 1;
        const kx = gs.dx * scale;
        const ky = gs.dy * scale;
        setKnob({ x: kx, y: ky });
        joystickInput.current = { x: kx / BASE_R, y: ky / BASE_R };
      },
      onPanResponderRelease: () => {
        setKnob({ x: 0, y: 0 });
        joystickInput.current = { x: 0, y: 0 };
      },
    }),
  ).current;

  return (
    <View style={styles.base} {...pan.panHandlers}>
      <View
        style={[
          styles.knob,
          { transform: [{ translateX: knob.x }, { translateY: knob.y }] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: BASE_R * 2,
    height: BASE_R * 2,
    borderRadius: BASE_R,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  knob: {
    width: KNOB_R * 2,
    height: KNOB_R * 2,
    borderRadius: KNOB_R,
    backgroundColor: 'rgba(255,255,255,0.48)',
    position: 'absolute',
  },
});
