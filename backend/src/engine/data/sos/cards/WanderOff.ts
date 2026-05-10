import { AbilityType, CardDefinition, CostType, TargetMapping, TargetType } from '@shared/engine_types';
export const WanderOff: CardDefinition = {
    name: "Wander Off",
    manaCost: "{3}{B}",
    colors: ["B"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Exile target creature.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1
            }],
            effects: [
                {
                    type: CostType.Exile,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    scryfall_id: "3d409512-50b9-4a38-91b0-19ba25227992",
    image_url: "https://cards.scryfall.io/normal/front/3/d/3d409512-50b9-4a38-91b0-19ba25227992.jpg?1775937643",
    rarity: "common"
};

