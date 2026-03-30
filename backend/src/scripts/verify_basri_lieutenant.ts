import { GameEngine } from '../engine/GameEngine';
import { Phase, Step, Zone } from '../../../shared/engine_types';

async function verifyBasriLieutenant() {
  console.log("--- COMPREHENSIVE ENGINE VERIFICATION ---");
  
  const basicLand = { name: "Plains", types: ["Land"], subtypes: ["Plains"], oracleText: "{T}: Add {W}." };
  const getDeck = (id: string) => [
      { id: `${id}_lieutenant`, name: "Basri's Lieutenant", manaCost: '{3}{W}', colors: ['W'], type_line: 'Creature — Human Knight', power: '3', toughness: '4' } as any,
      ...Array(40).fill(0).map((_, i) => ({ id: `${id}_land_${i}`, definition: basicLand, name: "Plains" } as any))
  ];

  const engine = new GameEngine(['p1', 'p2'], {
    'p1': getDeck('p1'),
    'p2': getDeck('p2')
  });

  const state = engine.getState();
  const p1 = state.players['p1'];
  p1.manaPool = { W: 20, U: 20, B: 20, R: 20, G: 20, C: 20 };
  state.currentPhase = Phase.PreCombatMain;
  state.currentStep = Step.Main;

  // 1. Play Basri's Lieutenant
  console.log("1. Playing Basri's Lieutenant...");
  const cardInHand = p1.library.find(c => c.definition.name === "Basri's Lieutenant")!;
  p1.hand.push(cardInHand);
  engine.playCard('p1', cardInHand.id);
  
  // Resolve spell (p1 pass, p2 pass)
  engine.passPriority('p1');
  engine.passPriority('p2');

  const lieutenant = state.battlefield.find((o: any) => o.definition.name === "Basri's Lieutenant");
  if (!lieutenant) throw new Error("Lieutenant failed to enter");
  
  // Check targeting state
  console.log(`   [INFO] State after spell resolution: ${state.pendingAction?.type}`);
  if (state.pendingAction?.type !== 'TARGETING') {
      throw new Error(`Expected TARGETING state for ETB trigger, got ${state.pendingAction?.type}`);
  }

  // Choose target for ETB
  engine.resolveTargeting('p1', lieutenant.id);
  console.log("   [OK] Targeted Lieutenant for its own ETB.");

  // Resolve trigger (p1 pass, p2 pass)
  engine.passPriority('p1', true);
  engine.passPriority('p2', true);

  if ((lieutenant.counters || {})['+1/+1'] !== 1) {
      throw new Error(`Counter not added. Counters: ${JSON.stringify(lieutenant.counters)}`);
  }
  console.log("   [OK] ETB counter added correctly.");

  // 2. Lifelink Test
  console.log("2. Testing Lifelink (Baneslayer Angel)...");
  const oldLife = p1.life;
  const angelDef = { name: "Baneslayer Angel", manaCost: '{3}{W}{W}', colors: ['W'], types: ['Creature'], keywords: ['Lifelink'] };
  const angel = { id: 'angel_1', definition: angelDef, controllerId: 'p1', ownerId: 'p1', zone: Zone.Battlefield, counters: {}, keywords: [] } as any;
  state.battlefield.push(angel);
  
  // Register it!
  const { ActionProcessor } = require('../engine/modules/ActionProcessor');
  (ActionProcessor as any).registerAbilities(state, angel);

  const { DamageProcessor } = require('../engine/modules/DamageProcessor');
  DamageProcessor.dealDamage(state, 'angel_1', 'p2', 5, true, (m: any) => {});

  if (p1.life !== oldLife + 5) throw new Error(`Lifelink failed. Life: ${p1.life}`);
  console.log("   [OK] Lifelink resolved correctly.");

  // 3. Planeswalker Activation Test
  console.log("3. Testing Planeswalker Activation (Basri Ket)...");
  const basriDef = { name: "Basri Ket", manaCost: '{1}{W}{W}', colors: ['W'], types: ['Legendary', 'Planeswalker'] as any, loyalty: "3" };
  const basri = { id: 'basri_1', definition: basriDef, controllerId: 'p1', ownerId: 'p1', zone: Zone.Battlefield, counters: { loyalty: 3 }, keywords: [], abilitiesUsedThisTurn: 0 } as any;
  state.battlefield.push(basri);
  (ActionProcessor as any).registerAbilities(state, basri);

  // Activate +1
  engine.activateAbility('p1', 'basri_1', 0);
  if (state.pendingAction?.type !== 'TARGETING') throw new Error(`Planeswalker activation failed to enter targeting. Got ${state.pendingAction?.type}`);
  
  engine.resolveTargeting('p1', lieutenant.id);
  engine.passPriority('p1', true);
  engine.passPriority('p2', true);

  if (lieutenant.counters['+1/+1'] !== 2) throw new Error(`Basri +1 failed. Counters: ${lieutenant.counters['+1/+1']}`);
  console.log("   [OK] Planeswalker activation resolved correctly.");

  // 4. Death Trigger Test
  console.log("4. Testing Death Trigger...");
  ActionProcessor.moveCard(state, lieutenant, Zone.Graveyard, 'p1');
  // It shouldn't need targets for Knight token, so it should just be on stack.
  if (state.stack.length === 0) throw new Error("Death trigger not found");
  
  engine.passPriority('p1', true); 
  engine.passPriority('p2', true);
  
  const knight = state.battlefield.find((o: any) => o.definition.name === 'Knight');
  if (!knight) throw new Error("Knight token not created");
  console.log("   [OK] Death trigger resolved correctly (Knight created).");

  console.log("--- ALL TESTS PASSED ---");
  process.exit(0);
}

verifyBasriLieutenant().catch(err => {
  console.error(err);
  process.exit(1);
});
