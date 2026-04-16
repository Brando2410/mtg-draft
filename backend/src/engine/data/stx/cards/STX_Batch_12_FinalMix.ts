import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const STX_Batch_12_FinalMix: CardDefinition[] = [
    {
        name: 'Leonin Lightscribe',
        manaCost: '{1}{W}',
        colors: ['W'],
        types: ['Creature'],
        subtypes: ['Cat', 'Cleric'],
        power: "2",
        toughness: "2",
        oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, creatures you control get +1/+1 until end of turn.',
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        targetMapping: TargetMapping.AllCreaturesYouControl,
                        duration: 'UNTIL_END_OF_TURN',
                        powerModifier: 1,
                        toughnessModifier: 1
                    }
                ]
            }
        ]
    },
    {
        name: 'Sedgemoor Witch',
        manaCost: '{2}{B}',
        colors: ['B'],
        types: ['Creature'],
        subtypes: ['Human', 'Warlock'],
        power: "3",
        toughness: "2",
        keywords: ['Menace', 'Ward:Pay3Life'],
        oracleText: 'Menace\nWard — Pay 3 life.\nMagecraft — Whenever you cast or copy an instant or sorcery spell, create a 1/1 black and green Pest creature token with "When this creature dies, you gain 1 life."',
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
                effects: [
                    {
                        type: EffectType.CreateToken,
                        tokenBlueprint: {
                            name: 'Pest',
                            manaCost: '',
                            colors: ['B', 'G'],
                            types: ['Creature', 'Token'],
                            subtypes: ['Pest'],
                            power: "1",
                            toughness: "1",
                            oracleText: 'When this creature dies, you gain 1 life.',
                            abilities: [{
                                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Death,
                                effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }]
                            }]
                        },
                        amount: 1
                    }
                ]
            }
        ]
    },
    {
        name: 'Dina, Soul Steeper',
        manaCost: '{B}{G}',
        colors: ['B', 'G'],
        types: ['Creature'],
        subtypes: ['Dryad', 'Druid'],
        supertypes: ['Legendary'],
        power: "1",
        toughness: "1",
        oracleText: "Whenever you gain life, each opponent loses 1 life.\n{1}, Sacrifice another creature: Dina, Soul Steeper gets +X/+0 until end of turn, where X is the sacrificed creature's power.",
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.LifeGain,
                condition: 'YouGainedLife',
                effects: [{ type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.EachOpponent }]
            },
            {
                type: AbilityType.Activated,
                costs: [
                    { type: 'Mana', value: '{1}' },
                    { type: 'Sacrifice', restriction: { type: 'Not', restriction: { type: 'Self' } } }
                ],
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        targetMapping: TargetMapping.Self,
                        duration: 'UNTIL_END_OF_TURN',
                        powerModifier: 'SACRIFICED_OBJECT_POWER'
                    }
                ]
            }
        ]
    },
    {
        name: 'Killian, Ink Duelist',
        manaCost: '{W}{B}',
        colors: ['W', 'B'],
        types: ['Creature'],
        subtypes: ['Human', 'Warlock'],
        supertypes: ['Legendary'],
        power: "2",
        toughness: "2",
        keywords: ['Lifelink', 'Menace'],
        oracleText: 'Lifelink, Menace\nSpells you cast that target a permanent cost {2} less to cast.',
        abilities: [
            {
                type: AbilityType.Static,
                effects: [
                    {
                        type: EffectType.CostReduction,
                        amount: '{2}',
                        spellRestriction: { type: 'TargetsPermanent' }
                    }
                ]
            }
        ]
    },
    {
        name: 'Solve the Equation',
        manaCost: '{2}{U}',
        colors: ['U'],
        types: ['Sorcery'],
        oracleText: "Search your library for an instant or sorcery card, reveal it, put it into your hand, then shuffle.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.SearchLibrary,
                        targetDefinition: {
                            type: TargetType.Card,
                            count: 1,
                            restrictions: ['InstantOrSorcery']
                        },
                        zone: Zone.Hand,
                        reveal: true,
                        shuffle: true,
                        targetMapping: TargetMapping.Controller
                    }
                ]
            }
        ]
    },
    {
        name: 'Star Pupil',
        manaCost: '{W}',
        colors: ['W'],
        types: ['Creature'],
        subtypes: ['Wizard'],
        power: "0",
        toughness: "0",
        oracleText: 'Star Pupil enters the battlefield with a +1/+1 counter on it.\nWhen Star Pupil dies, put its counters on target creature you control.',
        abilities: [
            {
                type: AbilityType.Static,
                effects: [{ type: EffectType.EntersWithCounters, counterType: 'P1P1', amount: 1 }]
            },
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Death,
                targetDefinition: {
                    count: 1,
                    type: TargetType.Permanent,
                    restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Source', value: 'CONTROLLER' }]
                },
                effects: [{ type: EffectType.MoveCounters, targetMapping: TargetMapping.Target1 }]
            }
        ]
    }
];


