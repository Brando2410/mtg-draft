import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';
export const ChaseInspiration: CardDefinition = {
    name: "Chase Inspiration",
    manaCost: "{U}",
    scryfall_id: "06f9f257-c7ef-44b7-8b2b-f038fba900af",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/0/6/06f9f257-c7ef-44b7-8b2b-f038fba900af.jpg?1775937195",
    colors: ["U"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Target creature you control gets +0/+3 and gains hexproof until end of turn. (It can't be the target of spells or abilities your opponents control.)",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Creature, count: 1, restrictions: [
                    Restriction.YouControl
                ]
            }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    sublayer: 'Stats',
                    toughnessModifier: 3,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    sublayer: 'Abilities',
                    abilitiesToAdd: ['Hexproof'],
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};

