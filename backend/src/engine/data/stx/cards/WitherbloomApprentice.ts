import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const WitherbloomApprentice: CardDefinition = {
    name: "Witherbloom Apprentice",
    manaCost: "{B}{G}",
    colors: ["B", "G"],
    types: ["Creature"],
    subtypes: ["Human", "Druid"],
    power: "2",
    toughness: "2",
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, each opponent loses 1 life and you gain 1 life.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Magecraft,
            effects: [
                { type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.EachOpponent },
                { type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        }
    ],
    scryfall_id: "7f80a11b-188b-464c-b00d-c9d1cfb8ddee",
    image_url: "https://cards.scryfall.io/normal/front/7/f/7f80a11b-188b-464c-b00d-c9d1cfb8ddee.jpg?1624740448",
    rarity: "uncommon"
};

