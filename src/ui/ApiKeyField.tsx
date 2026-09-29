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
      <TouchableOpacity style={[styles.pill, apiKey && styles.pillActive]} onPress={() => setOpen(true)}>
        <Text style={[styles.pillText, apiKey && styles.pillTextActive]}>
          {apiKey ? '✦ LLM on' : '◇ Set API key'}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.box}>
      <Text style={styles.label}>Anthropic API Key — memory only, never saved to disk</Text>
      <TextInput
        style={styles.input}
        value={draft}
        onChangeText={setDraft}
        placeholder="sk-ant-..."
        placeholderTextColor="#5A4A30"
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
    backgroundColor: 'rgba(16,10,4,0.88)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(200,150,50,0.25)',
  },
  pillActive: {
    borderColor: 'rgba(240,192,64,0.55)',
    backgroundColor: 'rgba(80,50,8,0.80)',
  },
  pillText: { color: '#60503A', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.4 },
  pillTextActive: { color: '#F0C040' },
  box: {
    backgroundColor: 'rgba(16,10,4,0.95)',
    borderRadius: 10,
    padding: 12,
    minWidth: 268,
    borderWidth: 1,
    borderColor: 'rgba(200,150,50,0.3)',
  },
  label: { color: '#706050', fontSize: 11, marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#E0D0B0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: 'rgba(200,150,50,0.22)',
  },
  row: { flexDirection: 'row', gap: 7 },
  btn: {
    backgroundColor: '#7A5A10',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,200,80,0.25)',
  },
  dangerBtn: { backgroundColor: '#6A1810', borderColor: 'rgba(255,100,80,0.3)' },
  cancelBtn: { backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.1)' },
  btnText: { color: '#F0D080', fontSize: 12, fontWeight: 'bold' },
});
