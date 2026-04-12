import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType, TriggerEvent, Zone, DurationType } from '@shared/engine_types';

/**
 * STRIXHAVEN BATCH: UNCOMMON MIX
 */

export const AcademicDispute: ImplementableCard = {
    name: 'Academic Dispute',
    manaCost: '{R}',
    type_line: 'Instant',
    types: ['Instant'],
    subtypes: [],
    colors: ['red'],
    oracleText: "Target creature blocks this turn if able. Target creature gets +1/+0 and gains reach until end of turn. Learn.",
    abilities: [
        {
            id: 'academic_dispute_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: ['Creature']
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: 'UNTIL_END_OF_TURN',
                    restrictions: ['MustBlockThisTurn'],
                    powerModifier: 1,
                    abilitiesToAdd: ['Reach'],
                    targetMapping: 'TARGET_1'
                },
                { type: EffectType.Learn }
            ]
        }
    ]
};

export const IgneousInspiration: ImplementableCard = {
    name: 'Igneous Inspiration',
    manaCost: '{2}{R}',
    type_line: 'Sorcery',
    types: ['Sorcery'],
    subtypes: [],
    colors: ['red'],
    oracleText: "Igneous Inspiration deals 3 damage to any target. Learn.",
    abilities: [
        {
            id: 'igneous_inspiration_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            targetDefinition: {
                type: TargetType.Any,
                count: 1
            },
            effects: [
                { type: EffectType.Damage, amount: 3, targetMapping: 'TARGET_1' },
                { type: EffectType.Learn }
            ]
        }
    ]
};

export const GoBlank: ImplementableCard = {
    name: 'Go Blank',
    manaCost: '{2}{B}',
    type_line: 'Sorcery',
    types: ['Sorcery'],
    subtypes: [],
    colors: ['black'],
    oracleText: "Target player discards two cards. Then exile that player's graveyard.",
    abilities: [
        {
            id: 'go_blank_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            targetDefinition: {
                type: TargetType.Player,
                count: 1
            },
            effects: [
                { type: EffectType.Discard, amount: 2, targetMapping: 'TARGET_1' },
                { type: EffectType.Exile, targetMapping: 'TARGET_1_GRAVEYARD' }
            ]
        }
    ]
};

export const UmbralJuke: ImplementableCard = {
    name: 'Umbral Juke',
    manaCost: '{2}{B}',
    type_line: 'Instant',
    types: ['Instant'],
    subtypes: [],
    colors: ['black'],
    oracleText: "Each opponent sacrifices a creature or planeswalker. If you cast this spell during your main phase, create a 2/1 white and black Inkling creature token with flying.",
    abilities: [
        {
            id: 'umbral_juke_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                { 
                    type: EffectType.Sacrifice, 
                    targetMapping: 'EACH_OPPONENT', 
                    restrictions: ['CreatureOrPlaneswalker'] 
                },
                {
                    type: EffectType.CreateToken,
                    condition: (state: any, event: any) => state.currentPhase === 'Main1' || state.currentPhase === 'Main2',
                    tokenBlueprint: {
                        name: 'Inkling',
                        power: '2', toughness: '1',
                        colors: ['white', 'black'],
                        types: ['Creature'],
                        subtypes: ['Inkling'],
                        keywords: ['Flying']
                    }
                }
            ]
        }
    ]
};

export const Humiliate: ImplementableCard = {
    name: 'Humiliate',
    manaCost: '{W}{B}',
    type_line: 'Sorcery',
    types: ['Sorcery'],
    subtypes: [],
    colors: ['white', 'black'],
    oracleText: "Target opponent reveals their hand. You choose a nonland card from it. That player discards that card. Put a +1/+1 counter on a creature you control.",
    abilities: [
        {
            id: 'humiliate_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            targetDefinition: {
                type: TargetType.Player,
                count: 1,
                restrictions: ['Opponent']
            },
            effects: [
                {
                    type: EffectType.RevealHand,
                    targetMapping: 'TARGET_1',
                    next: {
                        type: EffectType.Choice,
                        label: "Choose a nonland card to discard",
                        targetMapping: 'TARGET_1_HAND',
                        restrictions: ['Nonland'],
                        effects: [{ type: EffectType.Discard, targetMapping: 'SELECTED_CARDS' }]
                    }
                },
                {
                    type: EffectType.AddCounters,
                    targetMapping: 'ANY_CREATURE_YOU_CONTROL',
                    amount: 1,
                    value: '+1/+1'
                }
            ]
        }
    ]
};

export const MortalitySpear: ImplementableCard = {
    name: 'Mortality Spear',
    manaCost: '{2}{B}{G}',
    type_line: 'Instant',
    types: ['Instant'],
    subtypes: [],
    colors: ['black', 'green'],
    oracleText: "This spell costs {2} less to cast if you gained life this turn.\nDestroy target nonland permanent.",
    abilities: [
        {
            id: 'mortality_spear_cost_reduction',
            type: AbilityType.Static,
            activeZone: ZoneRequirement.Stack,
            effects: [{
                type: EffectType.CostReduction,
                amount: '{2}',
                condition: (state: any, source: any) => (state.turnState.lifeGainedThisTurn[source.controllerId] || 0) > 0
            }]
        },
        {
            id: 'mortality_spear_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: ['Nonland']
            },
            effects: [{ type: EffectType.Destroy, targetMapping: 'TARGET_1' }]
        }
    ]
};
