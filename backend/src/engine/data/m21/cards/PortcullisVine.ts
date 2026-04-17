import { AbilityType, CostType, CardDefinition, EffectType, TargetMapping } from "@shared/engine_types";

export const PortcullisVine: CardDefinition = {

    name: "Portcullis Vine",
    manaCost: "{G}",
    scryfall_id: "d1abd95a-4ecc-479c-b200-5aaf7c993ef8",
    image_url: "https://cards.scryfall.io/normal/front/d/1/d1abd95a-4ecc-479c-b200-5aaf7c993ef8.jpg?1594737120",
    oracleText: "Defender\n{2}, {T}, Sacrifice a creature with defender: Draw a card.",
    colors: ["G"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Plant", "Wall"],
    power: "0",
    toughness: "3",
    keywords: ["Defender"],
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{2}' },
                { type: CostType.Tap },
                {
                    type: CostType.Sacrifice,
                    restrictions: [
                { type: 'Type', value: 'Creature' },
                { type: 'Type', value: 'Defender' }
            ]
                }
            ],
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};

