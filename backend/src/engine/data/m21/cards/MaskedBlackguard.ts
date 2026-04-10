import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const MaskedBlackguard: Record<string, ImplementableCard> = {
    "Masked Blackguard": {
        name: "Masked Blackguard",
        manaCost: "{1}{B}",
        oracleText: "Flash (You may cast this spell any time you could cast an instant.)\n{2}{B}: This creature gets +1/+1 until end of turn.",
        colors: ["black"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Human", "Rogue"],
        power: "2",
        toughness: "1",
        keywords: ["Flash"],
        abilities: [
            {
                id: "masked_blackguard_buff",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [
                    { type: 'Mana', value: '{2}{B}' }
                ],
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        powerModifier: 1,
                        toughnessModifier: 1,
                        duration: { type: 'UNTIL_END_OF_TURN' },
                        targetMapping: 'SELF'
                    }
                ],
                oracleText: "{2}{B}: This creature gets +1/+1 until end of turn."
            }
        ]
    }
};
