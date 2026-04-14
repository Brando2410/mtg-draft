import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent, DurationType } from '@shared/engine_types';

export const GreatHalloftheBiblioplex: CardDefinition = {
    "name": "Great Hall of the Biblioplex",
    "manaCost": "",
    "colors": [],
    "types": ["Land"],
    "subtypes": [],
    "oracleText": "{T}: Add {C}.\n{T}, Pay 1 life: Add one mana of any color. Spend this mana only to cast an instant or sorcery spell.\n{5}: If this land isn't a creature, it becomes a 2/4 Wizard creature with \"Whenever you cast an instant or sorcery spell, this creature gets +1/+0 until end of turn.\" It's still a land.",
    "abilities": [
        {
            type: AbilityType.Activated,
            isManaAbility: true,
            costs: [{ type: 'TapSelf' }],
            effects: [{ type: EffectType.AddMana, value: '{C}' }]
        },
        {
            type: AbilityType.Activated,
            isManaAbility: true,
            costs: [{ type: 'TapSelf' }, { type: 'LoseLife', amount: 1 }],
            effects: [{ 
                type: EffectType.AddMana, 
                value: '{ANY}', 
                manaRestrictions: ['Instant', 'Sorcery'] 
            }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Mana', value: '{5}' }],
            effects: [
                {
                    type: EffectType.ConditionalEffect,
                    condition: 'NOT_CREATURE' as any,
                    effects: [
                        {
                            type: EffectType.ApplyContinuousEffect,
                            duration: { type: DurationType.Permanent },
                            typesSet: ['Land', 'Creature'],
                            subtypesSet: ['Wizard'],
                            powerSet: 2,
                            toughnessSet: 4,
                            abilitiesToAdd: [
                                {
                                    type: AbilityType.Triggered,
                                    eventMatch: TriggerEvent.CastInstantOrSorcery,
                                    effects: [
                                        {
                                            type: EffectType.ApplyContinuousEffect,
                                            duration: { type: DurationType.UntilEndOfTurn },
                                            powerModifier: 1,
                                            targetMapping: TargetMapping.Self
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
