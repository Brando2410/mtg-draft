import { AbilityType, Zone, CardDefinition, Zone, EffectType, TargetType } from "@shared/engine_types";

export const Necromentia: CardDefinition = {
        name: "Necromentia",
        manaCost: "{1}{B}{B}",
        oracleText: "Choose a card name other than a basic land card name. Search target opponent's graveyard, hand, and library for any number of cards with that name and exile them. That player shuffles their library, then creates a 2/2 black Zombie creature token for each card exiled from their hand this way.",
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
                targetDefinition: {
                    type: TargetType.Player,
                    count: 1,
                    restrictions: ['opponent']
                },
                effects: [
                    { type: EffectType.Necromentia, targetMapping: 'TARGET_1' }
                ]
            }
        ]
    };

