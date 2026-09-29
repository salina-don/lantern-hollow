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
      <TouchableOpacity
        style={[styles.pill, apiKey && styles.pillActive]}
        onPress={() => setOpen(true)}
      >
        <Text style={[styles.pillText, apiKey && styles.pillTextActive]}>
          {apiKey ? '✦ LLM' : '◇ API key'}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.box}>
      <Text style={styles.label}>Anthropic API Key — memory only</Text>
      <TextInput
        style={styles.input}
        value={draft}
        onChangeText={setDraft}
        placeholder="sk-ant-..."
        placeholderTextColor="#504030"
        secureTextEntry
        autoFocus
        onSubmitEditing={save}
      />
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={save}>
          <Text style={styles.btnText}>Save</Text>
        </TouchableOpacity>
        {apiKey ? (
          <TouchableOpacity
            style={[styles.btn, styles.dangerBtn]}
            onPress={() => { setApiKey(''); setOpen(false); }}
          >
            <Text style={styles.btnText}>Clear</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setOpen(false)}>
          <Text style={[styles.btnText, styles.cancelText]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  pillActive: {
    backgroundColor: 'rgba(180,120,20,0.35)',
  },
  pillText: { color: '#605040', fontSize: 11, fontWeight: 'bold' },
  pillTextActive: { color: '#F0C040' },
  box: {
    backgroundColor: 'rgba(8,5,2,0.88)',
    borderRadius: 12,
    padding: 12,
    minWidth: 250,
  },
  label: { color: '#605040', fontSize: 11, marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#D0C0A0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    marginBottom: 9,
  },
  row: { flexDirection: 'row', gap: 7 },
  btn: {
    backgroundColor: 'rgba(200,150,50,0.25)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dangerBtn: { backgroundColor: 'rgba(180,40,30,0.4)' },
  cancelBtn: { backgroundColor: 'rgba(255,255,255,0.06)' },
  btnText: { color: '#E0C080', fontSize: 12, fontWeight: 'bold' },
  cancelText: { color: '#807060' },
});
