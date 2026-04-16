import { AbilityType, ZoneRequirement, EffectType, TargetType, CardDefinition, DurationType, TargetMapping } from '@shared/engine_types';

export const AlchemistsGift: CardDefinition = {
    name: "Alchemist's Gift",
    manaCost: "{B}",
    oracleText: "Target creature gets +1/+1 and gains your choice of deathtouch or lifelink until end of turn. (Any amount of damage a creature with deathtouch deals to a creature is enough to destroy it. Damage dealt by a creature with lifelink also causes its controller to gain that much life.)",
    colors: ["B"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            id: "alchemist_gift_spell",
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            targetDefinition: { type: TargetType.Creature, count: 1 },
            effects: [
                {
                    type: EffectType.Choice,
                    targetMapping: TargetMapping.Self,
                    label: 'Choose a keyword',
                    choices: [
                        {
                            label: 'Deathtouch',
                            effects: [
                                { type: EffectType.ApplyContinuousEffect, powerModifier: 1, toughnessModifier: 1, duration: DurationType.UntilEndOfTurn, abilitiesToAdd: ['Deathtouch'], layer: 7, targetMapping: TargetMapping.Target1 }
                            ]
                        },
                        {
                            label: 'Lifelink',
                            effects: [
                                { type: EffectType.ApplyContinuousEffect, powerModifier: 1, toughnessModifier: 1, duration: DurationType.UntilEndOfTurn, abilitiesToAdd: ['Lifelink'], layer: 7, targetMapping: TargetMapping.Target1 }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
