import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType } from "@shared/engine_types";

export const ChromaticOrrery: Record<string, ImplementableCard> = {
    "Chromatic Orrery": {
        name: "Chromatic Orrery",
        manaCost: "{7}",
        oracleText: "You may spend mana as though it were mana of any color.\n{T}: Add {C}{C}{C}{C}{C}.\n{5}, {T}: Draw a card for each color among permanents you control.",
        colors: [],
        supertypes: [],
        types: ["Artifact"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "chromatic_orrery_static",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [
                    {
                        type: EffectType.AllowSpendManaAsAnyColor,
                        targetMapping: 'CONTROLLER'
                    }
                ]
            },
            {
                id: "chromatic_orrery_mana",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [
                    { type: 'Tap' }
                ],
                effects: [
                    {
                        type: EffectType.AddMana,
                        value: '{C}{C}{C}{C}{C}',
                        targetMapping: 'CONTROLLER'
                    }
                ]
            },
            {
                id: "chromatic_orrery_draw",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [
                    { type: 'Mana', value: '{5}' },
                    { type: 'Tap' }
                ],
                effects: [
                    {
                        type: EffectType.DrawCards,
                        amount: 'COLORS_YOU_CONTROL_COUNT',
                        targetMapping: 'CONTROLLER'
                    }
                ]
            }
        ]
    }
};
