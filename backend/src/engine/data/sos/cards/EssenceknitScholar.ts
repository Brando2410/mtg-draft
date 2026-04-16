import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const EssenceknitScholar: CardDefinition = {
    name: "Essenceknit Scholar",
    manaCost: "{B}{B/G}{G}",
    colors: [
        "B",
        "G"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Dryad",
        "Warlock"
    ],
    keywords: [],
    oracleText: "When this creature enters, create a 1/1 black and green Pest creature token with \"Whenever this token attacks, you gain 1 life.\"\nAt the beginning of your end step, if a creature died under your control this turn, draw a card.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.CreateToken,
                    amount: 1,
                    tokenBlueprint: {
                        name: 'Pest',
                        colors: ['black', 'green'],
                        types: ['Creature'],
                        subtypes: ['Pest'],
                        power: 1,
                        toughness: 1,
                        oracleText: "Whenever this token attacks, you gain 1 life.",
                        image_url: 'https://cards.scryfall.io/png/front/d/0/d0ddbe3e-4a66-494d-9304-7471232549bf.png?1682693901',
                        abilities: [
                            {
                                type: AbilityType.Triggered,
                                eventMatch: TriggerEvent.Attack,
                                effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }]
                            }
                        ]
                    }
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EndStep,
            condition: 'PLAYER_IS_CONTROLLER && CREATURE_DIED_UNDER_YOUR_CONTROL_THIS_TURN',
            effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }]
        }
    ],
    power: "3",
    toughness: "1"
};
    