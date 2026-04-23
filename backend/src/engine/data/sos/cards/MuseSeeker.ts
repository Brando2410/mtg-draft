import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const MuseSeeker: CardDefinition = {
    name: "Muse Seeker",
    manaCost: "{1}{U}",
    scryfall_id: "71cb4a6b-b500-4b28-bcdb-ec4188242f39",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/7/1/71cb4a6b-b500-4b28-bcdb-ec4188242f39.jpg?1775937328",
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Elf", "Wizard"],
    keywords: ["Opus"],
    power: "1",
    toughness: "2",
    oracleText: "Opus — Whenever you cast an instant or sorcery spell, draw a card. Then discard a card unless five or more mana was spent to cast that spell.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: ConditionType.PlayerIsController,
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.DiscardCards,
                    amount: 1,
                    targetMapping: TargetMapping.Controller,
                    condition: 'SPENT_MANA_LT:5',
                }
            ]
        }
    ]
};
