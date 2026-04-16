import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const DoubleMajor: CardDefinition = {
        name: "Double Major",
        manaCost: "{G}{U}",
        colors: ["G", "U"],
        types: ["Instant"],
        oracleText: "Copy target creature spell you control that isn't legendary, except the copy isn't legendary.",
        abilities: [{
            type: AbilityType.Spell,
            targetDefinition: { count: 1, type: TargetType.Spell, restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Source', value: 'CONTROLLER' }, { type: 'Not', restriction: { type: 'Legendary' } }] },
            effects: [{ type: EffectType.CopySpellOnStack, targetMapping: TargetMapping.Target1, removeLegendary: true }]
        }]
    };

