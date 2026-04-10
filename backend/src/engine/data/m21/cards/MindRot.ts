import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const MindRot: Record<string, ImplementableCard> = {
    "Mind Rot": {
        name: "Mind Rot",
        manaCost: "{2}{B}",
        oracleText: "Target player discards two cards.",
        colors: ["black"],
        supertypes: [],
        types: ["Sorcery"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "mind_rot_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Player', count: 1 },
                effects: [
                    {
                        type: EffectType.DiscardCards,
                        amount: 2,
                        targetMapping: 'TARGET_1'
                    }
                ]
            }
        ]
    }
};
