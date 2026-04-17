import { AbilityType, CardDefinition, ConditionType, CostType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
export const CauldronofEssence: CardDefinition = {
    name: "Cauldron of Essence",
    manaCost: "{1}{B}{G}",
    colors: [
        "B",
        "G"
    ],
    types: [
        "Artifact"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Whenever a creature you control dies, each opponent loses 1 life and you gain 1 life.\n{1}{B}{G}, {T}, Sacrifice a creature: Return target creature card from your graveyard to the battlefield. Activate only as a sorcery.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.DeathOther,
            condition: ConditionType.OwnCreatureDies,
            effects: [
                { type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.EachOpponent },
                { type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{1}{B}{G}' },
                { type: CostType.Tap },
                {
                    type: CostType.Sacrifice, restrictions: [
                        "Creature"
                    ]
                }
            ],
            targetDefinition: {
                type: TargetType.CardInGraveyard, count: 1, restrictions: [
                    "Creature",
                    "youcontrol"
                ]
            },
            activatedOnlyAsSorcery: true,
            effects: [
                { type: EffectType.PutOnBattlefield, targetMapping: TargetMapping.Target1 }
            ]
        }
    ]
};
