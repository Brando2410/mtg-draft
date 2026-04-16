import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

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
                    costs: [{ type: 'Exile', targetMapping: TargetMapping.Self }],
                    effects: [{ type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Indestructible'], targetMapping: 'ALL_CREATURES_YOU_CONTROL' }]
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
                    targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Any', restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Type', value: 'Planeswalker' }] }] },
                    effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.AllOtherCreaturesAndPlaneswalkers, excludedTargetMapping: TargetMapping.Target1 }]
                }]
            }
        ]
    };

