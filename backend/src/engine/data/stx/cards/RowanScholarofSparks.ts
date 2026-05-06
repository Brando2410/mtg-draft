import { AbilityType, CardDefinition, CostType, DurationType, DynamicAmount, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const RowanScholarofSparks: CardDefinition = {
    name: "Rowan, Scholar of Sparks",
    manaCost: "{2}{R}",
    colors: ["R"],
    supertypes: ["Legendary"],
    types: ["Planeswalker"],
    subtypes: ["Rowan"],
    loyalty: "2",
    oracleText: "Instant and sorcery spells you cast cost {1} less to cast.\n[+1]: Rowan, Scholar of Sparks deals 1 damage to each opponent. If you've drawn three or more cards this turn, she deals 3 damage to each opponent instead.\n[-4]: You get an emblem with \"Whenever you cast an instant or sorcery spell, you may pay {2}. If you do, copy that spell. You may choose new targets for the copy.\"",
    faces: [
        {
            name: "Rowan, Scholar of Sparks",
            manaCost: "{2}{R}",
            colors: ["R"],
            supertypes: ["Legendary"],
            types: ["Planeswalker"],
            subtypes: ["Rowan"],
            loyalty: "2",
            oracleText: "Instant and sorcery spells you cast cost {1} less to cast.\n[+1]: Rowan, Scholar of Sparks deals 1 damage to each opponent. If you've drawn three or more cards this turn, she deals 3 damage to each opponent instead.\n[-4]: You get an emblem with \"Whenever you cast an instant or sorcery spell, you may pay {2}. If you do, copy that spell. You may choose new targets for the copy.\"",
            abilities: [
                {
                    type: AbilityType.Static,
                    effects: [{ type: EffectType.CostReduction, reductionAmount: '{1}', restrictions: [Restriction.InstantOrSorcery] }]
                },
                {
                    type: AbilityType.Activated,
                    id: "Deals 1 damage to each opponent. If you've drawn three or more cards this turn, she deals 3 damage to each opponent instead.",
                    costs: [{ type: CostType.Loyalty, value: '+1' }],
                    effects: [{
                        type: EffectType.DealDamage,
                        amount: DynamicAmount.DrawnThreeCheck,
                        targetMapping: TargetMapping.EachOpponent
                    }]
                },
                {
                    type: AbilityType.Activated,
                    id: "You get an emblem with \"Whenever you cast an instant or sorcery spell, you may pay {2}. If you do, copy that spell. You may choose new targets for the copy.\"",
                    costs: [{ type: CostType.Loyalty, value: '-4' }],
                    effects: [{
                        type: EffectType.CreateEmblem,
                        emblemBlueprint: {
                            name: "Rowan's Emblem",
                            abilities: [{
                                type: AbilityType.Triggered,
                                eventMatch: TriggerEvent.CastInstantOrSorcery,
                                effects: [{
                                    type: EffectType.Choice,
                                    label: "Pay {2} to copy spell?",
                                    optional: true,
                                    choices: [{
                                        label: "Pay {2}",
                                        costs: [{ type: CostType.Mana, value: '{2}' }],
                                        effects: [{
                                            type: EffectType.CopySpellOnStack,
                                            targetMapping: TargetMapping.TriggerEventSource,
                                            chooseNewTargets: true,
                                            isCopyTargeting: true
                                        }]
                                    }]
                                }]
                            }]
                        }
                    }]
                }
            ]
        },
        {
            name: "Will, Scholar of Frost",
            manaCost: "{4}{U}",
            colors: ["U"],
            supertypes: ["Legendary"],
            types: ["Planeswalker"],
            subtypes: ["Will"],
            loyalty: "4",
            oracleText: "Instant and sorcery spells you cast cost {1} less to cast.\n[+1]: Up to one target creature has base power and toughness 0/2 and loses all abilities until your next turn.\n[-3]: Draw two cards.\n[-7]: Exile up to five target instant or sorcery cards from any graveyard. You may cast them without paying their mana costs.",
            abilities: [
                {
                    type: AbilityType.Static,
                    effects: [{ type: EffectType.CostReduction, reductionAmount: '{1}', restrictions: [Restriction.InstantOrSorcery] }]
                },
                {
                    type: AbilityType.Activated,
                    id: "Up to one target creature has base power and toughness 0/2 and loses all abilities until your next turn.",
                    costs: [{ type: CostType.Loyalty, value: '+1' }],
                    targetDefinitions: [{ count: 1, type: TargetType.Creature, optional: true }],
                    effects: [{
                        type: EffectType.ApplyContinuousEffect,
                        duration: { type: DurationType.UntilEndOfTurn },
                        powerSet: 0,
                        toughnessSet: 2,
                        abilitiesToAdd: [],
                        removeAllAbilities: true,
                        layer: 6,
                        targetMapping: TargetMapping.Target1
                    }]
                },
                {
                    type: AbilityType.Activated,
                    id: "Draw two cards.",
                    costs: [{ type: CostType.Loyalty, value: '-3' }],
                    effects: [{ type: EffectType.DrawCards, amount: 2 }]
                },
                {
                    type: AbilityType.Activated,
                    id: "Exile up to five target instant or sorcery cards from any graveyard. You may cast them without paying their mana costs.",
                    costs: [{ type: CostType.Loyalty, value: '-7' }],
                    targetDefinitions: [{
                        count: 5,
                        minCount: 0,
                        optional: true,
                        type: TargetType.CardInGraveyard,
                        restrictions: [Restriction.InstantOrSorcery]
                    }],
                    effects: [
                        { type: EffectType.Exile, targetMapping: TargetMapping.TargetAll },
                        {
                            type: EffectType.CastSpell,
                            targetMapping: TargetMapping.TargetAll,
                            isFreeCast: true
                        }
                    ]
                }
            ]
        }
    ]
};
