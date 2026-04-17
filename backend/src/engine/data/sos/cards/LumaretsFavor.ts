import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
    export const LumaretsFavor: CardDefinition = {
    name: "Lumaret's Favor",
    manaCost: "{1}{G}",
    scryfall_id: "c5e7c856-8b71-44e6-8998-0b0b3ff0ef99",
    image_url: "https://cards.scryfall.io/normal/front/c/5/c5e7c856-8b71-44e6-8998-0b0b3ff0ef99.jpg?1775938045",
    colors: [
        "G"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Infusion — When you cast this spell, copy it if you gained life this turn. You may choose new targets for the copy.\nTarget creature gets +2/+4 until end of turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: ConditionType.GainedLifeThisTurn,
            effects: [
                {
                    type: EffectType.CopySpellOnStack,
                    targetMapping: TargetMapping.Self
                }
            ]
        },
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 2,
                    toughnessModifier: 4,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
    
