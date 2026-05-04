import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const Eliminate: CardDefinition = {
    name: "Eliminate",
    manaCost: "{1}{B}",
    scryfall_id: "182fc140-f47f-4ca6-8bc0-d621586dfda4",
    image_url: "https://cards.scryfall.io/normal/front/1/8/182fc140-f47f-4ca6-8bc0-d621586dfda4.jpg?1594736082",
    oracleText: "Destroy target creature or planeswalker with mana value 3 or less.",
    colors: ["B"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.CreatureOrPlaneswalker,
                count: 1,
                restrictions: [Restriction.ManaValue3OrLess]
            }],
            effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
        }
    ]
};
