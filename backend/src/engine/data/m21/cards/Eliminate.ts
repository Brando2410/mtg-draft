import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const Eliminate: CardDefinition = {
    name: "Eliminate",
    manaCost: "{1}{B}",
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
    ],
    scryfall_id: "f8eb4087-3a4c-4de8-8e29-f4cd71acb180",
    image_url: "https://cards.scryfall.io/normal/front/f/8/f8eb4087-3a4c-4de8-8e29-f4cd71acb180.jpg?1594736106",
    rarity: "uncommon"
};

