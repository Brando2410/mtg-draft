import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const EpitaphGolem: CardDefinition = {
    name: "Epitaph Golem",
    manaCost: "{5}",
    oracleText: "{2}: Put target card from your graveyard on the bottom of your library.",
    colors: [],
    types: ["Artifact", "Creature"],
    subtypes: ["Golem"],
    power: "3",
    toughness: "5",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{2}' }],
            targetDefinitions: [{ type: TargetType.CardInGraveyard, count: 1, restrictions: [Restriction.YouControl] }],
            effects: [{ type: EffectType.MoveToZone, zone: Zone.Library, position: 'bottom', targetMapping: TargetMapping.Target1 }]
        }
    ],
    scryfall_id: "202125f5-9182-436f-86df-701cdc7e60ce",
    image_url: "https://cards.scryfall.io/normal/front/2/0/202125f5-9182-436f-86df-701cdc7e60ce.jpg?1737936168",
    rarity: "common"
};

