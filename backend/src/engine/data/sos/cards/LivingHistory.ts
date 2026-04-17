import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
    export const LivingHistory: CardDefinition = {
    name: "Living History",
    manaCost: "{1}{R}",
    colors: [
        "R"
    ],
    types: [
        "Enchantment"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "When this enchantment enters, create a 2/2 red and white Spirit creature token.\nWhenever you attack, if a card left your graveyard this turn, target attacking creature gets +2/+0 until end of turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: "Spirit",
                        colors: ["R", "W"],
                        types: ["Creature"],
                        subtypes: ["Spirit"],
                        power: 2,
                        toughness: 2,
                        image_url: "https://cards.scryfall.io/png/front/f/9/f98c0167-7434-4607-87c4-315fa8b6972e.png?1682693862"
                    },
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.AttackersDeclared,
            condition: ConditionType.CardsLeftYourGraveyardThisTurn,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
                restrictions: [
                { type: 'State', value: 'Attacking' }
            ]
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 2,
                    toughnessModifier: 0,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
    