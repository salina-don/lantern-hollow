import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useGameStore } from '../state/gameStore';
import { cameraYaw } from './cameraState';

const DIST = 8;
const HEIGHT = 5.5;
const LOOK_UP = 1.4; // how high above player feet to look at

export function ThirdPersonCamera() {
  const { camera, gl } = useThree();
  const isDragging = useRef(false);
  const lastX = useRef(0);

  // Web: handle drag-to-rotate via canvas pointer events
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const el = gl.domElement;

    const onDown = (e: PointerEvent) => {
      isDragging.current = true;
      lastX.current = e.clientX;
    };
    const onMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      cameraYaw.current -= (e.clientX - lastX.current) * 0.007;
      lastX.current = e.clientX;
    };
    const onUp = () => { isDragging.current = false; };

    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [gl.domElement]);

  useFrame(() => {
    const [px, py, pz] = useGameStore.getState().playerPosition;
    const yaw = cameraYaw.current;
    camera.position.set(
      px + Math.sin(yaw) * DIST,
      py + HEIGHT,
      pz + Math.cos(yaw) * DIST,
    );
    camera.lookAt(px, py + LOOK_UP, pz);
  });

  return null;
}
