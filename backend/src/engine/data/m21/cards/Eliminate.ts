import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const Eliminate: CardDefinition = {
    name: "Eliminate",
    manaCost: "{1}{B}",
    scryfall_id: "f8eb4087-3a4c-4de8-8e29-f4cd71acb180",
    image_url: "https://cards.scryfall.io/normal/front/f/8/f8eb4087-3a4c-4de8-8e29-f4cd71acb180.jpg?1594736106",
    oracleText: "Destroy target creature or planeswalker with mana value 3 or less.",
    colors: ["B"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.CreatureOrPlaneswalker,
                count: 1,
                restrictions: ["mv <= 3"]
            },
            effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
        }
    ]
};


