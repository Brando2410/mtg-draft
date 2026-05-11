import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const CropRotation: CardDefinition = {
    name: "Crop Rotation",
    manaCost: "{G}",
    colors: ["G"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "As an additional cost to cast this spell, sacrifice a land.\nSearch your library for a land card, put that card onto the battlefield, then shuffle.",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            costs: [{ type: CostType.Sacrifice, amount: 1, restrictions: [Restriction.Land, Restriction.YouControl] }],
            effects: [{
                type: EffectType.SearchLibrary,
                targetDefinitions: [{ count: 1, type: TargetType.Land }],
                zone: Zone.Battlefield,
                shuffle: true
            }]
        }
    ],
    scryfall_id: "d5d50e02-80c8-4b7d-9f51-7f1d79f9f263",
    image_url: "https://cards.scryfall.io/normal/front/d/5/d5d50e02-80c8-4b7d-9f51-7f1d79f9f263.jpg?1775936740",
    rarity: "rare"
};

