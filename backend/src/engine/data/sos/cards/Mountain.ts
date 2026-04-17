import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const Mountain: CardDefinition = {
    name: "Mountain",
    manaCost: "",
    scryfall_id: "b92c8925-ecfc-4ece-b83a-f12e98a938ab",
    image_url: "https://cards.scryfall.io/normal/front/b/9/b92c8925-ecfc-4ece-b83a-f12e98a938ab.jpg?1594737848",
    colors: [],
    supertypes: ["Basic"],
    types: ["Land"],
    subtypes: ["Mountain"],
    keywords: [],
    oracleText: "({T}: Add {R}.)",
    abilities: [
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            isManaAbility: true,
            costs: [{ type: CostType.Tap, targetMapping: TargetMapping.Self }],
            effects: [{ type: EffectType.AddMana, value: 'R' }]
        }
    ]
};
