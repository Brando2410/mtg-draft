import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const NineLives: CardDefinition = {
    name: "Nine Lives",
    manaCost: "{1}{W}{W}",
    oracleText: "Hexproof\nIf a source would deal damage to you, prevent that damage and put an incarnation counter on this enchantment.\nWhen there are nine or more incarnation counters on this enchantment, exile it.\nWhen this enchantment leaves the battlefield, you lose the game.",
    colors: ["white"],
    supertypes: [],
    types: ["Enchantment"],
    subtypes: [],
    keywords: ["Hexproof"],
    abilities: [
        {
            id: "nine_lives_replacement_damage",
            type: AbilityType.Replacement,
            activeZone: Zone.Battlefield,
            replacesEvent: 'ON_DAMAGE_DEALT_TO_PLAYER',
            effects: [
                { type: EffectType.PreventDamage, targetMapping: TargetMapping.Controller },
                { type: EffectType.AddCounters, amount: 1, value: 'incarnation', targetMapping: TargetMapping.Self }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CountersAdded,
            activeZone: Zone.Battlefield,
            condition: (state: any, event: any) => event.counterType === 'incarnation' && (event.data?.object?.counters['incarnation'] || 0) >= 9,
            effects: [
                { type: EffectType.Exile, targetMapping: TargetMapping.Self }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.LeaveBattlefield,
            activeZone: Zone.Battlefield,
            effects: [{ type: EffectType.LoseGame, targetMapping: TargetMapping.Controller }]
        }
    ]
};




