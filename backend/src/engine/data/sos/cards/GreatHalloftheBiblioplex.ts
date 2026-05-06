import { AbilityType, CardDefinition, ConditionType, CostType, DurationType, EffectType, Restriction, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const GreatHalloftheBiblioplex: CardDefinition = {
    name: "Great Hall of the Biblioplex",
    manaCost: "",
    scryfall_id: "42d92674-2664-411c-b9c5-b04da7c845f4",
    rarity: "rare",
    image_url: "https://cards.scryfall.io/normal/front/4/2/42d92674-2664-411c-b9c5-b04da7c845f4.jpg?1775938794",
    colors: [],
    types: ["Land"],
    subtypes: [],
    keywords: [],
    oracleText: "{T}: Add {C}.\n{T}, Pay 1 life: Add one mana of any color. Spend this mana only to cast an instant or sorcery spell.\n{5}: If this land isn't a creature, it becomes a 2/4 Wizard creature with \"Whenever you cast an instant or sorcery spell, this creature gets +1/+0 until end of turn.\" It's still a land.",
    abilities: [
        {
            type: AbilityType.Activated,
            id: "{T}: Add {C}.",
            isManaAbility: true,
            costs: [{ type: CostType.Tap }],
            effects: [{ type: EffectType.AddMana, manaType: 'C' }]
        },
        {
            type: AbilityType.Activated,
            id: "{T}, Pay 1 life: Add one mana of any color. Spend this mana only to cast an instant or sorcery spell.",
            isManaAbility: true,
            costs: [{ type: CostType.Tap }, { type: CostType.PayLife, value: '1' }],
            effects: [{
                type: EffectType.AddMana,
                manaType: 'ANY',
                manaRestrictions: [Restriction.InstantOrSorcery]
            }]
        },
        {
            type: AbilityType.Activated,
            id: "{5}: If this land isn't a creature, it becomes a 2/4 Wizard creature with \"Whenever you cast an instant or sorcery spell, this creature gets +1/+0 until end of turn.\" It's still a land.",
            costs: [{ type: CostType.Mana, value: '{5}' }],
            effects: [
                {
                    type: EffectType.ConditionalEffect,
                    condition: ConditionType.NotCreature,
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

