import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, Zone, Restriction } from '@shared/engine_types';

export const EpitaphGolem: CardDefinition = {
    name: "Epitaph Golem",
    manaCost: "{5}",
    scryfall_id: "0e060d4b-2321-4d37-8bcf-6997092cc632",
    image_url: "https://cards.scryfall.io/normal/front/0/e/0e060d4b-2321-4d37-8bcf-6997092cc632.jpg?1594737487",
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
            targetDefinition: { type: TargetType.CardInGraveyard, count: 1, restrictions: [Restriction.YouControl] },
            effects: [{ type: EffectType.MoveToZone, zone: Zone.Library, position: 'bottom', targetMapping: TargetMapping.Target1 }]
        }
    ]
};
