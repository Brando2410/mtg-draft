import { ImplementableCard, AbilityType, ZoneRequirement, EffectType, TargetType, TriggerEvent, Zone, DurationType } from '@shared/engine_types';

/**
 * STRIXHAVEN BATCH: RARES & MYTHICS 3 (Final Mythics)
 */

export const JadziOracleOfArcavios: ImplementableCard = {
    name: 'Jadzi, Oracle of Arcavios // Journey to the Oracle',
    manaCost: '{6}{U}{U} // {4}{G}{G}',
    type_line: 'Legendary Creature — Human Wizard // Sorcery',
    types: ['Creature', 'Sorcery'],
    subtypes: ['Human', 'Wizard'],
    supertypes: ['Legendary'],
    power: '5',
    toughness: '5',
    colors: ['blue', 'green'],
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, reveal the top card of your library. If it\'s a nonland card, you may cast it by paying {1} rather than paying its mana cost. If you don\'t cast it, put it into your hand. If it\'s a land card, put it onto the battlefield.\nDiscard a card: Return Jadzi to its owner\'s hand.\n----\nPut any number of land cards from your hand onto the battlefield. Then if you control eight or more lands, you may discard a card. If you do, return Journey to the Oracle to its owner\'s hand.',
    faces: [
        {
            name: 'Jadzi, Oracle of Arcavios',
            manaCost: '{6}{U}{U}',
            type_line: 'Legendary Creature — Human Wizard',
            types: ['Creature'],
            subtypes: ['Human', 'Wizard'],
            power: '5',
            toughness: '5',
            colors: ['blue'],
            oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, reveal the top card of your library. If it\'s a nonland card, you may cast it by paying {1} rather than paying its mana cost. If you don\'t cast it, put it into your hand. If it\'s a land card, put it onto the battlefield.\nDiscard a card: Return Jadzi to its owner\'s hand.'
        },
        {
            name: 'Journey to the Oracle',
            manaCost: '{4}{G}{G}',
            type_line: 'Sorcery',
            types: ['Sorcery'],
            subtypes: [],
            colors: ['green'],
            oracleText: 'Put any number of land cards from your hand onto the battlefield. Then if you control eight or more lands, you may discard a card. If you do, return Journey to the Oracle to its owner\'s hand.'
        }
    ],
    abilities: [
        {
            id: 'jadzi_magecraft',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Magecraft,
            effects: [{
                type: EffectType.RevealTop,
                amount: 1,
                next: {
                    type: EffectType.Choice,
                    label: "Cast for {1} or put in hand?",
                    condition: (state: any, event: any) => !event.revealedCards[0].definition.types.includes('Land'),
                    choices: [
                        {
                            label: "Cast for {1}",
                            effects: [{ type: EffectType.CastSpell, targetMapping: 'REVEALED_CARD', alternativeCost: '{1}' }]
                        },
                        {
                            label: "Put into Hand",
                            effects: [{ type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: 'REVEALED_CARD' }]
                        }
                    ],
                    fallback: { type: EffectType.PutOnBattlefield, targetMapping: 'REVEALED_CARD' } // If land
                }
            }]
        },
        {
            id: 'jadzi_return_ability',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Discard', amount: 1 }],
            effects: [{ type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: 'SELF' }]
        },
        {
            id: 'journey_to_oracle_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                { type: EffectType.PutOnBattlefield, fromZone: Zone.Hand, amount: 'AnyNumber', restrictions: ['Land'] },
                {
                    type: EffectType.Choice,
                    label: "Discard to return Journey to hand?",
                    optional: true,
                    condition: (state: any, source: any) => state.players[source.controllerId].landsControlled >= 8,
                    choices: [{
                        label: "Discard and Return",
                        effects: [
                            { type: EffectType.Discard, amount: 1 },
                            { type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: 'SELF' }
                        ]
                    }]
                }
            ]
        }
    ]
};

export const BlexVexingPest: ImplementableCard = {
    name: 'Blex, Vexing Pest // Search for Blex',
    manaCost: '{2}{G} // {2}{B}{B}',
    type_line: 'Legendary Creature — Pest // Sorcery',
    types: ['Creature', 'Sorcery'],
    subtypes: ['Pest'],
    supertypes: ['Legendary'],
    power: '3',
    toughness: '2',
    colors: ['green', 'black'],
    oracleText: 'Other Pests, Bats, Insects, Snakes, and Spiders you control get +1/+1.\nWhen Blex dies, you gain 4 life.\n----\nLook at the top five cards of your library. You may put any number of them into your hand and the rest into your graveyard. You lose 3 life for each card put into your hand this way.',
    faces: [
        {
            name: 'Blex, Vexing Pest',
            manaCost: '{2}{G}',
            type_line: 'Legendary Creature — Pest',
            types: ['Creature'],
            subtypes: ['Pest'],
            power: '3',
            toughness: '2',
            colors: ['green'],
            oracleText: 'Other Pests, Bats, Insects, Snakes, and Spiders you control get +1/+1.\nWhen Blex dies, you gain 4 life.'
        },
        {
            name: 'Search for Blex',
            manaCost: '{2}{B}{B}',
            type_line: 'Sorcery',
            types: ['Sorcery'],
            subtypes: [],
            colors: ['black'],
            oracleText: 'Look at the top five cards of your library. You may put any number of them into your hand and the rest into your graveyard. You lose 3 life for each card put into your hand this way.'
        }
    ],
    abilities: [
        {
            id: 'blex_lord_aura',
            type: AbilityType.Static,
            activeZone: ZoneRequirement.Battlefield,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                powerModifier: 1,
                toughnessModifier: 1,
                layer: 7,
                targetMapping: 'OTHER_PERMANENTS_YOU_CONTROL',
                restrictions: ['OR_SUBTYPES', 'Pest', 'Bat', 'Insect', 'Snake', 'Spider']
            }]
        },
        {
            id: 'blex_death_trigger',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Death,
            triggerCondition: 'SELF',
            effects: [{ type: EffectType.GainLife, amount: 4, targetMapping: 'CONTROLLER' }]
        },
        {
            id: 'search_for_blex_spell',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [{
                type: EffectType.LookAtTopAndPick,
                fromTop: 5,
                amount: 'AnyNumber',
                destination: Zone.Hand,
                remainderZone: Zone.Graveyard,
                lifeLossPerPick: 3
            }]
        }
    ]
};
