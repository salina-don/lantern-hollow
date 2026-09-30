import React from 'react';
import { View, StyleSheet } from 'react-native';

function Millstone() {
  return (
    <View style={s.wrap}>
      <View style={[s.circle, { width: 30, height: 30, backgroundColor: '#8a8a8a' }]}>
        <View style={[s.circle, { width: 14, height: 14, backgroundColor: '#6a6a6a' }]}>
          <View style={[s.circle, { width: 6, height: 6, backgroundColor: '#4a4a4a' }]} />
        </View>
      </View>
    </View>
  );
}

function Salve() {
  return (
    <View style={s.wrap}>
      {/* Jar body */}
      <View style={{ width: 18, height: 18, backgroundColor: '#4a9a5a', borderRadius: 4 }}>
        <View style={{ width: 18, height: 6, backgroundColor: '#3a7a4a', borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
      </View>
      {/* Lid */}
      <View style={{ position: 'absolute', top: 4, width: 22, height: 6, backgroundColor: '#6ab06a', borderRadius: 2 }} />
      {/* Leaf */}
      <View style={{ position: 'absolute', top: 0, right: 6, width: 8, height: 6, backgroundColor: '#80d060', borderRadius: 4 }} />
    </View>
  );
}

function Tome() {
  return (
    <View style={s.wrap}>
      {/* Book cover */}
      <View style={{ width: 22, height: 26, backgroundColor: '#8a5a30', borderRadius: 3 }}>
        {/* Spine */}
        <View style={{ position: 'absolute', left: 0, width: 4, height: 26, backgroundColor: '#6a4020', borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }} />
        {/* Page lines */}
        <View style={{ position: 'absolute', top: 7, left: 7, width: 10, height: 2, backgroundColor: '#d0c0a0' }} />
        <View style={{ position: 'absolute', top: 12, left: 7, width: 10, height: 2, backgroundColor: '#d0c0a0' }} />
        <View style={{ position: 'absolute', top: 17, left: 7, width: 8, height: 2, backgroundColor: '#d0c0a0' }} />
      </View>
    </View>
  );
}

function Rations() {
  return (
    <View style={s.wrap}>
      {/* Pouch */}
      <View style={{ width: 22, height: 20, backgroundColor: '#c07830', borderRadius: 4 }}>
        <View style={{ position: 'absolute', top: 3, left: 3, width: 16, height: 6, backgroundColor: '#a06020', borderRadius: 2 }} />
      </View>
      {/* Tie */}
      <View style={{ position: 'absolute', top: 2, width: 12, height: 4, backgroundColor: '#e0a050', borderRadius: 2 }} />
      {/* Food peeking out */}
      <View style={{ position: 'absolute', top: -2, right: 8, width: 6, height: 6, backgroundColor: '#d04040', borderRadius: 3 }} />
    </View>
  );
}

function Flour() {
  return (
    <View style={s.wrap}>
      {/* Sack */}
      <View style={{ width: 20, height: 22, backgroundColor: '#e0d0a0', borderRadius: 4 }}>
        <View style={{ position: 'absolute', top: 6, left: 4, width: 12, height: 3, backgroundColor: '#c8b880' }} />
        <View style={{ position: 'absolute', top: 12, left: 5, width: 10, height: 3, backgroundColor: '#c8b880' }} />
      </View>
      {/* Tie at top */}
      <View style={{ position: 'absolute', top: 0, width: 10, height: 5, backgroundColor: '#b0a070', borderRadius: 3 }} />
    </View>
  );
}

function Bread() {
  return (
    <View style={s.wrap}>
      {/* Loaf */}
      <View style={{ width: 28, height: 16, backgroundColor: '#d4a040', borderRadius: 8 }}>
        {/* Score marks */}
        <View style={{ position: 'absolute', top: 3, left: 6, width: 5, height: 2, backgroundColor: '#b08020', borderRadius: 1, transform: [{ rotate: '-20deg' }] }} />
        <View style={{ position: 'absolute', top: 3, left: 13, width: 5, height: 2, backgroundColor: '#b08020', borderRadius: 1, transform: [{ rotate: '-20deg' }] }} />
        <View style={{ position: 'absolute', top: 3, left: 20, width: 5, height: 2, backgroundColor: '#b08020', borderRadius: 1, transform: [{ rotate: '-20deg' }] }} />
      </View>
    </View>
  );
}

function Horseshoe() {
  return (
    <View style={s.wrap}>
      {/* U-shape using 3 bars */}
      <View style={{ width: 22, height: 24, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 22, flex: 1 }}>
          <View style={{ width: 6, height: 24, backgroundColor: '#a0a8b0', borderTopLeftRadius: 3 }} />
          <View style={{ width: 6, height: 24, backgroundColor: '#a0a8b0', borderTopRightRadius: 3 }} />
        </View>
        <View style={{ position: 'absolute', bottom: 0, width: 22, height: 8, backgroundColor: '#a0a8b0', borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }} />
        {/* Inner cutout */}
        <View style={{ position: 'absolute', top: 0, width: 10, height: 18, backgroundColor: 'transparent' }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(16,10,6,0.95)', borderBottomLeftRadius: 6, borderBottomRightRadius: 6 }} />
        </View>
      </View>
    </View>
  );
}

function Candle() {
  return (
    <View style={s.wrap}>
      {/* Flame */}
      <View style={{ position: 'absolute', top: 0, width: 8, height: 10, backgroundColor: '#F0C040', borderRadius: 4 }}>
        <View style={{ position: 'absolute', top: 2, left: 2, width: 4, height: 5, backgroundColor: '#ff8020', borderRadius: 2 }} />
      </View>
      {/* Wax body */}
      <View style={{ marginTop: 8, width: 12, height: 18, backgroundColor: '#f0e8c0', borderRadius: 2 }}>
        <View style={{ position: 'absolute', top: 0, left: 4, width: 4, height: 3, backgroundColor: '#222' }} />
      </View>
      {/* Base */}
      <View style={{ width: 18, height: 4, backgroundColor: '#c0b080', borderRadius: 2 }} />
    </View>
  );
}

function Apple() {
  return (
    <View style={s.wrap}>
      {/* Stem */}
      <View style={{ position: 'absolute', top: 0, width: 3, height: 6, backgroundColor: '#5a3a10', borderRadius: 1 }} />
      {/* Leaf */}
      <View style={{ position: 'absolute', top: 1, left: 14, width: 8, height: 5, backgroundColor: '#4a8a2a', borderRadius: 3 }} />
      {/* Body */}
      <View style={{ marginTop: 4, width: 20, height: 18, backgroundColor: '#c03030', borderRadius: 10 }}>
        <View style={{ position: 'absolute', top: 3, left: 4, width: 5, height: 4, backgroundColor: '#d04848', borderRadius: 3 }} />
      </View>
    </View>
  );
}

function FoodBread() {
  return (
    <View style={s.wrap}>
      <View style={{ width: 26, height: 14, backgroundColor: '#d4a040', borderRadius: 7 }}>
        <View style={{ position: 'absolute', top: 2, left: 5, width: 4, height: 2, backgroundColor: '#b08020', borderRadius: 1, transform: [{ rotate: '-20deg' }] }} />
        <View style={{ position: 'absolute', top: 2, left: 11, width: 4, height: 2, backgroundColor: '#b08020', borderRadius: 1, transform: [{ rotate: '-20deg' }] }} />
        <View style={{ position: 'absolute', top: 2, left: 17, width: 4, height: 2, backgroundColor: '#b08020', borderRadius: 1, transform: [{ rotate: '-20deg' }] }} />
      </View>
    </View>
  );
}

function Stew() {
  return (
    <View style={s.wrap}>
      {/* Bowl */}
      <View style={{ width: 26, height: 14, backgroundColor: '#6a4020', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, overflow: 'hidden' }}>
        {/* Stew liquid */}
        <View style={{ position: 'absolute', top: 0, width: 26, height: 8, backgroundColor: '#c06020' }} />
      </View>
      {/* Steam lines */}
      <View style={{ position: 'absolute', top: -4, left: 6, width: 2, height: 5, backgroundColor: 'rgba(200,200,200,0.5)', borderRadius: 1 }} />
      <View style={{ position: 'absolute', top: -6, left: 12, width: 2, height: 6, backgroundColor: 'rgba(200,200,200,0.5)', borderRadius: 1 }} />
      <View style={{ position: 'absolute', top: -4, left: 18, width: 2, height: 5, backgroundColor: 'rgba(200,200,200,0.5)', borderRadius: 1 }} />
    </View>
  );
}

const ICONS: Record<string, React.FC> = {
  millstone: Millstone,
  salve: Salve,
  tome: Tome,
  rations: Rations,
  flour: Flour,
  bread: Bread,
  horseshoe: Horseshoe,
  candle: Candle,
  apple: Apple,
  food_bread: FoodBread,
  stew: Stew,
};

export function ItemIcon({ itemId, size = 44 }: { itemId: string; size?: number }) {
  const Icon = ICONS[itemId];
  return (
    <View style={[s.container, { width: size, height: size }]}>
      {Icon ? <Icon /> : <View style={[s.fallback, { backgroundColor: '#666' }]} />}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
});
