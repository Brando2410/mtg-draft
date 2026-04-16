import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const ValentinDeanoftheVein: CardDefinition = {
    name: "Valentin, Dean of the Vein",
    manaCost: "{B}",
    colors: ["B"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Vampire", "Warlock"],
    power: "1",
    toughness: "1",
    keywords: ["Menace", "Lifelink"],
    oracleText: "Menace, lifelink\nIf a nontoken creature an opponent controls would die, exile it instead. When you do, you may pay {2}. If you do, create a 1/1 black and green Pest creature token with \"When this creature dies, you gain 1 life.\"",
    faces: [
        {
            name: "Valentin, Dean of the Vein",
            manaCost: "{B}",
            colors: ["B"],
            supertypes: ["Legendary"],
            types: ["Creature"],
            subtypes: ["Vampire", "Warlock"],
            power: "1",
            toughness: "1",
            keywords: ["Menace", "Lifelink"],
            oracleText: "Menace, lifelink\nIf a nontoken creature an opponent controls would die, exile it instead. When you do, you may pay {2}. If you do, create a 1/1 black and green Pest creature token with \"When this creature dies, you gain 1 life.\"",
            abilities: [
                {
                    type: AbilityType.Static,
                    effects: [{
                        type: EffectType.ApplyContinuousEffect,
                        layer: 6,
                        targetMapping: TargetMapping.MatchingCards,
                        restrictions: [{ type: 'OpponentControl' }, { type: 'Type', value: 'Creature' }, { type: 'Not', restriction: { type: 'Token' } }],
                        exileOnMoveToGraveyard: true,
                    }]
                },
                {
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.ValentinReplacementSuccess,
                    oracleText: "When you do, you may pay {2}. If you do, create a 1/1 black and green Pest creature token with \"When this creature dies, you gain 1 life.\"",
                    effects: [{
                        type: EffectType.Choice,
                        label: "Pay {2} to create a Pest?",
                        optional: true,
                        choices: [{
                            label: "Pay {2}",
                            costs: [{ type: 'Mana', value: '{2}' }],
                            effects: [{
                                type: EffectType.CreateToken,
                                tokenBlueprint: {
                                    name: 'Pest',
                                    power: "1",
                                    toughness: "1",
                                    colors: ['B', 'G'],
                                    types: ['Creature', 'Token'],
                                    subtypes: ['Pest'],
                                    oracleText: "When this creature dies, you gain 1 life.",
                                    abilities: [{
                                        type: AbilityType.Triggered,
                                        eventMatch: TriggerEvent.Death,
                                        effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }]
                                    }]
                                }
                            }]
                        }]
                    }]
                }
            ]
        },
        {
            name: "Lisette, Dean of the Root",
            manaCost: "{2}{G}{G}",
            colors: ["G"],
            supertypes: ["Legendary"],
            types: ["Creature"],
            subtypes: ["Human", "Druid"],
            power: "4",
            toughness: "4",
            oracleText: "Whenever you gain life, you may pay {1}. If you do, put a +1/+1 counter on each creature you control and those creatures gain trample until end of turn.",
            abilities: [{
                type: AbilityType.Triggered,
                eventMatch: TriggerEvent.LifeGain,
                oracleText: "Whenever you gain life, you may pay {1}. If you do, put a +1/+1 counter on each creature you control and those creatures gain trample until end of turn.",
                effects: [{
                    type: EffectType.Choice,
                    label: "Pay {1} to buff creatures?",
                    optional: true,
                    choices: [{
                        label: "Pay {1}",
                        costs: [{ type: 'Mana', value: '{1}' }],
                        effects: [
                            { type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: 'ALL_CREATURES_YOU_CONTROL' },
                            { type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Trample'], targetMapping: 'ALL_CREATURES_YOU_CONTROL' }
                        ]
                    }]
                }]
            }]
        }
    ]
};


