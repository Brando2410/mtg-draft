import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const LilianasScorn: Record<string, ImplementableCard> = {
    "Liliana's Scorn": {
        name: "Liliana's Scorn",
        manaCost: "{3}{B}{B}",
        oracleText: "Destroy target creature. You may search your library and/or graveyard for a card named Liliana, Death Mage, reveal it, and put it into your hand. If you search your library this way, shuffle.",
        colors: ["black"],
        supertypes: [],
        types: ["Sorcery"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "lilianas_scorn_spell",
                type: AbilityType.Spell,
                activeZone: Zone.Hand,
                targetDefinition: {
                    type: TargetType.Creature,
                    count: 1
                },
                effects: [
                    {
                        type: EffectType.Destroy,
                        targetMapping: 'TARGET_1'
                    },
                    {
                        type: EffectType.SearchLibrary,
                        amount: 1,
                        optional: true,
                        reveal: true,
                        shuffle: true,
                        destination: Zone.Hand,
                        sourceZones: [Zone.Library, Zone.Graveyard],
                        restrictions: [{ name: 'Liliana, Death Mage' }],
                        label: "Search library/graveyard for Liliana, Death Mage"
                    }
                ],
                oracleText: "Destroy target creature. You may search your library and/or graveyard for a card named Liliana, Death Mage, reveal it, and put it into your hand. If you search your library this way, shuffle."
            }
        ]
    }
};
