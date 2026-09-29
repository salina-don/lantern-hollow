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
import { playerSaysToNPC } from '../systems/conversationSystem';

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
        if (action.type === 'converse') {
          await playerSaysToNPC(activeConversation, action.text);
        } else {
          await executeAction(activeConversation, action);
        }
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

  const visibleMessages = activeConversation
    ? messages.filter(
        (m) => m.from === activeConversation || (m.from === 'player' && m.to === activeConversation),
      )
    : messages.slice(-15);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, activeConfig && { borderBottomColor: activeConfig.color + '55' }]}>
        {activeConfig ? (
          <>
            <View style={[styles.npcAccent, { backgroundColor: activeConfig.color }]} />
            <View style={styles.headerTextGroup}>
              <Text style={[styles.headerName, { color: activeConfig.color }]}>{activeConfig.name}</Text>
              <Text style={styles.headerRole}>{activeConfig.role}</Text>
            </View>
            <View style={styles.flex1} />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setActiveConversation(null)}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.headerLog}>◈ Chat Log</Text>
          </>
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
              ? `Give ${activeConfig.name} a command:\n"go to the well"  ·  "follow me"  ·  "stay"\n"tell Alice the mill is open"`
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
          placeholderTextColor="#5A4A30"
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
    backgroundColor: 'rgba(16,10,4,0.92)',
    borderRadius: 10,
    padding: 10,
    minWidth: 300,
    borderWidth: 1,
    borderColor: 'rgba(200,150,50,0.28)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200,150,50,0.2)',
    paddingBottom: 7,
    marginBottom: 7,
  },
  npcAccent: {
    width: 3,
    height: 34,
    borderRadius: 2,
    marginRight: 9,
  },
  headerTextGroup: { justifyContent: 'center' },
  headerName: { fontWeight: 'bold', fontSize: 15 },
  headerRole: { color: '#80705A', fontSize: 11 },
  headerLog: { color: '#80A8D0', fontWeight: 'bold', fontSize: 13, letterSpacing: 0.5 },
  flex1: { flex: 1 },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeBtnText: { color: '#706050', fontSize: 13 },
  messages: { maxHeight: 220 },
  messagesContent: { paddingBottom: 2, gap: 5 },
  emptyHint: {
    color: '#50402A',
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
    lineHeight: 18,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bubblePlayer: {
    alignSelf: 'flex-end',
    backgroundColor: '#1A3A70',
  },
  bubbleNpc: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A2018',
    borderWidth: 1,
    borderColor: 'rgba(200,150,50,0.15)',
  },
  bubbleSender: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  bubbleText: { color: '#C8B890', fontSize: 13, lineHeight: 18 },
  bubbleTextPlayer: { color: '#8ABCFF' },
  inputRow: { flexDirection: 'row', marginTop: 8, gap: 7 },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#E0D0B0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(200,150,50,0.2)',
  },
  sendBtn: {
    backgroundColor: '#7A5A10',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,200,80,0.3)',
  },
  sendBtnBusy: { backgroundColor: '#3A2A08', borderColor: 'rgba(200,150,50,0.15)' },
  sendText: { color: '#F0C040', fontSize: 13, fontWeight: 'bold' },
});
