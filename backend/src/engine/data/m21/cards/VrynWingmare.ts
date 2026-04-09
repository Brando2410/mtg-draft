import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const VrynWingmare: Record<string, ImplementableCard> = {
    "Vryn Wingmare": {
        name: "Vryn Wingmare",
        manaCost: "{2}{W}",
        oracleText: "Flying\nNoncreature spells cost {1} more to cast.",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Pegasus"],
        power: "2",
        toughness: "1",
        keywords: ["Flying"],
        abilities: [
            {
                id: "vryn_wingmare_tax",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'SpellTax', amount: 1, restrictions: ['Noncreature'], targetMapping: 'EACH_PLAYER' }]
            }
        ]
    }
};
