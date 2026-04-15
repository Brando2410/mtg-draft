import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const FabledPassage: Record<string, ImplementableCard> = {
    "Fabled Passage": {
        name: "Fabled Passage",
        manaCost: "",
        oracleText: "{T}, Sacrifice this land: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle. Then if you control four or more lands, untap that land.",
        colors: [],
        supertypes: [],
        types: ["Land"],
        subtypes: [],
        power: "",
        toughness: "",
        keywords: [],
        abilities: [
            {
                id: "fabled_passage_activated",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [
                    { type: 'Tap', targetMapping: 'SELF' },
                    { type: 'Sacrifice', targetMapping: 'SELF' }
                ],
                effects: [
                    {
                        type: EffectType.SearchLibrary,

                        restrictions: ['Basic', 'Land'],
                        destination: Zone.Battlefield,
                        tapped: true,
                        shuffle: true,
                        effects: [
                            {
                                type: EffectType.Untap,
                                condition: 'LAND_COUNT_GE:4'
                            }
                        ]
                    }
                ]
            }
        ]
    }
};
