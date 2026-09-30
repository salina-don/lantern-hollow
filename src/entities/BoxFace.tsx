import React from 'react';

const FZ = 0.215;

type Emotion = 'neutral' | 'happy' | 'waiting';

export function BoxFace({ emotion = 'neutral' }: { emotion?: Emotion }) {
  return (
    <>
      {/* Eye whites */}
      <mesh position={[-0.09, 1.50, FZ]}>
        <planeGeometry args={[0.10, 0.10]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.09, 1.50, FZ]}>
        <planeGeometry args={[0.10, 0.10]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Pupils */}
      <mesh position={[-0.09, 1.50, FZ + 0.003]}>
        <planeGeometry args={[0.055, 0.055]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.09, 1.50, FZ + 0.003]}>
        <planeGeometry args={[0.055, 0.055]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {/* Eyebrows for waiting (angry) */}
      {emotion === 'waiting' && (
        <>
          <mesh position={[-0.09, 1.56, FZ + 0.003]} rotation={[0, 0, -0.3]}>
            <planeGeometry args={[0.10, 0.025]} />
            <meshBasicMaterial color="#3a2a2a" />
          </mesh>
          <mesh position={[0.09, 1.56, FZ + 0.003]} rotation={[0, 0, 0.3]}>
            <planeGeometry args={[0.10, 0.025]} />
            <meshBasicMaterial color="#3a2a2a" />
          </mesh>
        </>
      )}

      {/* Mouth changes by emotion */}
      {emotion === 'happy' ? (
        <>
          {/* Smile — upturned arc made of 3 small rects */}
          <mesh position={[-0.05, 1.375, FZ]}>
            <planeGeometry args={[0.06, 0.03]} />
            <meshBasicMaterial color="#3a2a2a" />
          </mesh>
          <mesh position={[0.05, 1.375, FZ]}>
            <planeGeometry args={[0.06, 0.03]} />
            <meshBasicMaterial color="#3a2a2a" />
          </mesh>
          <mesh position={[0, 1.365, FZ]}>
            <planeGeometry args={[0.08, 0.03]} />
            <meshBasicMaterial color="#3a2a2a" />
          </mesh>
        </>
      ) : emotion === 'waiting' ? (
        <>
          {/* Frown — downturned */}
          <mesh position={[-0.04, 1.385, FZ]}>
            <planeGeometry args={[0.06, 0.03]} />
            <meshBasicMaterial color="#3a2a2a" />
          </mesh>
          <mesh position={[0.04, 1.385, FZ]}>
            <planeGeometry args={[0.06, 0.03]} />
            <meshBasicMaterial color="#3a2a2a" />
          </mesh>
          <mesh position={[0, 1.395, FZ]}>
            <planeGeometry args={[0.06, 0.03]} />
            <meshBasicMaterial color="#3a2a2a" />
          </mesh>
        </>
      ) : (
        <mesh position={[0, 1.38, FZ]}>
          <planeGeometry args={[0.14, 0.04]} />
          <meshBasicMaterial color="#3a2a2a" />
        </mesh>
      )}
    </>
  );
}
