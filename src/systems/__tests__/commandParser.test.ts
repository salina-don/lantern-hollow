import { parseAction, ParsedAction } from '../commandParser';

describe('parseAction', () => {
  // ── goto ────────────────────────────────────────────────────────────────────

  describe('goto', () => {
    it('parses "go to the well"', () => {
      const a = parseAction('go to the well');
      expect(a.type).toBe('goto');
      const g = a as Extract<ParsedAction, { type: 'goto' }>;
      expect(g.locationKey).toBe('well');
      expect(g.locationName).toBe('Village Well');
    });

    it('parses "walk to tavern"', () => {
      const a = parseAction('walk to tavern');
      expect(a.type).toBe('goto');
      expect((a as Extract<ParsedAction, { type: 'goto' }>).locationKey).toBe('tavern');
    });

    it('parses "head to the forge"', () => {
      expect(parseAction('head to the forge').type).toBe('goto');
    });

    it('parses "move to the bakery"', () => {
      const a = parseAction('move to the bakery');
      expect(a.type).toBe('goto');
      expect((a as Extract<ParsedAction, { type: 'goto' }>).locationKey).toBe('bakery');
    });

    it('parses "go to town square"', () => {
      const a = parseAction('go to town square');
      expect(a.type).toBe('goto');
      expect((a as Extract<ParsedAction, { type: 'goto' }>).locationKey).toBe('town_square');
    });

    it('falls through to converse for unknown location', () => {
      expect(parseAction('go to the moon').type).toBe('converse');
    });

    it('includes the 3-D position', () => {
      const a = parseAction('go to the orchard') as Extract<ParsedAction, { type: 'goto' }>;
      expect(a.position).toEqual([-8, 0, -6]);
    });
  });

  // ── follow ──────────────────────────────────────────────────────────────────

  describe('follow', () => {
    it('parses "follow me"', () => {
      expect(parseAction('follow me').type).toBe('follow');
    });

    it('parses bare "follow"', () => {
      expect(parseAction('follow').type).toBe('follow');
    });

    it('parses "come with me"', () => {
      expect(parseAction('come with me').type).toBe('follow');
    });

    it('parses "stay close"', () => {
      expect(parseAction('stay close').type).toBe('follow');
    });
  });

  // ── stay ────────────────────────────────────────────────────────────────────

  describe('stay', () => {
    it('parses bare "stay"', () => {
      expect(parseAction('stay').type).toBe('stay');
    });

    it('parses "stay here"', () => {
      expect(parseAction('stay here').type).toBe('stay');
    });

    it('parses "wait"', () => {
      expect(parseAction('wait').type).toBe('stay');
    });

    it('parses "wait here"', () => {
      expect(parseAction('wait here').type).toBe('stay');
    });

    it('parses "stop"', () => {
      expect(parseAction('stop').type).toBe('stay');
    });

    it('parses "hold position"', () => {
      expect(parseAction('hold position').type).toBe('stay');
    });

    it('parses "stand by"', () => {
      expect(parseAction('stand by').type).toBe('stay');
    });
  });

  // ── deliver_message ─────────────────────────────────────────────────────────

  describe('deliver_message', () => {
    it('parses "tell Alice the bakery is closed"', () => {
      const a = parseAction('tell Alice the bakery is closed');
      expect(a.type).toBe('deliver_message');
      const d = a as Extract<ParsedAction, { type: 'deliver_message' }>;
      expect(d.toNpcId).toBe('alice');
      expect(d.toNpcName).toBe('Alice');
      expect(d.message).toBe('the bakery is closed');
    });

    it('parses "tell Bob that there is a fire"', () => {
      const a = parseAction('tell Bob that there is a fire');
      expect(a.type).toBe('deliver_message');
      const d = a as Extract<ParsedAction, { type: 'deliver_message' }>;
      expect(d.toNpcId).toBe('bob');
      expect(d.message).toBe('there is a fire');
    });

    it('parses "tell Finn to watch the gate"', () => {
      const a = parseAction('tell Finn to watch the gate');
      expect(a.type).toBe('deliver_message');
      expect((a as Extract<ParsedAction, { type: 'deliver_message' }>).toNpcId).toBe('finn');
    });

    it('is case-insensitive on NPC name', () => {
      const a = parseAction('tell alice that all is well');
      expect(a.type).toBe('deliver_message');
    });

    it('falls through to converse for unknown NPC name', () => {
      expect(parseAction('tell Odo the bakery is closed').type).toBe('converse');
    });
  });

  // ── converse ────────────────────────────────────────────────────────────────

  describe('converse', () => {
    it('returns converse for plain text', () => {
      const a = parseAction('hello there') as Extract<ParsedAction, { type: 'converse' }>;
      expect(a.type).toBe('converse');
      expect(a.text).toBe('hello there');
    });

    it('returns converse for questions', () => {
      expect(parseAction('what do you think about the harvest?').type).toBe('converse');
    });

    it('preserves original text casing', () => {
      const a = parseAction('How are YOU today?') as Extract<ParsedAction, { type: 'converse' }>;
      expect(a.text).toBe('How are YOU today?');
    });
  });
});
