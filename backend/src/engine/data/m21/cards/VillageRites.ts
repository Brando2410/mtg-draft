import { AbilityType, ZoneRequirement, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const VillageRites: CardDefinition = {
    name: "Village Rites",
    manaCost: "{B}",
    oracleText: "As an additional cost to cast this spell, sacrifice a creature.\nDraw two cards.",
    colors: ["black"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            id: "village_rites_spell",
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            costs: [{ type: 'Sacrifice', restrictions: ['Creature'] }],
            effects: [{ type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Controller }]
        }
    ]

};
