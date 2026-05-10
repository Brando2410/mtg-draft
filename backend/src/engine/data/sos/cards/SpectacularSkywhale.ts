import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const SpectacularSkywhale: CardDefinition = {
    name: "Spectacular Skywhale",
    manaCost: "{2}{U}{R}",
    colors: [
        "R",
        "U"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Elemental",
        "Whale"
    ],
    keywords: ["Flying"],
    oracleText: "Flying\nOpus — Whenever you cast an instant or sorcery spell, this creature gets +3/+0 until end of turn. If five or more mana was spent to cast that spell, put three +1/+1 counters on this creature instead.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: ConditionType.PlayerIsController,
            effects: [
                {
                    type: EffectType.AddCounters,
                    amount: 3,
                    counterType: '+1/+1',
                    condition: 'SPENT_MANA_GE:5',
                    targetMapping: TargetMapping.Self
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    condition: 'SPENT_MANA_LT:5',
                    duration: { type: DurationType.UntilEndOfTurn },
                    powerModifier: 3,
                    toughnessModifier: 0,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    power: "1",
    toughness: "4",
    scryfall_id: "c90366d5-b4ba-4772-a3c5-f138bbe7f305",
    image_url: "https://cards.scryfall.io/normal/front/c/9/c90366d5-b4ba-4772-a3c5-f138bbe7f305.jpg?1775938597",
    rarity: "uncommon"
};

