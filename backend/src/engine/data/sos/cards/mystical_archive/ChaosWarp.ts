import { AbilityType, CardDefinition, EffectType, TargetType } from '@shared/engine_types';

export const ChaosWarp: CardDefinition = {
    name: "Chaos Warp",
    manaCost: "{2}{R}",
    oracleText: "The owner of target permanent shuffles it into their library, then reveals the top card of their library. If it's a permanent card, they put it onto the battlefield.",
    colors: ["R"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Permanent,
                count: 1
            }],
            effects: [
                {
                    type: EffectType.ChaosWarp
                }
            ]
        }
    ],
    set: "soa",
    scryfall_id: "65ae241c-8955-4c97-8be6-7356fbee2195",
    image_url: "https://cards.scryfall.io/normal/front/6/5/65ae241c-8955-4c97-8be6-7356fbee2195.jpg?1775941250",
    rarity: "rare"
};

