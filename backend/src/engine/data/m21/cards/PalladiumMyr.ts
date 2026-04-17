import { AbilityType, CardDefinition, EffectType, TargetMapping } from "@shared/engine_types";

export const PalladiumMyr: CardDefinition = {

    name: "Palladium Myr",
    manaCost: "{3}",
    scryfall_id: "27305aad-f1bd-4895-8611-143bc0250bee",
    image_url: "https://cards.scryfall.io/normal/front/2/7/27305aad-f1bd-4895-8611-143bc0250bee.jpg?1594737522",
    oracleText: "{T}: Add {C}{C}.",
    colors: [],
    supertypes: [],
    types: ["Artifact", "Creature"],
    subtypes: ["Myr"],
    power: "2",
    toughness: "2",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Tap' }],
            isManaAbility: true,
            effects: [{
                type: EffectType.AddMana,
                value: 'C',
                amount: 2,
                targetMapping: TargetMapping.Controller
            }]
        }
    ]
};

