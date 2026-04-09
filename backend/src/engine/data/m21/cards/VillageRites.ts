import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const VillageRites: Record<string, ImplementableCard> = {
    "Village Rites": {
        name: "Village Rites",
        manaCost: "{B}",
        oracleText: "As an additional cost to cast this spell, sacrifice a creature.\nDraw two cards.",
        colors: ["black"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "village_rites_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                costs: [{ type: 'Sacrifice', value: null, restrictions: ['Creature'] }],
                effects: [{ type: 'DrawCards', amount: 2, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};
