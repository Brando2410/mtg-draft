import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const AberrantManawurm: CardDefinition = {
    name: "Aberrant Manawurm",
    manaCost: "{3}{G}",


    colors: [
        "G"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Wurm"
    ],
    keywords: ["Trample"],
    oracleText: "Trample\nWhenever you cast an instant or sorcery spell, this creature gets +X/+0 until end of turn, where X is the amount of mana spent to cast that spell.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastInstantOrSorcery,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.Self,
                    powerModifier: 'EVENT_AMOUNT',
                    duration: { type: DurationType.UntilEndOfTurn }
                }
            ]
        }
    ],
    power: "2",
    toughness: "5",
    scryfall_id: "797131cf-d80d-4050-bebd-2ce1d7fae5d0",
    image_url: "https://cards.scryfall.io/normal/front/7/9/797131cf-d80d-4050-bebd-2ce1d7fae5d0.jpg?1775937935",
    rarity: "uncommon"
};

