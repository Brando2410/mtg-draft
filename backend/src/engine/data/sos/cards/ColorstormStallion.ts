import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const ColorstormStallion: CardDefinition = {
    name: "Colorstorm Stallion",
    manaCost: "{1}{U}{R}",
    scryfall_id: "f5b54d46-2caf-4d1b-8be1-dbd9e9dce058",
    rarity: "rare",
    image_url: "https://cards.scryfall.io/normal/front/f/5/f5b54d46-2caf-4d1b-8be1-dbd9e9dce058.jpg?1775938240",
    colors: ["R", "U"],
    types: ["Creature"],
    subtypes: ["Elemental", "Horse"],
    keywords: ["Ward {1}", "Haste"],
    power: "3",
    toughness: "3",
    oracleText: "Ward {1}, haste\nOpus — Whenever you cast an instant or sorcery spell, this creature gets +1/+1 until end of turn. If five or more mana was spent to cast that spell, create a token that's a copy of this creature.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: ConditionType.PlayerIsController,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    toughnessModifier: 1,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Self
                },
                {
                    type: EffectType.CreateTokenCopy,
                    condition: 'SPENT_MANA_GE:5',
                    sourceMapping: TargetMapping.Self
                }
            ]
        }
    ]
}

