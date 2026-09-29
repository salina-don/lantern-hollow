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
import { NPC_CONFIG_MAP } from '../entities/npcConfig';
import { parseAction, executeAction, parseCommand } from '../systems/commandParser';

export function ChatBox() {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const messages = useGameStore((s) => s.messages);
  const activeConversation = useGameStore((s) => s.activeConversation);
  const setActiveConversation = useGameStore((s) => s.setActiveConversation);
  const addLog = useGameStore((s) => s.addLog);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const submit = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    setBusy(true);

    try {
      if (activeConversation) {
        const action = parseAction(text);
        await executeAction(activeConversation, action);
      } else {
        addLog(`> ${text}`);
        const result = await parseCommand(text);
        if (result.message) addLog(result.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const activeConfig = activeConversation ? NPC_CONFIG_MAP[activeConversation] : null;

  // When talking to an NPC: show that NPC's conversation thread.
  // Otherwise: show the last 15 messages as a rolling chat log.
  const visibleMessages = activeConversation
    ? messages.filter(
        (m) => m.from === activeConversation || (m.from === 'player' && m.to === activeConversation),
      )
    : messages.slice(-15);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {activeConfig ? (
          <>
            <View style={[styles.npcDot, { backgroundColor: activeConfig.color }]} />
            <Text style={styles.headerName}>{activeConfig.name}</Text>
            <Text style={styles.headerRole}> · {activeConfig.role}</Text>
            <View style={styles.flex1} />
            <TouchableOpacity onPress={() => setActiveConversation(null)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.headerLog}>Chat Log</Text>
        )}
      </View>

      {/* Message list */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
      >
        {visibleMessages.length === 0 && (
          <Text style={styles.emptyHint}>
            {activeConfig
              ? `Give ${activeConfig.name} a command:\n"go to the well" · "follow me" · "stay"\n"tell Alice that the mill is open"`
              : 'Press E near an NPC to start talking.'}
          </Text>
        )}
        {visibleMessages.map((msg) => {
          const isPlayer = msg.from === 'player';
          const npcCfg = NPC_CONFIG_MAP[msg.from] ?? NPC_CONFIG_MAP[msg.to];
          const color = npcCfg?.color ?? '#FFAA55';
          return (
            <View
              key={msg.id}
              style={[styles.bubble, isPlayer ? styles.bubblePlayer : styles.bubbleNpc]}
            >
              {!isPlayer && (
                <Text style={[styles.bubbleSender, { color }]}>
                  {npcCfg?.name ?? msg.from}
                </Text>
              )}
              <Text style={[styles.bubbleText, isPlayer && styles.bubbleTextPlayer]}>
                {msg.text}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={
            activeConfig
              ? `Command ${activeConfig.name}...`
              : 'go to inn  ·  talk to Alice'
          }
          placeholderTextColor="#555"
          onSubmitEditing={submit}
          returnKeyType="send"
          blurOnSubmit={false}
          editable={!busy}
        />
        <TouchableOpacity style={[styles.sendBtn, busy && styles.sendBtnBusy]} onPress={submit} disabled={busy}>
          <Text style={styles.sendText}>{busy ? '…' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.82)',
    borderRadius: 8,
    padding: 8,
    minWidth: 280,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 5,
    marginBottom: 5,
  },
  npcDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 6,
  },
  headerName: { color: '#FFD700', fontWeight: 'bold', fontSize: 13 },
  headerRole: { color: '#888', fontSize: 12 },
  headerLog: { color: '#88CCFF', fontWeight: 'bold', fontSize: 12 },
  flex1: { flex: 1 },
  closeBtn: { color: '#888', fontSize: 14, paddingHorizontal: 4 },
  messages: { maxHeight: 150 },
  messagesContent: { paddingBottom: 2, gap: 4 },
  emptyHint: {
    color: '#555',
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
    lineHeight: 17,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bubblePlayer: {
    alignSelf: 'flex-end',
    backgroundColor: '#1E3A6E',
  },
  bubbleNpc: {
    alignSelf: 'flex-start',
    backgroundColor: '#2a2a2a',
  },
  bubbleSender: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  bubbleText: { color: '#ddd', fontSize: 12, lineHeight: 16 },
  bubbleTextPlayer: { color: '#B8D4FF' },
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
  sendBtnBusy: { backgroundColor: '#2a3a6a' },
  sendText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
});
