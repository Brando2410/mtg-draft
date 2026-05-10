import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const SwiftResponse: CardDefinition = {
    name: "Swift Response",
    manaCost: "{1}{W}",
    oracleText: "Destroy target tapped creature.",
    colors: ["W"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1,
                restrictions: [Restriction.Tapped]
            }],
            effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
        }
    ],
    scryfall_id: "3d70dcbe-0b90-40b4-8a54-e5218b7135b1",
    image_url: "https://cards.scryfall.io/normal/front/3/d/3d70dcbe-0b90-40b4-8a54-e5218b7135b1.jpg?1689996091",
    rarity: "common"
};

