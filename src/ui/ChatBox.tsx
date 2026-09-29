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
      <View style={styles.header}>
        {activeConfig ? (
          <>
            <View style={[styles.npcStripe, { backgroundColor: activeConfig.color }]} />
            <View style={styles.headerInfo}>
              <Text style={[styles.headerName, { color: activeConfig.color }]}>
                {activeConfig.name}
              </Text>
              <Text style={styles.headerRole}>{activeConfig.role}</Text>
            </View>
            <View style={styles.flex1} />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setActiveConversation(null)}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.headerLog}>Chat</Text>
        )}
      </View>

      {/* Messages */}
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
                <Text style={[styles.sender, { color }]}>
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

      {/* Input */}
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
          placeholderTextColor="#504030"
          onSubmitEditing={submit}
          returnKeyType="send"
          blurOnSubmit={false}
          editable={!busy}
        />
        <TouchableOpacity
          style={[styles.sendBtn, busy && styles.sendBtnBusy]}
          onPress={submit}
          disabled={busy}
        >
          <Text style={styles.sendText}>{busy ? '…' : '›'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(8,5,2,0.72)',
    borderRadius: 12,
    padding: 10,
    minWidth: 300,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 7,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  npcStripe: {
    width: 3,
    height: 30,
    borderRadius: 2,
    marginRight: 9,
  },
  headerInfo: { justifyContent: 'center' },
  headerName: { fontWeight: 'bold', fontSize: 15 },
  headerRole: { color: '#706050', fontSize: 11 },
  headerLog: {
    color: '#908070',
    fontWeight: 'bold',
    fontSize: 12,
  },
  flex1: { flex: 1 },
  closeBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  closeBtnText: { color: '#605040', fontSize: 14 },
  messages: { maxHeight: 200 },
  messagesContent: { paddingBottom: 2, gap: 5 },
  emptyHint: {
    color: '#483828',
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
    backgroundColor: 'rgba(30,60,120,0.75)',
  },
  bubbleNpc: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  sender: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  bubbleText: { color: '#C0A880', fontSize: 13, lineHeight: 18 },
  bubbleTextPlayer: { color: '#8ABCFF' },
  inputRow: { flexDirection: 'row', marginTop: 7, gap: 6 },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#D0C0A0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
  },
  sendBtn: {
    backgroundColor: 'rgba(200,150,50,0.25)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    justifyContent: 'center',
  },
  sendBtnBusy: { opacity: 0.4 },
  sendText: { color: '#F0C040', fontSize: 18, fontWeight: 'bold' },
});
