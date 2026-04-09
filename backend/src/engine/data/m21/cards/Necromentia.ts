import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const Necromentia: Record<string, ImplementableCard> = {
    "Necromentia": {
        name: "Necromentia",
        manaCost: "{1}{B}{B}",
        oracleText: "Choose a card name other than a basic land card name. Search target opponent's graveyard, hand, and library for any number of cards with that name and exile them. That player shuffles, then creates a 2/2 black Zombie creature token for each card exiled from their hand this way.",
        colors: ["black"],
        supertypes: [],
        types: ["Sorcery"],
        subtypes: [],
        power: "",
        toughness: "",
        keywords: [],
        abilities: [
            {
                id: "necromentia_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [
                    { type: EffectType.Choice, message: "Necromentia search and exile effect" }
                ]
            }
        ]
    }
};
