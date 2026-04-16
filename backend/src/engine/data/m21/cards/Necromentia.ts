import { AbilityType, Zone, CardDefinition, EffectType, TargetType, TargetMapping } from "@shared/engine_types";

export const Necromentia: CardDefinition = {
    name: "Necromentia",
    manaCost: "{1}{B}{B}",
    oracleText: "Choose a card name other than a basic land card name. Search target opponent's graveyard, hand, and library for any number of cards with that name and exile them. That player shuffles their library, then creates a 2/2 black Zombie creature token for each card exiled from their hand this way.",
    colors: ["B"],
    supertypes: [],
    types: ["Sorcery"],
    subtypes: [],
    power: "",
    toughness: "",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Opponent,
                count: 1,
            },
            effects: [
                { type: EffectType.Necromentia, targetMapping: TargetMapping.Target1 }
            ]
        }
    ]
};

