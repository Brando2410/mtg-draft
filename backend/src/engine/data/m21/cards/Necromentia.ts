import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from "@shared/engine_types";

export const Necromentia: CardDefinition = {
    name: "Necromentia",
    manaCost: "{1}{B}{B}",
    scryfall_id: "32c5252e-ff15-4f86-ad63-d8286427e70f",
    image_url: "https://cards.scryfall.io/normal/front/3/2/32c5252e-ff15-4f86-ad63-d8286427e70f.jpg?1594736316",
    oracleText: "Choose a card name other than a basic land card name. Search target opponent's graveyard, hand, and library for any number of cards with that name and exile them. That player shuffles their library, then creates a 2/2 black Zombie creature token for each card exiled from their hand this way.",
    colors: ["B"],
    types: ["Sorcery"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.Opponent, count: 1 },
            effects: [{
                type: EffectType.Necromentia,
                targetMapping: TargetMapping.Target1
            }]
        }
    ]
};
