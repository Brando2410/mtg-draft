import { AbilityType, CardDefinition, Zone } from '@shared/engine_types';

export const TeferisAgelessInsight: CardDefinition = {
    name: "Teferi's Ageless Insight",
    manaCost: "{2}{U}{U}",
    oracleText: "If you would draw a card except the first one you draw in each of your draw steps, draw two cards instead.",
    colors: ["U"],
    supertypes: ["Legendary"],
    types: ["Artifact"],
    abilities: [
        {
            type: AbilityType.Static, // Changed from Replacement to Static for consistency if needed, but keeping logic in mind
            id: 'teferi_ageless_insight', // Keeping the ID as it's used by the engine
            activeZone: Zone.Battlefield,
            effects: []
        }
    ]
};


