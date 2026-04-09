import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const Eliminate: Record<string, ImplementableCard> = {
    "Eliminate": {
        name: "Eliminate",
        manaCost: "{1}{B}",
        oracleText: "Destroy target creature or planeswalker with mana value 3 or less.",
        colors: ["black"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "eliminate_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['CreatureOrPlaneswalker', 'CMC<=3'] },
                effects: [{ type: 'Destroy', targetMapping: 'TARGET_1' }]
            }
        ]
    }
};
