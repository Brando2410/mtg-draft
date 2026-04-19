import { AbilityType, CardDefinition, DurationType, EffectType, RestrictionType, TargetMapping, TargetType, Zone } from "@shared/engine_types";

export const FrostBreath: CardDefinition = {
    name: "Frost Breath",
    manaCost: "{2}{U}",
    scryfall_id: "393fc485-d3c1-4826-933d-89f66df769d4",
    image_url: "https://cards.scryfall.io/normal/front/3/9/393fc485-d3c1-4826-933d-89f66df769d4.jpg?1594735496",
    oracleText: "Tap up to two target creatures. Those creatures don't untap during their controller's next untap step.",
    colors: ["U"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            id: "frost_breath_spell",
            type: AbilityType.Spell,
            activeZone: Zone.Hand,
            targetDefinition: {
                type: TargetType.Creature,
                count: 2,
                minCount: 0
            },
            effects: [
                {
                    type: EffectType.Tap,
                    targetMapping: TargetMapping.TargetAll
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    restrictionsToAdd: [{ type: RestrictionType.CannotUntap }],
                    duration: {
                        type: DurationType.UntilNextUntapStep
                    },
                    targetMapping: TargetMapping.TargetAll
                }
            ],
        }
    ]
};
