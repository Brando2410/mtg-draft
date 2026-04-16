import {AbilityType, Zone, CardDefinition, EffectType, GameEvent, GameObject, TargetType, TargetMapping} from "@shared/engine_types";

export const FabledPassage: CardDefinition = {
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
                activeZone: Zone.Battlefield,
                costs: [
                    { type: 'Tap', targetMapping: TargetMapping.Self },
                    { type: 'Sacrifice', targetMapping: TargetMapping.Self }
                ],
                effects: [
                    {
                        type: EffectType.SearchLibrary,
                        targetDefinition: {
                            type: TargetType.Land,
                            count: 1,
                            restrictions: ['Basic']
                        },
                        zone: Zone.Battlefield,
                        tapped: true,
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
    };

