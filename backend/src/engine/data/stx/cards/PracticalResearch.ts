import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const PracticalResearch: ImplementableCard = {
    name: 'Practical Research',
    manaCost: '{3}{U}{R}',
    type_line: 'Instant',
    types: ['Instant'],
    subtypes: [],
    power: undefined,
    toughness: undefined,
    keywords: [],
    colors: ['blue', 'red'],
    supertypes: [],
    oracleText: 'Draw four cards, then discard two cards unless you discard an instant or sorcery card.',
    abilities: [
        {
            id: 'practical_research_main',
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 4,
                    targetMapping: 'CONTROLLER'
                },
                {
                    type: EffectType.Choice,
                    label: "Choose discard option",
                    choices: [
                        {
                            label: "Discard an instant or sorcery card",
                            effects: [{
                                type: EffectType.DiscardCards,
                                amount: 1,
                                restrictions: ['Instant', 'Sorcery'],
                                label: "Discard an instant or sorcery card"
                            }]
                        },
                        {
                            label: "Discard two cards",
                            effects: [{
                                type: EffectType.DiscardCards,
                                amount: 2,
                                label: "Discard two cards"
                            }]
                        }
                    ]
                }
            ]
        }
    ]
};
