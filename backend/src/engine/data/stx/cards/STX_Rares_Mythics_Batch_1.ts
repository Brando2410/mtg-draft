import { ImplementableCard, AbilityType, ZoneRequirement, EffectType, TargetType, TriggerEvent, Zone, DurationType } from '@shared/engine_types';

/**
 * STRIXHAVEN BATCH: RARES & MYTHICS 1
 */

export const HofriGhostforge: ImplementableCard = {
    name: 'Hofri Ghostforge',
    manaCost: '{3}{R}{W}',
    type_line: 'Legendary Creature — Dwarf Cleric',
    types: ['Creature'],
    subtypes: ['Dwarf', 'Cleric'],
    supertypes: ['Legendary'],
    power: '4',
    toughness: '5',
    keywords: [],
    colors: ['red', 'white'],
    oracleText: 'Spirits you control get +1/+1 and have trample and haste.\nWhenever another nontoken creature you control dies, exile it. If you do, create a token that\'s a copy of that creature, except it\'s a Spirit in addition to its other types and it has "When this token leaves the battlefield, return the exiled card to its owner\'s graveyard."',
    abilities: [
        {
            id: 'hofri_spirit_buff',
            type: AbilityType.Static,
            activeZone: ZoneRequirement.Battlefield,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    toughnessModifier: 1,
                    layer: 7,
                    abilitiesToAdd: ['Trample', 'Haste'],
                    targetMapping: 'MATCHING_PERMANENTS_YOU_CONTROL',
                    restrictions: ['Spirit']
                }
            ]
        },
        {
            id: 'hofri_death_trigger',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Death,
            triggerCondition: (state: any, event: any, source: any) => {
                const obj = event.data?.object;
                return obj && obj.id !== source.sourceId && !obj.token && obj.controllerId === source.controllerId && obj.definition.types.includes('Creature');
            },
            effects: [
                {
                    type: EffectType.Choice,
                    label: 'Exile to create Spirit copy?',
                    optional: true,
                    choices: [{
                        label: 'Exile and Create Copy',
                        effects: [
                            { 
                                type: EffectType.Exile, 
                                targetMapping: 'EVENT_OBJECT' 
                            },
                            {
                                type: EffectType.CreateTokenCopy,
                                targetMapping: 'EVENT_OBJECT',
                                subtypesToAdd: ['Spirit'],
                                abilitiesToAdd: [
                                    {
                                        id: 'return_to_grave',
                                        type: AbilityType.Triggered,
                                        triggerEvent: TriggerEvent.LeaveBattlefield,
                                        activeZone: 'Battlefield',
                                        triggerCondition: 'SELF',
                                        effects: [{ type: EffectType.MoveToZone, zone: Zone.Graveyard, targetMapping: 'EXILED_CARD' }]
                                    }
                                ]
                            }
                        ]
                    }]
                }
            ]
        }
    ]
};

export const ProfessorOnyx: ImplementableCard = {
    name: 'Professor Onyx',
    manaCost: '{4}{B}{B}',
    type_line: 'Legendary Planeswalker — Liliana',
    types: ['Planeswalker'],
    subtypes: ['Liliana'],
    supertypes: ['Legendary'],
    loyalty: '5',
    keywords: [],
    colors: ['black'],
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, each opponent loses 2 life and you gain 2 life.\n+1: You lose 1 life. Look at the top three cards of your library. Put one of them into your hand and the rest into your graveyard.\n−3: Each opponent sacrifices a creature with the greatest power among creatures they control.\n−8: Each opponent may discard a card. If they don\'t, they lose 3 life. Repeat this process six more times.',
    abilities: [
        {
            id: 'onyx_magecraft',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Magecraft,
            effects: [
                { type: EffectType.LoseLife, amount: 2, targetMapping: 'EACH_OPPONENT' },
                { type: EffectType.GainLife, amount: 2, targetMapping: 'CONTROLLER' }
            ]
        },
        {
            id: 'onyx_plus_1',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Loyalty', value: '+1' }],
            effects: [
                { type: EffectType.LoseLife, amount: 1, targetMapping: 'CONTROLLER' },
                { 
                    type: EffectType.LookAtTopAndPick, 
                    fromTop: 3, 
                    amount: 1, 
                    destination: Zone.Hand, 
                    remainderZone: Zone.Graveyard 
                }
            ]
        },
        {
            id: 'onyx_minus_3',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Loyalty', value: '-3' }],
            effects: [
                { 
                    type: EffectType.Sacrifice, 
                    targetMapping: 'EACH_OPPONENT', 
                    restrictions: ['Creature', 'GreatestPower'] 
                }
            ]
        }
    ]
};

export const KasminaEnigmaSage: ImplementableCard = {
    name: 'Kasmina, Enigma Sage',
    manaCost: '{1}{G}{U}',
    type_line: 'Legendary Planeswalker — Kasmina',
    types: ['Planeswalker'],
    subtypes: ['Kasmina'],
    supertypes: ['Legendary'],
    loyalty: '2',
    keywords: [],
    colors: ['green', 'blue'],
    oracleText: 'Each other planeswalker you control has the loyalty abilities of Kasmina, Enigma Sage.\n+2: Scry 1.\n−X: Create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it.\n−8: Search your library for an instant or sorcery card that shares a color with this planeswalker, exile that card, then shuffle. You may cast that card without paying its mana cost.',
    abilities: [
        {
            id: 'kasmina_grant_abilities',
            type: AbilityType.Static,
            activeZone: ZoneRequirement.Battlefield,
            effects: [
                {
                    type: EffectType.AddActivatedAbility,
                    targetMapping: 'OTHER_PLANESWALKERS_YOU_CONTROL',
                    value: [{
                        id: 'granted_kasmina_plus_2',
                        type: AbilityType.Activated,
                        costs: [{ type: 'Loyalty', value: '+2' }],
                        effects: [{ type: EffectType.Scry, amount: 1 }]
                    }, {
                        id: 'granted_kasmina_minus_x',
                        type: AbilityType.Activated,
                        costs: [{ type: 'Loyalty', value: '-X' }],
                        effects: [{ 
                            type: EffectType.CreateToken, 
                            amount: 1, 
                            tokenBlueprint: {
                                name: 'Fractal',
                                power: '0',
                                toughness: '0',
                                colors: ['green', 'blue'],
                                types: ['Creature'],
                                subtypes: ['Fractal']
                            },
                            startingCounters: { type: '+1/+1', amount: 'X' }
                        }]
                    }]
                }
            ]
        },
        {
            id: 'kasmina_plus_2',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Loyalty', value: '+2' }],
            effects: [{ type: EffectType.Scry, amount: 1 }]
        },
        {
            id: 'kasmina_minus_x',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Loyalty', value: '-X' }],
            effects: [{ 
                type: EffectType.CreateToken, 
                amount: 1, 
                tokenBlueprint: {
                    name: 'Fractal',
                    power: '0',
                    toughness: '0',
                    colors: ['green', 'blue'],
                    types: ['Creature'],
                    subtypes: ['Fractal']
                },
                startingCounters: { type: '+1/+1', amount: 'X' }
            }]
        }
    ]
};
