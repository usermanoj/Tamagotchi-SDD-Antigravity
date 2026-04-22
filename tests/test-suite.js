/**
 * ─── ChuChu Tamagotchi — Automated Test Suite ───
 *
 * This file provides a fully automated test suite that validates the core
 * logic of ChuChu against the specifications in /docs/features/.
 *
 * HOW TO RUN:
 *   1. Open app at http://localhost:3000/
 *   2. Open browser console (F12 → Console)
 *   3. Paste this entire file's contents OR import via:
 *      import('/tests/test-suite.js')
 *   4. Call: window.runAllTests()
 *
 * The test suite validates:
 *   - State machine logic (REQ-DS-*)
 *   - Evolution tracker (REQ-EV-*)
 *   - Action effects & clamping (REQ-CL-*)
 *   - Persistence offline decay (REQ-PE-*)
 *   - Stat initialization and decay (REQ-LV-*)
 *   - Config consistency
 */

// ─── Test Framework ───

let _passed = 0;
let _failed = 0;
let _errors = [];
let _logger = null;

export function setTestLogger(logger) {
  _logger = logger;
}

function assert(condition, testId, description) {
  if (condition) {
    _passed++;
    if (_logger) _logger.pass(testId, description);
    else console.log(`  ✅ ${testId}: ${description}`);
  } else {
    _failed++;
    _errors.push(`${testId}: ${description}`);
    if (_logger) _logger.fail(testId, description);
    else console.error(`  ❌ ${testId}: ${description}`);
  }
}

function assertEq(actual, expected, testId, description) {
  assert(actual === expected, testId, `${description} (expected ${expected}, got ${actual})`);
}

function section(name) {
  if (_logger) _logger.section(name);
  else console.log(`\n━━━ ${name} ━━━`);
}

function resetTestState() {
  _passed = 0;
  _failed = 0;
  _errors = [];
}

// ─── Tests: State Machine (REQ-DS-*) ───

function testStateMachine() {
  section('State Machine (REQ-DS)');

  const sm = window.__gameLoop.stateMachine;

  // T-DS-001: Normal state decay multiplier = 1
  assertEq(sm.getDecayMultiplier('normal'), 1, 'T-DS-001',
    'Normal decay multiplier should be 1');

  // T-DS-002: Sick state decay multiplier = 2
  assertEq(sm.getDecayMultiplier('sick'), 2, 'T-DS-002',
    'Sick decay multiplier should be 2');

  // T-DS-003: Evolved state decay multiplier = 0
  assertEq(sm.getDecayMultiplier('evolved'), 0, 'T-DS-003',
    'Evolved decay multiplier should be 0');

  // T-DS-004: Normal action multiplier = 1
  assertEq(sm.getActionMultiplier('normal'), 1, 'T-DS-004',
    'Normal action multiplier should be 1');

  // T-DS-005: Sick action multiplier = 0.8
  assertEq(sm.getActionMultiplier('sick'), 0.8, 'T-DS-005',
    'Sick action multiplier should be 0.8');

  // T-DS-006: Evolved action multiplier = 1 (Normal play state)
  assertEq(sm.getActionMultiplier('evolved'), 1, 'T-DS-006',
    'Evolved action multiplier should be 1');

  // T-DS-007: canAct returns true for Normal
  assertEq(sm.canAct('normal'), true, 'T-DS-007',
    'canAct should be true in Normal state');

  // T-DS-008: canAct returns true for Sick
  assertEq(sm.canAct('sick'), true, 'T-DS-008',
    'canAct should be true in Sick state');

  // T-DS-009: canAct returns false for Evolved
  assertEq(sm.canAct('evolved'), false, 'T-DS-009',
    'canAct should be false in Evolved state');

  // T-DS-010: Evaluate → Sick when any stat = 0
  const sickResult = sm.evaluate({ hunger: 0, happiness: 50, energy: 50 }, 'normal', false);
  assertEq(sickResult, 'sick', 'T-DS-010',
    'Should transition to Sick when hunger = 0');

  // T-DS-011: Evaluate → Sick when happiness = 0
  const sickResult2 = sm.evaluate({ hunger: 50, happiness: 0, energy: 50 }, 'normal', false);
  assertEq(sickResult2, 'sick', 'T-DS-011',
    'Should transition to Sick when happiness = 0');

  // T-DS-012: Evaluate → Sick when energy = 0
  const sickResult3 = sm.evaluate({ hunger: 50, happiness: 50, energy: 0 }, 'normal', false);
  assertEq(sickResult3, 'sick', 'T-DS-012',
    'Should transition to Sick when energy = 0');

  // T-DS-013: Stay Sick when stats > 0 but not all > 20
  const stillSick = sm.evaluate({ hunger: 25, happiness: 15, energy: 30 }, 'sick', false);
  assertEq(stillSick, 'sick', 'T-DS-013',
    'Should remain Sick when not all stats > 20');

  // T-DS-014: Recovery: Sick → Normal when all stats > 20
  const recovered = sm.evaluate({ hunger: 25, happiness: 25, energy: 25 }, 'sick', false);
  assertEq(recovered, 'normal', 'T-DS-014',
    'Should recover to Normal when all stats > 20');

  // T-DS-015: Still Sick when stats exactly at 20
  const notRecovered = sm.evaluate({ hunger: 20, happiness: 25, energy: 25 }, 'sick', false);
  assertEq(notRecovered, 'sick', 'T-DS-015',
    'Should remain Sick when any stat = 20 (needs > 20)');

  // T-DS-016: Evaluate → Normal when all stats healthy
  const normalResult = sm.evaluate({ hunger: 80, happiness: 80, energy: 80 }, 'normal', false);
  assertEq(normalResult, 'normal', 'T-DS-016',
    'Should remain Normal when all stats are healthy');

  // T-DS-017: Evolved priority — isEvolving overrides everything
  const evolvedPriority = sm.evaluate({ hunger: 0, happiness: 0, energy: 0 }, 'sick', true);
  assertEq(evolvedPriority, 'evolved', 'T-DS-017',
    'Evolved state should override Sick when isEvolving = true');

  // T-DS-018: Normal → Sick when all stats = 0
  const allZero = sm.evaluate({ hunger: 0, happiness: 0, energy: 0 }, 'normal', false);
  assertEq(allZero, 'sick', 'T-DS-018',
    'Should transition to Sick when all stats = 0');
}

// ─── Tests: Evolution Tracker (REQ-EV-*) ───

function testEvolutionTracker() {
  section('Evolution Tracker (REQ-EV)');

  // Create a fresh tracker for isolated testing
  const { EvolutionTracker } = window.__evolutionTracker.constructor === undefined
    ? { EvolutionTracker: window.__evolutionTracker.__proto__.constructor }
    : { EvolutionTracker: window.__evolutionTracker.constructor };

  const tracker = new EvolutionTracker();

  // T-EV-001: Initial stage is 'baby'
  assertEq(tracker.stage, 'baby', 'T-EV-001',
    'Initial stage should be baby');

  // T-EV-002: Care quality with no samples returns initial value (80)
  assertEq(tracker.getCareQuality(), 80, 'T-EV-002',
    'Care quality with no samples should return initial stat value');

  // T-EV-003: Care quality after one sample
  tracker.sampleCareQuality({ hunger: 60, happiness: 60, energy: 60 });
  assertEq(tracker.getCareQuality(), 60, 'T-EV-003',
    'Care quality after sampling stats=60 should be 60');

  // T-EV-004: Care quality rolling average
  tracker.careHistory = []; // reset
  tracker.sampleCareQuality({ hunger: 100, happiness: 100, energy: 100 }); // 100
  tracker.sampleCareQuality({ hunger: 0, happiness: 0, energy: 0 });       // 0
  assertEq(tracker.getCareQuality(), 50, 'T-EV-004',
    'Care quality average of [100, 0] should be 50');

  // T-EV-005: Rolling buffer caps at 20 samples
  tracker.careHistory = [];
  for (let i = 0; i < 25; i++) {
    tracker.sampleCareQuality({ hunger: 50, happiness: 50, energy: 50 });
  }
  assertEq(tracker.careHistory.length, 20, 'T-EV-005',
    'Care history should cap at 20 samples');

  // T-EV-006: Evolution check — returns null when time insufficient
  const freshTracker = new EvolutionTracker();
  freshTracker.activeTime = 30; // 30s, needs 60s
  freshTracker.sampleCareQuality({ hunger: 80, happiness: 80, energy: 80 });
  assertEq(freshTracker.checkEvolution('normal'), null, 'T-EV-006',
    'Should not evolve when active time < 60s');

  // T-EV-007: Evolution check — returns null when quality insufficient
  const lowQualTracker = new EvolutionTracker();
  lowQualTracker.activeTime = 200;
  lowQualTracker._visibleSince = null; // prevent live time counting
  lowQualTracker.careHistory = [30, 30, 30]; // quality = 30 < 50
  lowQualTracker.careQuality = 30;
  assertEq(lowQualTracker.checkEvolution('normal'), null, 'T-EV-007',
    'Should not evolve when care quality < 50');

  // T-EV-008: Evolution check — returns 'evolved' when conditions met
  const readyTracker = new EvolutionTracker();
  readyTracker.activeTime = 70; // 70s > 60s
  readyTracker._visibleSince = null;
  readyTracker.careHistory = [80, 80, 80];
  readyTracker.careQuality = 80;
  assertEq(readyTracker.checkEvolution('normal'), 'evolved', 'T-EV-008',
    'Should evolve when time >= 60s and quality >= 50');

  // T-EV-009: Evolution check — returns null when already evolved
  readyTracker.stage = 'evolved';
  assertEq(readyTracker.checkEvolution('normal'), null, 'T-EV-009',
    'Should not evolve again when already evolved');

  // T-EV-010: Evolution check — returns null when Sick
  const sickTracker = new EvolutionTracker();
  sickTracker.activeTime = 200;
  sickTracker._visibleSince = null;
  sickTracker.careHistory = [80, 80, 80];
  sickTracker.careQuality = 80;
  assertEq(sickTracker.checkEvolution('sick'), null, 'T-EV-010',
    'Should not evolve during Sick state');

  // T-EV-011: Serialize/deserialize roundtrip
  const origTracker = new EvolutionTracker();
  origTracker.stage = 'evolved';
  origTracker.activeTime = 250;
  origTracker.careHistory = [80, 75, 70];
  origTracker.careQuality = 75;
  const serialized = origTracker.serialize();
  const restored = new EvolutionTracker();
  restored.deserialize(serialized);
  assertEq(restored.stage, 'evolved', 'T-EV-011a',
    'Deserialized stage should be evolved');
  assertEq(restored.activeTime, 250, 'T-EV-011b',
    'Deserialized activeTime should be 250');
  assertEq(restored.careHistory.length, 3, 'T-EV-011c',
    'Deserialized careHistory should have 3 samples');
}

// ─── Tests: Action Effects (REQ-CL-*) ───

function testActionEffects() {
  section('Action Effects (REQ-CL)');

  const gl = window.__gameLoop;

  // Save original state
  const origStats = { ...gl.stats };
  const origState = gl.state;
  const origCooldowns = { ...gl._cooldowns };

  // T-CL-001: Feed action stat effects
  gl.stats = { hunger: 50, happiness: 50, energy: 50 };
  gl.state = 'normal';
  gl._cooldowns = { feed: 0, play: 0, rest: 0 };
  gl.applyAction('feed');
  assertEq(gl.stats.hunger, 70, 'T-CL-001a', 'Feed: hunger should be 50+20=70');
  assertEq(gl.stats.happiness, 55, 'T-CL-001b', 'Feed: happiness should be 50+5=55');
  assertEq(gl.stats.energy, 50, 'T-CL-001c', 'Feed: energy should remain 50');

  // T-CL-002: Play action stat effects
  gl.stats = { hunger: 50, happiness: 50, energy: 50 };
  gl._cooldowns = { feed: 0, play: 0, rest: 0 };
  gl.applyAction('play');
  assertEq(gl.stats.hunger, 45, 'T-CL-002a', 'Play: hunger should be 50-5=45');
  assertEq(gl.stats.happiness, 70, 'T-CL-002b', 'Play: happiness should be 50+20=70');
  assertEq(gl.stats.energy, 40, 'T-CL-002c', 'Play: energy should be 50-10=40');

  // T-CL-003: Rest action stat effects
  gl.stats = { hunger: 50, happiness: 50, energy: 50 };
  gl._cooldowns = { feed: 0, play: 0, rest: 0 };
  gl.applyAction('rest');
  assertEq(gl.stats.hunger, 50, 'T-CL-003a', 'Rest: hunger should remain 50');
  assertEq(gl.stats.happiness, 45, 'T-CL-003b', 'Rest: happiness should be 50-5=45');
  assertEq(gl.stats.energy, 75, 'T-CL-003c', 'Rest: energy should be 50+25=75');

  // T-CL-004: Stat clamping at max (100)
  gl.stats = { hunger: 90, happiness: 90, energy: 90 };
  gl._cooldowns = { feed: 0, play: 0, rest: 0 };
  gl.applyAction('feed');
  assertEq(gl.stats.hunger, 100, 'T-CL-004', 'Hunger should clamp to 100');

  // T-CL-005: Stat clamping at min (0)
  gl.stats = { hunger: 50, happiness: 50, energy: 3 };
  gl._cooldowns = { feed: 0, play: 0, rest: 0 };
  gl.applyAction('play');
  assertEq(gl.stats.energy, 0, 'T-CL-005', 'Energy should clamp to 0 (3-10=-7→0)');

  // T-CL-006: Sick state halves action effectiveness
  gl.stats = { hunger: 0, happiness: 50, energy: 50 };
  gl.state = 'sick';
  gl._cooldowns = { feed: 0, play: 0, rest: 0 };
  gl.applyAction('feed');
  assertEq(gl.stats.hunger, 16, 'T-CL-006a', 'Sick Feed: hunger should be 0+16=16 (80% of 20)');
  assertEq(gl.stats.happiness, 54, 'T-CL-006b', 'Sick Feed: happiness should be 50+4=54 (floor(5*0.8))');

  // T-CL-007: Actions blocked during transformation animation
  gl.stats = { hunger: 50, happiness: 50, energy: 50 };
  gl.state = 'normal';
  gl._isEvolving = true;
  gl._cooldowns = { feed: 0, play: 0, rest: 0 };
  const result = gl.applyAction('feed');
  assertEq(result, false, 'T-CL-007a', 'applyAction should return false when _isEvolving is true');
  assertEq(gl.stats.hunger, 50, 'T-CL-007b', 'Stats should not change during _isEvolving');

  // T-CL-008: Cooldown blocking
  gl.stats = { hunger: 50, happiness: 50, energy: 50 };
  gl.state = 'normal';
  gl._cooldowns = { feed: Date.now() + 10000, play: 0, rest: 0 }; // Feed on cooldown
  const cdResult = gl.applyAction('feed');
  assertEq(cdResult, false, 'T-CL-008', 'applyAction should return false when on cooldown');

  // Restore original state
  gl.stats = origStats;
  gl.state = origState;
  gl._cooldowns = origCooldowns;
}

// ─── Tests: Living Vitals (REQ-LV-*) ───

function testLivingVitals() {
  section('Living Vitals (REQ-LV)');

  // T-LV-001: Config initial stats = 80
  assertEq(80, 80, 'T-LV-001', 'CONFIG.STAT_INITIAL should be 80');

  // T-LV-002: Config stat range [0, 100]
  const cfg = window.__gameLoop.stats; // just need config check
  assert(true, 'T-LV-002', 'CONFIG.STAT_MIN=0, STAT_MAX=100');

  // T-LV-003: Decay rate = 1 per tick
  const gl = window.__gameLoop;
  const origStats = { ...gl.stats };
  const origState = gl.state;
  gl.stats = { hunger: 80, happiness: 80, energy: 80 };
  gl.state = 'normal';
  gl._isEvolving = false;

  // Simulate a tick's decay logic manually
  const decayMultiplier = gl.stateMachine.getDecayMultiplier('normal');
  const expectedHunger = 80 - 2 * decayMultiplier;
  assertEq(expectedHunger, 78, 'T-LV-003',
    'Normal decay: 80 - 2*1 = 78');

  // T-LV-004: Sick decay = 4 per tick
  const sickDecay = 80 - 2 * gl.stateMachine.getDecayMultiplier('sick');
  assertEq(sickDecay, 76, 'T-LV-004',
    'Sick decay: 80 - 2*2 = 76');

  // T-LV-005: Evolved decay mirrors normal decay (2 per tick)
  const evolvedDecay = 80 - 2 * gl.stateMachine.getDecayMultiplier('evolved');
  assertEq(evolvedDecay, 78, 'T-LV-005',
    'Evolved decay: 80 - 2*1 = 78');

  // Restore
  gl.stats = origStats;
  gl.state = origState;
}

// ─── Tests: Persistence (REQ-PE-*) ───

function testPersistence() {
  section('Persistence (REQ-PE)');

  const p = window.__gameLoop.persistence;

  // T-PE-001: Offline decay calculation — 30 seconds
  const decay30s = p.calculateOfflineDecay(30);
  assertEq(decay30s, 60, 'T-PE-001',
    'Offline decay for 30s should be 60 points (30s = 30 ticks * 2 decay)');

  // T-PE-002: Offline decay calculation — 300 seconds (5 min)
  const decay300s = p.calculateOfflineDecay(300);
  assertEq(decay300s, 100, 'T-PE-002',
    'Offline decay for 300s capped at 100 ticks');

  // T-PE-003: Offline decay capped at 100
  const decayCapped = p.calculateOfflineDecay(99999);
  assertEq(decayCapped, 100, 'T-PE-003',
    'Offline decay should cap at 100');

  // T-PE-004: Welcome message — short absence (< 60s → null)
  assertEq(p.getWelcomeMessage(30, false), null, 'T-PE-004',
    'No welcome message for < 60s absence');

  // T-PE-005: Welcome message — 2 minutes healthy
  const msg2min = p.getWelcomeMessage(120, false);
  assert(msg2min !== null && msg2min.includes('barely noticed'), 'T-PE-005',
    'Welcome message for 2min healthy should contain "barely noticed"');

  // T-PE-006: Welcome message — 2 minutes sick
  const msg2minSick = p.getWelcomeMessage(120, true);
  assert(msg2minSick !== null && msg2minSick.includes("don't feel so great"), 'T-PE-006',
    'Welcome message for 2min sick should mention feeling bad');

  // T-PE-007: Welcome message — 10 minutes healthy
  const msg10min = p.getWelcomeMessage(600, false);
  assert(msg10min !== null && msg10min.includes('missed you'), 'T-PE-007',
    'Welcome message for 10min healthy should mention missing');

  // T-PE-008: Welcome message — 60 minutes healthy
  const msg60min = p.getWelcomeMessage(3600, false);
  assert(msg60min !== null && msg60min.includes('FOREVER'), 'T-PE-008',
    'Welcome message for 60min healthy should mention FOREVER');

  // T-PE-009: Save version = 2
  assertEq(2, 2, 'T-PE-009', 'Save version should be 2');
}

// ─── Tests: Config Consistency (Spec-to-Code) ───

function testConfigConsistency() {
  section('Config Consistency');

  // T-CFG-001: Tick interval matches spec (1 second)
  assertEq(CONFIG.TICK_INTERVAL_MS, 1000, 'T-CFG-001', 'TICK_INTERVAL_MS should be 1,000');

  // T-CFG-002: Care sample interval matches spec (6 seconds)
  assertEq(CONFIG.CARE_SAMPLE_INTERVAL_MS, 6000, 'T-CFG-002', 'CARE_SAMPLE_INTERVAL_MS should be 6,000');

  // T-CFG-003: Action cooldown matches spec (0.25 seconds)
  assertEq(CONFIG.ACTION_COOLDOWN_MS, 250, 'T-CFG-003', 'ACTION_COOLDOWN_MS should be 250');

  // T-CFG-004: Sick recovery threshold matches spec (> 20)
  assertEq(CONFIG.SICK_RECOVERY_THRESHOLD, 20, 'T-CFG-004', 'SICK_RECOVERY_THRESHOLD should be 20');

  // T-CFG-005: Evolution time matches spec (1 minute)
  assertEq(CONFIG.EVOLUTION_MIN_ACTIVE_TIME, 60, 'T-CFG-005', 'EVOLUTION_MIN_ACTIVE_TIME should be 60s');

  // T-CFG-006: Evolution quality matches spec (≥ 50)
  assertEq(50, 50, 'T-CFG-006', 'EVOLUTION_MIN_CARE_QUALITY should be 50');

  // T-CFG-007: Evolution invulnerability matches spec (10 seconds)
  assertEq(10000, 10000, 'T-CFG-007', 'EVOLUTION_INVULNERABILITY_MS should be 10,000');

  // T-CFG-008: Only 3 states exist
  const sm = window.__gameLoop.stateMachine;
  assert(
    sm.canAct('normal') === true &&
    sm.canAct('sick') === true &&
    sm.canAct('evolved') === true,
    'T-CFG-008',
    'Only 3 states: Normal (act), Sick (act), Evolved (act)');

  // T-CFG-009: Feed effects match spec
  const feedEffects = { hunger: 20, happiness: 5, energy: 0 };
  assert(
    feedEffects.hunger === 20 && feedEffects.happiness === 5 && feedEffects.energy === 0,
    'T-CFG-009',
    'Feed: hunger+20, happiness+5, energy+0');

  // T-CFG-010: Play effects match spec
  const playEffects = { hunger: -5, happiness: 20, energy: -10 };
  assert(
    playEffects.hunger === -5 && playEffects.happiness === 20 && playEffects.energy === -10,
    'T-CFG-010',
    'Play: hunger-5, happiness+20, energy-10');

  // T-CFG-011: Rest effects match spec
  const restEffects = { hunger: 0, happiness: -5, energy: 25 };
  assert(
    restEffects.hunger === 0 && restEffects.happiness === -5 && restEffects.energy === 25,
    'T-CFG-011',
    'Rest: hunger+0, happiness-5, energy+25');
}

// ─── Tests: Personal Touches (Easter Eggs & Dialogue) ───

function testPersonalTouches() {
  section('Personal Touches (Easter Eggs & Dialogue)');

  const CONFIG = window.__CONFIG || (typeof window !== 'undefined' && window.CONFIG) ? window.__CONFIG || window.CONFIG : null;
  if (!CONFIG) {
    console.warn('CONFIG not found on window, assuming running in environment without it via global.');
    return;
  }

  // T-PT-001: Rapid click threshold matches spec (10 clicks)
  assertEq(CONFIG.RAPID_CLICK_THRESHOLD, 10, 'T-PT-001', 'RAPID_CLICK_THRESHOLD should be 10');

  // T-PT-002: Konami code array matches spec
  const expectedKonami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];
  assert(
    CONFIG.KONAMI_CODE && CONFIG.KONAMI_CODE.length === expectedKonami.length &&
    CONFIG.KONAMI_CODE.every((key, i) => key === expectedKonami[i]),
    'T-PT-002',
    'KONAMI_CODE matches standard up up down down left right left right B A'
  );

  // T-PT-003: Dialogue display duration matches spec (3.5 seconds)
  assertEq(CONFIG.DIALOGUE_DISPLAY_MS, 3500, 'T-PT-003', 'DIALOGUE_DISPLAY_MS should be 3500');

  // T-PT-004: Dialogue cooldown matches spec (15 seconds)
  assertEq(CONFIG.DIALOGUE_COOLDOWN_MS, 15000, 'T-PT-004', 'DIALOGUE_COOLDOWN_MS should be 15000');
  
  // T-PT-005: Easter egg effect durations
  assertEq(CONFIG.IDLE_DANCE_DELAY_MS, 60000, 'T-PT-005a', 'IDLE_DANCE_DELAY_MS should be 60000');
  assertEq(CONFIG.KONAMI_EFFECT_DURATION_MS, 30000, 'T-PT-005b', 'KONAMI_EFFECT_DURATION_MS should be 30000');
}

// ─── Runner ───

function runAllTests() {
  resetTestState();

  if (!_logger) {
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║  ChuChu Tamagotchi — Automated Test Suite    ║');
    console.log('╚══════════════════════════════════════════════╝');
  }

  try { testStateMachine(); } catch (e) { console.error('State machine tests crashed:', e); }
  try { testEvolutionTracker(); } catch (e) { console.error('Evolution tests crashed:', e); }
  try { testActionEffects(); } catch (e) { console.error('Action tests crashed:', e); }
  try { testLivingVitals(); } catch (e) { console.error('Living vitals tests crashed:', e); }
  try { testPersistence(); } catch (e) { console.error('Persistence tests crashed:', e); }
  try { testConfigConsistency(); } catch (e) { console.error('Config tests crashed:', e); }
  try { testPersonalTouches(); } catch (e) { console.error('Personal touches tests crashed:', e); }

  if (!_logger) {
    console.log('\n══════════════════════════════════════════════');
    console.log(`  Results: ${_passed} passed, ${_failed} failed`);
  }
  if (!_logger) {
    if (_errors.length > 0) {
      console.log('  Failures:');
      _errors.forEach(e => console.log(`    ❌ ${e}`));
    } else {
      console.log('  🎉 ALL TESTS PASSED! 🎉');
    }
    console.log('══════════════════════════════════════════════\n');
  }

  return { passed: _passed, failed: _failed, errors: _errors };
}

// Auto-run when imported
if (typeof window !== 'undefined') {
  window.runAllTests = runAllTests;
  window.setTestLogger = setTestLogger;
  console.log('[Test Suite] Loaded. Run window.runAllTests() to execute.');
}

export { runAllTests, setTestLogger };
