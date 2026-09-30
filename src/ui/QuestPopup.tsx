import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../state/gameStore';

export function QuestPopup() {
  const popup = useGameStore((s) => s.questPopup);
  const setQuestPopup = useGameStore((s) => s.setQuestPopup);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (popup) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [popup, opacity, scale]);

  if (!popup) return null;

  const isComplete = popup.title.startsWith('Quest Complete');
  const isFestival = popup.title.startsWith('Village Festival');

  return (
    <View style={styles.backdrop} pointerEvents="box-none">
      <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setQuestPopup(null)}
          style={styles.touchable}
        >
          <Text
            style={[
              styles.title,
              isComplete && styles.completeTitle,
              isFestival && styles.festivalTitle,
            ]}
          >
            {popup.title}
          </Text>

          <Text style={styles.text}>{popup.text}</Text>

          <View style={styles.hintRow}>
            <Text style={styles.arrow}>{isFestival ? '★' : '➜'}</Text>
            <Text style={styles.hint}>{popup.hint}</Text>
          </View>

          <Text style={styles.dismiss}>tap to dismiss</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...(StyleSheet.absoluteFill as object),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  card: {
    backgroundColor: 'rgba(12, 8, 4, 0.92)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#C89030',
    paddingVertical: 20,
    paddingHorizontal: 28,
    maxWidth: 360,
    minWidth: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  touchable: {
    alignItems: 'center',
  },
  title: {
    color: '#C89030',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  completeTitle: {
    color: '#5aba3a',
  },
  festivalTitle: {
    color: '#F0C040',
    fontSize: 20,
  },
  text: {
    color: '#E0D8CC',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 144, 48, 0.12)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  arrow: {
    color: '#C89030',
    fontSize: 16,
    marginRight: 8,
  },
  hint: {
    color: '#F0D888',
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  dismiss: {
    color: '#605040',
    fontSize: 10,
    marginTop: 2,
  },
});
