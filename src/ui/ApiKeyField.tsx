import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../state/gameStore';

export function ApiKeyField() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const apiKey = useGameStore((s) => s.apiKey);
  const setApiKey = useGameStore((s) => s.setApiKey);

  const save = () => {
    setApiKey(draft.trim());
    setDraft('');
    setOpen(false);
  };

  if (!open) {
    return (
      <TouchableOpacity style={styles.pill} onPress={() => setOpen(true)}>
        <Text style={styles.pillText}>{apiKey ? '[LLM: on]' : '[Set API Key]'}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.box}>
      <Text style={styles.label}>Anthropic API Key (memory only, never saved)</Text>
      <TextInput
        style={styles.input}
        value={draft}
        onChangeText={setDraft}
        placeholder="sk-ant-..."
        placeholderTextColor="#555"
        secureTextEntry
        autoFocus
        onSubmitEditing={save}
      />
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={save}>
          <Text style={styles.btnText}>Save</Text>
        </TouchableOpacity>
        {apiKey ? (
          <TouchableOpacity style={[styles.btn, styles.dangerBtn]} onPress={() => { setApiKey(''); setOpen(false); }}>
            <Text style={styles.btnText}>Clear</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setOpen(false)}>
          <Text style={styles.btnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillText: { color: '#888', fontSize: 11 },
  box: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 8,
    padding: 10,
    minWidth: 260,
  },
  label: { color: '#888', fontSize: 11, marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#eee',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 12,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', gap: 6 },
  btn: {
    backgroundColor: '#4169E1',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dangerBtn: { backgroundColor: '#8B0000' },
  cancelBtn: { backgroundColor: '#444' },
  btnText: { color: '#fff', fontSize: 12 },
});
