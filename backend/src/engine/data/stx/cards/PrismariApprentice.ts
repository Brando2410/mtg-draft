import { AbilityType, CardDefinition, DurationType, EffectType, RestrictionType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const PrismariApprentice: CardDefinition = {
    name: "Prismari Apprentice",
    manaCost: "{U}{R}",
    colors: ["U", "R"],
    types: ["Creature"],
    subtypes: ["Human", "Shaman"],
    power: "2",
    toughness: "2",
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, Prismari Apprentice can't be blocked this turn. Then if that spell has mana value 5 or greater, put a +1/+1 counter on Prismari Apprentice.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    restrictionsToAdd: [RestrictionType.CannotBeBlocked],
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Self
                },
                {
                    type: EffectType.AddCounters,
                    condition: "EVENT_MANA_VALUE_GE:5",
                    counterType: '+1/+1',
                    amount: 1,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    scryfall_id: "dca3aa59-c8ac-4930-abf7-0a74d657122a",
    image_url: "https://cards.scryfall.io/normal/front/d/c/dca3aa59-c8ac-4930-abf7-0a74d657122a.jpg?1627429925",
    rarity: "uncommon"
};

