import { AbilityType, CardDefinition, EffectType, GameEvent, GameObject, TargetType, Zone } from '@shared/engine_types';

export const NineLives: CardDefinition = {
        name: "Nine Lives",
        manaCost: "{1}{W}{W}",
        oracleText: "Hexproof\nIf a source would deal damage to you, prevent that damage and put an incarnation counter on this enchantment.\nWhen there are nine or more incarnation counters on this enchantment, exile it.\nWhen this enchantment leaves the battlefield, you lose the game.",
        colors: ["white"],
        supertypes: [],
        types: ["Enchantment"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: ["Hexproof"],
        abilities: [
            {
                id: "nine_lives_replacement_damage",
                type: AbilityType.Replacement,
                activeZone: Zone.Battlefield,
                replacesEvent: 'ON_DAMAGE_DEALT_TO_PLAYER',
                effects: [
                    { type: 'PreventDamage', targetMapping: 'CONTROLLER' },
                    { type: 'AddCounters', amount: 1, value: 'incarnation', targetMapping: 'SELF' }
                ]
            },
            {
                id: "nine_lives_loosing_trigger",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_COUNTER_ADDED',
                activeZone: Zone.Battlefield,
                condition: (state: any, event: any) => event.counterType === 'incarnation' && (event.target.counters['incarnation'] || 0) >= 9,
                effects: [
                    { type: 'Exile', targetMapping: 'SELF' },
                    { type: 'LoseGame', targetMapping: 'CONTROLLER' }
                ]
            },
            {
                id: "nine_lives_leave_trigger",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_LEAVE_BATTLEFIELD',
                activeZone: Zone.Battlefield,
                effects: [{ type: 'LoseGame', targetMapping: 'CONTROLLER' }]
            }
        ]
    };




