import { AbilityType, ImplementableCard, ZoneRequirement, EffectType, TargetType, TriggerEvent } from '@shared/engine_types';

export const InfuseWithVitality: ImplementableCard = {
    name: 'Infuse with Vitality',
    manaCost: '{B}{G}',
    type_line: 'Instant',
    types: ['Instant'],
    subtypes: [],
    power: '0',
    toughness: '0',
    keywords: [],
    colors: ['black', 'green'],
    supertypes: [],
    oracleText: 'Until end of turn, target creature gains deathtouch and “When this creature dies, return it to the battlefield tapped under its owner’s control.” You gain 2 life.',
    abilities: [
        {
            id: 'infuse_with_vitality_spell',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Hand,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'TARGET',
                    duration: 'UNTIL_END_OF_TURN',
                    abilitiesToAdd: ['Deathtouch']
                },
                {
                    type: 'AddTriggeredAbility',
                    targetMapping: 'TARGET',
                    eventMatch: 'ON_DEATH',
                    duration: 'UNTIL_END_OF_TURN',
                    // Condition: Check if the dying creature is the original target
                    triggerCondition: (state: any, event: any, t: any) => {
                        const targetId = t.targetIds?.[0];
                        return event.targetId === targetId;
                    },
                    effects: [
                        {
                            type: EffectType.PutOnBattlefield,
                            targetMapping: 'EVENT_TARGET',
                            tapped: true
                        }
                    ]
                },
                {
                    type: EffectType.GainLife,
                    targetMapping: 'SELF',
                    amount: 2
                }
            ],
            targetDefinition: {
                type: TargetType.Permanent,
                count: 1,
                restrictions: ['Creature']
            }
        }
    ]
};
