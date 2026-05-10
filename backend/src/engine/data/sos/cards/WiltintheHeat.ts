import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const WiltintheHeat: CardDefinition = {
    name: "Wilt in the Heat",
    manaCost: "{2}{R}{W}",
    colors: [
        "R",
        "W"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "This spell costs {2} less to cast if one or more cards left your graveyard this turn.\nWilt in the Heat deals 5 damage to target creature. If that creature would die this turn, exile it instead.",
    abilities: [
        {
            type: AbilityType.Spell,
            costReduction: {
                type: EffectType.CostReduction,
                reductionAmount: '{2}',
                condition: ConditionType.CardsLeftYourGraveyardThisTurn
            },
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1
            }],
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 5,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    exileOnMoveToGraveyard: true,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    scryfall_id: "f63f7209-fc0f-400c-8076-125f3131cb32",
    image_url: "https://cards.scryfall.io/normal/front/f/6/f63f7209-fc0f-400c-8076-125f3131cb32.jpg?1775938697",
    rarity: "common"
};

