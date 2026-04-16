import { AbilityType, ZoneRequirement, EffectType, TargetType, CardDefinition, DurationType, TargetMapping } from '@shared/engine_types';

export const AnointedChorister: CardDefinition = {

    name: "Anointed Chorister",
    manaCost: "{W}",
    oracleText: "Lifelink (Damage dealt by this creature also causes you to gain that much life.)\n{4}{W}: This creature gets +3/+3 until end of turn.",
    colors: ["W"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Human", "Cleric"],
    power: "1",
    toughness: "1",
    keywords: ["Lifelink"],
    abilities: [
        {
            id: "anointed_chorister_pump",
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Mana', value: '{4}{W}' }],
            effects: [{ type: EffectType.ApplyContinuousEffect, powerModifier: 3, toughnessModifier: 3, duration: DurationType.UntilEndOfTurn, layer: 7, targetMapping: TargetMapping.Self }]
        }
    ]

};
