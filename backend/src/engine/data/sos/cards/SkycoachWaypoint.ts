import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const SkycoachWaypoint: CardDefinition = {
    name: "Skycoach Waypoint",
    manaCost: "",
    colors: [],
    types: [
        "Land"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "{T}: Add {C}.\n{3}, {T}: Target creature becomes prepared. (Only creatures with prepare spells can become prepared.)",
    abilities: [
        {
            type: AbilityType.Activated,
            id: "{T}: Add {C}",
            costs: [{ type: CostType.Tap }],
            isManaAbility: true,
            effects: [{ type: EffectType.AddMana, manaType: 'C' }]
        },
        {
            type: AbilityType.Activated,
            id: "{3}, {T}: Target creature becomes prepared",
            costs: [
                { type: CostType.Mana, value: '{3}' },
                { type: CostType.Tap }
            ],
            targetDefinitions: [{ type: TargetType.Creature, count: 1 }],
            effects: [
                {
                    type: EffectType.Prepare,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    scryfall_id: "6747657b-5ce4-4dbd-b924-ca1f7119faf7",
    image_url: "https://cards.scryfall.io/normal/front/6/7/6747657b-5ce4-4dbd-b924-ca1f7119faf7.jpg?1775938823",
    rarity: "uncommon"
};

