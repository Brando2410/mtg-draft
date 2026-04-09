import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const AnointedChorister: Record<string, ImplementableCard> = {
    "Anointed Chorister": {
        name: "Anointed Chorister",
        manaCost: "{W}",
        oracleText: "Lifelink (Damage dealt by this creature also causes you to gain that much life.)\n{4}{W}: This creature gets +3/+3 until end of turn.",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Human","Cleric"],
        power: "1",
        toughness: "1",
        keywords: ["Lifelink"],
        abilities: [
            {
                id: "anointed_chorister_pump",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{4}{W}' }],
                effects: [{ type: 'ApplyContinuousEffect', powerModifier: 3, toughnessModifier: 3, duration: 'UNTIL_END_OF_TURN', layer: 7, targetMapping: 'SELF' }]
            }
        ]
    }
};
