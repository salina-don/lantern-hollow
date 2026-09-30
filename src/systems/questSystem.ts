import { useGameStore } from '../state/gameStore';
import { NPC_CONFIG_MAP } from '../entities/npcConfig';
import { ITEM_QUESTS, QUEST_BY_NPC, ITEM_MAP } from './itemData';
import { markNPCServed } from './npcAI';

const FESTIVAL_LINES: Record<string, string> = {
  alice: 'The honey cake is ready! Let the festival begin!',
  bob: 'Even the forge gets a rest tonight. Cheers!',
  miller: 'Best festival yet! Who wants fresh bread?',
  elara: 'The stars smile upon Lantern Hollow tonight.',
  finn: 'All clear — and all merry. A fine night indeed.',
};

function scheduleBubble(npcId: string, text: string, duration = 4000): void {
  useGameStore.getState().setSpeechBubble(npcId, text);
  setTimeout(() => {
    useGameStore.getState().setSpeechBubble(npcId, null);
  }, duration);
}

function checkFestival(): void {
  const store = useGameStore.getState();
  if (store.festivalStarted) return;
  const allDone = ITEM_QUESTS.every((q) => (store.quests[q.id] ?? 0) >= 1);
  if (!allDone) return;

  store.setFestivalStarted();
  store.addLog('All villagers are happy! The Lantern Hollow Festival begins!');

  store.setQuestPopup({
    title: 'Village Festival!',
    text: 'All villagers helped! The village celebrates!',
    hint: 'You brought the village together.',
  });
  setTimeout(() => useGameStore.getState().setQuestPopup(null), 8000);

  Object.entries(FESTIVAL_LINES).forEach(([id, line], i) => {
    setTimeout(() => {
      scheduleBubble(id, line, 6000);
    }, i * 1500);
  });
}

export function showNpcRequest(npcId: string): void {
  const store = useGameStore.getState();
  const quest = QUEST_BY_NPC[npcId];
  if (!quest) return;
  const done = (store.quests[quest.id] ?? 0) >= 1;
  scheduleBubble(npcId, done ? quest.doneLine : quest.requestLine, 3500);
}

export function openItemPopup(npcId: string): void {
  const store = useGameStore.getState();
  store.setShowItemPopup(npcId);
  const cfg = NPC_CONFIG_MAP[npcId];
  store.addLog(`You open your shop for ${cfg?.name ?? npcId}.`);
}

export function giveItem(npcId: string, itemId: string): void {
  const store = useGameStore.getState();
  const quest = QUEST_BY_NPC[npcId];
  const cfg = NPC_CONFIG_MAP[npcId];
  const item = ITEM_MAP[itemId];

  if (!quest || !cfg || !item) return;

  if (itemId === quest.itemId) {
    const wasComplete = (store.quests[quest.id] ?? 0) >= 1;

    store.addGold(quest.reward);
    store.addGoldFloat(`+${quest.reward} gold`, '#F0C040');
    store.setShowItemPopup(null);
    markNPCServed(npcId);

    if (!wasComplete) {
      store.advanceQuest(quest.id);
      scheduleBubble(npcId, quest.thankLine, 5000);
      store.addLog(`You gave ${item.name} to ${cfg.name}. +${quest.reward} gold`);

      setTimeout(() => {
        useGameStore.getState().setQuestPopup({
          title: 'Quest Complete!',
          text: quest.title,
          hint: `${cfg.name} got their ${item.name}. +${quest.reward} gold`,
        });
        setTimeout(() => useGameStore.getState().setQuestPopup(null), 5000);
      }, 800);

      setTimeout(() => checkFestival(), 1500);
    } else {
      scheduleBubble(npcId, `Thanks again for the ${item.name}!`, 3500);
      store.addLog(`${cfg.name} paid ${quest.reward} gold for ${item.name}.`);
    }
  } else {
    scheduleBubble(npcId, quest.wrongLine);
    store.addLog(`${cfg.name}: "${quest.wrongLine}"`);
  }
}

export function startConversation(npcId: string): void {
  openItemPopup(npcId);
}
