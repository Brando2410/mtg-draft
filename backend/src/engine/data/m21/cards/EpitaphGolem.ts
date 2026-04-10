import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType, DurationType } from "@shared/engine_types";

export const EpitaphGolem: Record<string, ImplementableCard> = {
    "Epitaph Golem": {
        name: "Epitaph Golem",
        manaCost: "{5}",
        oracleText: "{2}: Put target card from your graveyard on the bottom of your library.",
        colors: [],
        supertypes: [],
        types: ["Artifact", "Creature"],
        subtypes: ["Golem"],
        power: "3",
        toughness: "5",
        keywords: [],
        abilities: [
            {
                id: "epitaph_golem_ability",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [
                    { type: 'Mana', value: "{2}" }
                ],
                targetDefinition: {
                    type: TargetType.Card,
                    count: 1,
                    restrictions: ["graveyard", "yours"]
                },
                effects: [
                    {
                        type: EffectType.MoveToZone,
                        destination: Zone.Library,
                        libraryPosition: "bottom",
                        targetMapping: "TARGET_1"
                    }
                ],
                oracleText: "{2}: Put target card from your graveyard on the bottom of your library."
            }
        ]
    }
};
