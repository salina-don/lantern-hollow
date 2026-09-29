import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useGameStore } from '../state/gameStore';
import { parseCommand } from '../systems/commandParser';

export function ChatBox() {
  const [input, setInput] = useState('');
  const messages = useGameStore((s) => s.messages);
  const npcs = useGameStore((s) => s.npcs);
  const activeConversation = useGameStore((s) => s.activeConversation);
  const setActiveConversation = useGameStore((s) => s.setActiveConversation);
  const addLog = useGameStore((s) => s.addLog);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const submit = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    addLog(`> ${text}`);
    const result = await parseCommand(text);
    if (result.message) addLog(result.message);
  };

  const activeNpc = npcs.find((n) => n.id === activeConversation);

  const visibleMessages = activeConversation
    ? messages.filter(
        (m) =>
          m.from === activeConversation ||
          (m.from === 'player' && m.to === activeConversation),
      )
    : messages.slice(-12);

  return (
    <View style={styles.container}>
      {activeNpc && (
        <View style={styles.header}>
          <Text style={styles.headerText}>Talking to {activeNpc.name}</Text>
          <TouchableOpacity onPress={() => setActiveConversation(null)}>
            <Text style={styles.closeBtn}>X</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
      >
        {visibleMessages.map((msg) => {
          const npcFrom = npcs.find((n) => n.id === msg.from);
          const isPlayer = msg.from === 'player';
          return (
            <View key={msg.id} style={styles.msgRow}>
              <Text style={isPlayer ? styles.playerName : styles.npcName}>
                {isPlayer ? 'You' : (npcFrom?.name ?? msg.from)}:{' '}
              </Text>
              <Text style={styles.msgText}>{msg.text}</Text>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={
            activeNpc ? `Say to ${activeNpc.name}...` : 'Command or message...'
          }
          placeholderTextColor="#555"
          onSubmitEditing={submit}
          returnKeyType="send"
          blurOnSubmit={false}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={submit}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderRadius: 8,
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingBottom: 4,
    marginBottom: 5,
  },
  headerText: { color: '#FFD700', fontWeight: 'bold', fontSize: 13 },
  closeBtn: { color: '#aaa', fontSize: 14, paddingHorizontal: 6 },
  messages: { maxHeight: 110 },
  messagesContent: { paddingBottom: 2 },
  msgRow: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 2 },
  playerName: { color: '#88CCFF', fontWeight: 'bold', fontSize: 12 },
  npcName: { color: '#FFAA55', fontWeight: 'bold', fontSize: 12 },
  msgText: { color: '#ddd', fontSize: 12, flex: 1 },
  inputRow: { flexDirection: 'row', marginTop: 6, gap: 6 },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#eee',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 13,
  },
  sendBtn: {
    backgroundColor: '#4169E1',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
});
