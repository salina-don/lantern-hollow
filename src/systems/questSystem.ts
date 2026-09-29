import { useGameStore } from '../state/gameStore';
import { NPC_CONFIG_MAP } from '../entities/npcConfig';
import { QUESTS } from './questData';

const FESTIVAL_LINES: Record<string, string> = {
  alice: 'The honey cake is ready! Let the festival begin!',
  bob: 'Even the forge gets a rest tonight. Cheers!',
  miller: 'Best festival yet! Who wants fresh bread?',
  elara: 'The stars smile upon Lantern Hollow tonight.',
  finn: 'All clear — and all merry. A fine night indeed.',
};

function checkQuestInteractions(npcId: string): { questId: string; dialogue: string }[] {
  const store = useGameStore.getState();
  const results: { questId: string; dialogue: string }[] = [];

  for (const quest of QUESTS) {
    const step = store.quests[quest.id] ?? 0;
    if (step >= quest.steps.length) continue;
    if (quest.steps[step].target === npcId) {
      results.push({ questId: quest.id, dialogue: quest.steps[step].dialogue });
    }
  }
  return results;
}

function checkFestival(): void {
  const store = useGameStore.getState();
  if (store.festivalStarted) return;
  const allDone = QUESTS.every((q) => (store.quests[q.id] ?? 0) >= q.steps.length);
  if (!allDone) return;

  store.setFestivalStarted();
  store.addLog('All villagers are happy! The Lantern Hollow Festival begins!');

  Object.entries(FESTIVAL_LINES).forEach(([id, line], i) => {
    setTimeout(() => {
      const s = useGameStore.getState();
      s.setSpeechBubble(id, line);
      setTimeout(() => useGameStore.getState().setSpeechBubble(id, null), 6000);
    }, i * 1500);
  });
}

export function startConversation(npcId: string): void {
  const store = useGameStore.getState();
  const cfg = NPC_CONFIG_MAP[npcId];

  store.setActiveConversation(npcId);
  store.addLog(`You approach ${cfg?.name ?? npcId} the ${cfg?.role ?? ''}.`);

  const interactions = checkQuestInteractions(npcId);
  interactions.forEach(({ questId, dialogue }, i) => {
    setTimeout(() => {
      const s = useGameStore.getState();
      s.advanceQuest(questId);
      s.addMessage({ from: npcId, to: 'player', text: dialogue });
      s.addLog(`${cfg?.name ?? npcId}: ${dialogue}`);
      s.setSpeechBubble(npcId, dialogue);
      setTimeout(() => useGameStore.getState().setSpeechBubble(npcId, null), 5000);
      checkFestival();
    }, 500 + i * 1500);
  });
}
