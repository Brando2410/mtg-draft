import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const DoubleVision: CardDefinition = {
    name: "Double Vision",
    manaCost: "{3}{R}{R}",
    oracleText: "Whenever you cast your first instant or sorcery spell each turn, copy that spell. You may choose new targets for the copy.",
    colors: ["R"],
    supertypes: [],
    types: ["Enchantment"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastFirstInstantOrSorcery,
            condition: 'EVENT_PLAYER_IS_YOU',
            effects: [{ type: EffectType.CopySpellOnStack, targetMapping: TargetMapping.TriggerSource, chooseNewTargets: true }]
        }
    ]
};




