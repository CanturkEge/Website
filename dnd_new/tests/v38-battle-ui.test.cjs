const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const listeners = {};
const context = {
  console,
  setTimeout,
  clearTimeout,
  queueMicrotask,
  structuredClone,
  confirm: () => true,
  alert: () => {},
  prompt: () => '0',
  document: {
    addEventListener(type, handler) {
      (listeners[type] ||= []).push(handler);
    },
    querySelectorAll: () => [],
  },
  window: { addEventListener: () => {}, kadimUiState: {} },
  dmPages: { encounter: () => '<section>legacy dm</section>' },
  playerPages: { encounter: () => '<section>legacy player</section>' },
  V27_PAGE_HELP: {},
  V38_BATTLE_PRESETS: {
    empty: { name: 'Boş', theme: 'plain', cols: 20, rows: 14, lighting: 'bright', props: [] },
    ruins: { name: 'Harabe', theme: 'ruins', cols: 20, rows: 14, lighting: 'bright', props: [] },
  },
  V38_PROP_DEFS: {
    difficult: { label: 'Moloz', icon: '◇', difficult: true, w: 1, h: 1 },
    wall: { label: 'Duvar', icon: '▰', blocksMove: true, blocksVision: true, w: 1, h: 1 },
  },
  uid: (() => { let id = 0; return () => `generated-${++id}`; })(),
  esc: value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;'),
  v38Num: (value, min, max, fallback) => Math.max(min, Math.min(max, Number.isFinite(+value) ? +value : fallback)),
  v37Fold: value => String(value).toLocaleLowerCase('tr'),
  allMonsters: () => [{ id: 'goblin', name: 'Goblin', category: 'humanoid', cr: '1/4', hp: 7, maxHp: 7, ac: 15, speed: 30, effects: [] }],
  toast: () => {},
  save: () => { context.saveCalls += 1; },
  render: () => { context.renderCalls += 1; },
  syncFromServer: async () => {},
  realtimeChannel: null,
  realtimeCampaignId: null,
  db: { rpc: async () => ({ data: null, error: null }) },
  sessionPending: () => false,
  auth: { id: 'player-1', sessionToken: 'session' },
  current: null,
  state: null,
  saveCalls: 0,
  renderCalls: 0,
  $: () => null,
};
context.globalThis = context;
vm.createContext(context);
const source = fs.readFileSync(path.join(__dirname, '..', 'v38-battle.js'), 'utf8');
vm.runInContext(source, context, { filename: 'v38-battle.js' });

function freshState() {
  const battleMap = context.v38BattleBlank();
  Object.assign(battleMap, { published: true, fogEnabled: false, fogBase: 'revealed', props: [] });
  const hero = { id: 'fighter-hero', characterId: 'character-1', userId: 'player-1', name: 'Arin', init: 18, hp: 20, maxHp: 20, ac: 16, speed: 30, kind: 'player', turn: true, effects: [] };
  const enemy = { id: 'fighter-enemy', name: 'Ork', init: 12, hp: 15, maxHp: 15, ac: 13, speed: 30, kind: 'monster', turn: false, effects: [] };
  battleMap.tokens = [
    { id: 'token-hero', combatantId: hero.id, kind: 'player', x: 2, y: 10, size: 1, speed: 30, vision: 60, darkvision: 0, hidden: false, color: '#2f8d65', turnStartX: 2, turnStartY: 10, movedFeet: 0 },
    { id: 'token-enemy', combatantId: enemy.id, kind: 'monster', x: 12, y: 2, size: 1, speed: 30, vision: 60, darkvision: 0, hidden: false, color: '#a83e38', turnStartX: 12, turnStartY: 2, movedFeet: 0 },
  ];
  context.state = {
    battleMap,
    encounter: [hero, enemy],
    encounterActive: true,
    encounterRound: 2,
    characters: [{ id: 'character-1', userId: 'player-1', name: 'Arin', approvalStatus: 'approved', hp: 20, maxHp: 20, ac: 16, speed: 30, level: 3, className: 'Savaşçı', effects: [] }],
    npcs: [],
  };
  return battleMap;
}

{
  const battle = freshState();
  context.current = { id: 'campaign-1', role: 'dm' };
  context.v38EnsureBattle(true);
  vm.runInContext("v38SelectedTokenId='token-hero'", context);
  const html = context.v38BattlePage(false);
  assert.match(html, /class="v38-dm-rail"/);
  assert.match(html, /class="v38-board-stage"/);
  assert.doesNotMatch(html, /<main>/, 'nested main must not shrink the board');
  assert.match(html, /data-v38-add-now="monster"/);
  assert.match(html, /data-v38-delete-token="token-enemy"/);
  assert.match(html, /data-v38-zoom="0\.12"/);
  assert.match(html, /width:100%;min-width:\d+px;aspect-ratio:20\/14/, 'board must fill its available stage while preserving square cells');
  assert.match(html, /id="v38TokenX"/);
  assert.match(html, /id="v38TokenY"/);
  assert.match(html, /class="v38-inspector-actions"/);

  context.v38AddCombatant('character', 'character-1', null);
  assert.equal(context.state.encounter.length, 2, 'quick-add selects an existing player without duplicating it');
  context.v38AddCombatant('monster', 'goblin', null);
  const added = context.state.encounter.find(row => row.sourceMonsterId === 'goblin');
  const token = battle.tokens.find(row => row.combatantId === added.id);
  assert.ok(token, 'quick-added monster must receive a board token');
  assert.equal(vm.runInContext('v38SelectedTokenId', context), token.id);
  context.v38AddCombatant('monster', 'goblin', null);
  assert.equal(context.state.encounter.filter(row => row.sourceMonsterId === 'goblin').length, 2, 'multiple copies of a monster can be added');
  assert.equal(battle.tokens.filter(row => context.state.encounter.some(fighter => fighter.id === row.combatantId && fighter.sourceMonsterId === 'goblin')).length, 2);
  assert.equal(context.v38DeleteCombatantToken(token.id), true);
  assert.equal(context.state.encounter.some(row => row.id === added.id), false);
  assert.equal(battle.tokens.some(row => row.id === token.id), false);
}

{
  const battle = freshState();
  context.current = { id: 'campaign-1', role: 'dm' };
  const token = battle.tokens[0];
  battle.props = [{ id: 'mud', type: 'difficult', x: 3, y: 10, w: 1, h: 1, difficult: true, blocksMove: false, blocksVision: false }];
  const difficult = context.v38MoveAssessment(token, { x: 3, y: 10 }, battle);
  assert.equal(difficult.distance, 10, 'difficult terrain doubles movement cost');
  battle.props = [{ id: 'wall', type: 'wall', x: 4, y: 10, w: 1, h: 1, difficult: false, blocksMove: true, blocksVision: true }];
  assert.equal(context.v38MoveAssessment(token, { x: 4, y: 10 }, battle).blocked, true);
}

{
  const battle = freshState();
  context.current = { id: 'campaign-1', role: 'dm' };
  const board = { getBoundingClientRect: () => ({ left: 0, top: 0, right: 1000, bottom: 700, width: 1000, height: 700 }) };
  const classes = new Set();
  const element = {
    dataset: { v38Token: 'token-hero' },
    closest: selector => selector === '[data-v38-board]' ? board : selector === '[data-v38-token]' ? element : null,
    classList: { add: name => classes.add(name), remove: name => classes.delete(name) },
    setPointerCapture: () => {},
    releasePointerCapture: () => {},
  };
  const pointer = (clientX, clientY) => ({ target: element, pointerId: 7, button: 0, clientX, clientY, preventDefault: () => {} });
  listeners.pointerdown.forEach(handler => handler(pointer(120, 520)));
  listeners.pointermove.forEach(handler => handler(pointer(250, 350)));
  assert.equal(classes.has('dragging'), true);
  listeners.pointerup.forEach(handler => handler(pointer(250, 350)));
  assert.deepEqual([battle.tokens[0].x, battle.tokens[0].y], [5, 7], 'pointer drag moves the token to the target cell');
  assert.equal(classes.has('dragging'), false);
}

{
  freshState();
  context.current = { id: 'campaign-1', role: 'dm' };
  const button = { id: 'v38NextCombat', dataset: {}, closest: selector => selector === 'button' ? button : null };
  const click = { target: button };
  listeners.click.forEach(handler => handler(click));
  assert.equal(context.state.encounter[1].turn, true, 'next turn activates the following combatant');
  listeners.click.forEach(handler => handler(click));
  assert.equal(context.state.encounter[0].turn, true);
  assert.equal(context.state.encounterRound, 3, 'wrapping turn order advances the round');
}

{
  freshState();
  context.current = { id: 'campaign-1', role: 'player' };
  const html = context.v38BattlePage(true);
  assert.doesNotMatch(html, /v38-battle-tools|v38-dm-rail|data-v38-add-now|data-v38-delete-token/);
  assert.match(html, /class="active own-token" data-v38-select-token="token-hero"/);
  assert.match(html, /data-v38-select-token="token-enemy" disabled/);
  assert.match(html, /data-v38-zoom="-0\.12"/);
  assert.equal(context.v38PlayerCanMoveToken(context.state.battleMap.tokens[0]), true);
}

async function verifyPlayerRpcMove() {
  const battle = freshState();
  context.current = { id: 'campaign-1', role: 'player' };
  context.window.kadimUiState.optimistic = async (_key, transaction) => {
    transaction.apply();
    return transaction.commit();
  };
  context.db.rpc = async (name, args) => {
    assert.equal(name, 'battle_token_move_v60');
    assert.equal(args.p_token_id, 'token-hero');
    return { data: { x: 3, y: 10, movedFeet: 5, remaining: 25 }, error: null };
  };
  await context.v38MovePlayerToken(battle.tokens[0], { x: 3, y: 10 }, battle);
  assert.deepEqual([battle.tokens[0].x, battle.tokens[0].y, battle.tokens[0].movedFeet], [3, 10, 5]);
}

verifyPlayerRpcMove().then(() => console.log('v38 battle UI tests passed')).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
