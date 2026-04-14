import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const DoubleVision: Record<string, ImplementableCard> = {
    "Double Vision": {
        name: "Double Vision",
        manaCost: "{3}{R}{R}",
        oracleText: "Whenever you cast your first instant or sorcery spell each turn, copy that spell. You may choose new targets for the copy.",
        colors: ["red"],
        supertypes: [],
        types: ["Enchantment"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "double_vision_copy",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_CAST_FIRST_INSTANT_SORCERY',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                effects: [{ type: 'CopySpellOnStack', targetMapping: 'TRIGGER_SOURCE', chooseNewTargets: true }]
            }
        ]
    }
};


