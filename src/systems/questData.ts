export interface QuestStep {
  target: string;
  dialogue: string;
}

export interface Quest {
  id: string;
  title: string;
  giver: string;
  description: string;
  steps: QuestStep[];
}

export const QUESTS: Quest[] = [
  {
    id: 'millstone',
    title: 'The Broken Millstone',
    giver: 'miller',
    description: 'Help Miller get a new millstone forged.',
    steps: [
      { target: 'miller', dialogue: "My millstone cracked this morning! I can't bake without it. Could you ask Bob the blacksmith to forge me a new one?" },
      { target: 'bob', dialogue: "Miller needs a new millstone? Aye, I can forge one. Tell him it'll be ready by evening." },
      { target: 'miller', dialogue: "Bob's on it? Wonderful! The bakery will be running again in no time. Thank you, traveler!" },
    ],
  },
  {
    id: 'salve',
    title: 'Cooling Salve',
    giver: 'bob',
    description: 'Get healing salve from Elara for Bob.',
    steps: [
      { target: 'bob', dialogue: "These forge burns are getting worse. Elara the herbalist makes a cooling salve — could you ask her for some?" },
      { target: 'elara', dialogue: "Burns from the forge? I have just the remedy. Tell Bob to apply it twice daily." },
      { target: 'bob', dialogue: "Elara's salve? That's a relief. My hands will thank you. Much obliged, friend." },
    ],
  },
  {
    id: 'tome',
    title: 'The Lost Tome',
    giver: 'elara',
    description: "Find Elara's lost book of remedies.",
    steps: [
      { target: 'elara', dialogue: "I've lost my book of remedies — generations of knowledge within. Finn patrols everywhere; perhaps he's seen it?" },
      { target: 'finn', dialogue: "An old leather book? Found one near the gate yesterday. Here, take it to her — looks important." },
      { target: 'elara', dialogue: "My tome! You and Finn have my deepest gratitude. The village's remedies are safe once more." },
    ],
  },
  {
    id: 'rations',
    title: 'Night Watch Rations',
    giver: 'finn',
    description: 'Remind Alice about rations for the night watch.',
    steps: [
      { target: 'finn', dialogue: "I'm on duty all night but Alice promised rations for the watch. Could you remind her? I can't leave my post." },
      { target: 'alice', dialogue: "Oh, poor Finn! I completely forgot his supper. Tell him it'll be waiting at the tavern." },
      { target: 'finn', dialogue: "Rations secured. You're reliable — more than most around here. The Hollow is safer for it." },
    ],
  },
  {
    id: 'recipe',
    title: 'The Secret Recipe',
    giver: 'alice',
    description: "Get Miller's special flour blend for Alice's honey cake.",
    steps: [
      { target: 'alice', dialogue: "I want to surprise everyone with a honey cake for the village, but I need Miller's secret flour blend. Could you ask him?" },
      { target: 'miller', dialogue: "Alice wants my special blend? For a honey cake? Oh, how exciting! Here's the recipe — tell her to use warm water!" },
      { target: 'alice', dialogue: "The recipe! Now I can make the honey cake. This village is going to have the best festival yet. Thank you!" },
    ],
  },
];
