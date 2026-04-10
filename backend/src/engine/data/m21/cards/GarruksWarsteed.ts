import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, TargetType } from "@shared/engine_types";

export const GarruksWarsteed: Record<string, ImplementableCard> = {
    "Garruk's Warsteed": {
        name: "Garruk's Warsteed",
        manaCost: "{3}{G}{G}",
        oracleText: "Vigilance\nWhen Garruk's Warsteed enters the battlefield, you may search your library and/or graveyard for a card named Garruk, Savage Herald, reveal it, and put it into your hand. If you search your library this way, shuffle.",
        colors: ["green"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Rhino"],
        power: "3",
        toughness: "5",
        keywords: ["Vigilance"],
        abilities: [
            {
                id: "garruks_warsteed_etb",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                triggerEvent: 'ON_ETB',
                effects: [
                    {
                        type: EffectType.Choice,
                        message: "Search library and/or graveyard for Garruk, Savage Herald?",
                        choices: [
                            {
                                label: "Search library and/or graveyard",
                                effects: [
                                    {
                                        type: EffectType.SearchLibrary,
                                        targetMapping: 'PLAYER_LIBRARY_AND_GRAVEYARD',
                                        restrictions: [{ name: 'Garruk, Savage Herald' }],
                                        reveal: true,
                                        destination: Zone.Hand,
                                        shuffle: true
                                    }
                                ]
                            },
                            {
                                label: "Don't search",
                                effects: []
                            }
                        ]
                    }
                ]
            }
        ]
    }
};
