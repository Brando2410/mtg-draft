import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const MelancholicPoet: CardDefinition = {
    name: "Melancholic Poet",
    manaCost: "{1}{B}",


    colors: [
        "B"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Elf",
        "Bard"
    ],
    keywords: ["Repartee"],
    oracleText: "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, each opponent loses 1 life and you gain 1 life.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: ConditionType.ReparteeTrigger,
            effects: [
                {
                    type: EffectType.LoseLife,
                    amount: 1,
                    targetMapping: TargetMapping.EachOpponent
                },
                {
                    type: EffectType.GainLife,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    power: "2",
    toughness: "2",
    scryfall_id: "d8309815-7035-47a5-acf2-2b2ac1e65037",
    image_url: "https://cards.scryfall.io/normal/front/d/8/d8309815-7035-47a5-acf2-2b2ac1e65037.jpg?1775937538",
    rarity: "common"
};

