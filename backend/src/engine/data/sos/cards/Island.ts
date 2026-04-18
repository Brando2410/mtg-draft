import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const Island: CardDefinition = {
    name: "Island",
    manaCost: "",
    scryfall_id: "fc9a66a1-367c-4035-a22e-00fab55be5a0",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/f/c/fc9a66a1-367c-4035-a22e-00fab55be5a0.jpg?1594737796",
    colors: [],
    supertypes: ["Basic"],
    types: ["Land"],
    subtypes: ["Island"],
    keywords: [],
    oracleText: "({T}: Add {U}.)",
    abilities: [
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            isManaAbility: true,
            costs: [{ type: CostType.Tap, targetMapping: TargetMapping.Self }],
            effects: [{ type: EffectType.AddMana, value: 'U' }]
        }
    ]
};

