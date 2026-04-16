import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const BurlfistOak: CardDefinition = {

    name: "Burlfist Oak",
    manaCost: "{2}{G}{G}",
    oracleText: "Whenever you draw a card, this creature gets +2/+2 until end of turn.",
    colors: ["G"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Treefolk"],
    power: "2",
    toughness: "3",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Draw,
            condition: 'EVENT_PLAYER_IS_YOU',
            effects: [{ type: EffectType.ApplyContinuousEffect, duration: { type: DurationType.UntilEndOfTurn }, powerModifier: 2, toughnessModifier: 2, layer: 7, targetMapping: TargetMapping.Self }]
        }
    ]
};




