import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const SelflessGlyphweaver: CardDefinition = {
    name: "Selfless Glyphweaver",
    manaCost: "{2}{W}",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Human", "Cleric"],
    power: "2",
    toughness: "3",
    oracleText: "Exile Selfless Glyphweaver: Creatures you control gain indestructible until end of turn.",
    faces: [
        {
            name: "Selfless Glyphweaver",
            manaCost: "{2}{W}",
            colors: ["W"],
            types: ["Creature"],
            subtypes: ["Human", "Cleric"],
            power: "2",
            toughness: "3",
            oracleText: "Exile Selfless Glyphweaver: Creatures you control gain indestructible until end of turn.",
            abilities: [{
                type: AbilityType.Activated,
                costs: [{ type: CostType.ExileSelf }],
                effects: [{ type: EffectType.ApplyContinuousEffect, duration: { type: DurationType.UntilEndOfTurn }, abilitiesToAdd: ['Indestructible'], targetMapping: TargetMapping.AllCreaturesYouControl }]
            }]
        },
        {
            name: "Deadly Vanity",
            manaCost: "{5}{B}{B}",
            colors: ["B"],
            types: ["Sorcery"],
            oracleText: "Choose target creature or planeswalker. Destroy all other creatures and planeswalkers.",
            abilities: [{
                type: AbilityType.Spell,
                targetDefinitions: [{ count: 1, type: TargetType.CreatureOrPlaneswalker }],
                effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.AllOtherCreaturesAndPlaneswalkers, excludedTargetMapping: TargetMapping.Target1 }]
            }]
        }
    ]
};

