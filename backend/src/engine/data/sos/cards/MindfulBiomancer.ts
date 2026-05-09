import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const MindfulBiomancer: CardDefinition = {
    name: "Mindful Biomancer",
    manaCost: "{1}{G}",
    scryfall_id: "2c3a6eb8-ce0c-4dc8-9ed6-d2a9223eef53",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/2/c/2c3a6eb8-ce0c-4dc8-9ed6-d2a9223eef53.jpg?1775938052",
    colors: [
        "G"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Dryad",
        "Druid"
    ],
    keywords: [],
    oracleText: "When this creature enters, you gain 1 life.\n{2}{G}: This creature gets +2/+2 until end of turn. Activate only once each turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.GainLife,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{2}{G}' }],
            limitPerTurn: 1,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 2,
                    toughnessModifier: 2,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    power: "2",
    toughness: "2"
};

