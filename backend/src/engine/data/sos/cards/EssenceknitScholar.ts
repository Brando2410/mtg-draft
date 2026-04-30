import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const EssenceknitScholar: CardDefinition = {
    name: "Essenceknit Scholar",
    manaCost: "{B}{B/G}{G}",
    scryfall_id: "2a3cba55-3fae-4d45-ae03-4d662ec13718",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/2/a/2a3cba55-3fae-4d45-ae03-4d662ec13718.jpg?1775938295",
    colors: ["B", "G"],
    types: ["Creature"],
    subtypes: ["Dryad", "Warlock"],
    keywords: [],
    power: "3",
    toughness: "1",
    oracleText: "When this creature enters, create a 1/1 black and green Pest creature token with \"Whenever this token attacks, you gain 1 life.\"\nAt the beginning of your end step, if a creature died under your control this turn, draw a card.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Pest',
                        colors: ['B', 'G'],
                        types: ['Creature'],
                        subtypes: ['Pest'],
                        power: 1,
                        toughness: 1,
                        oracleText: "Whenever this token attacks, you gain 1 life.",
                        image_url: 'https://cards.scryfall.io/normal/front/4/0/40b22872-7b7b-4a6d-a343-4152e552b00a.jpg?1775828415',
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
            condition: `${ConditionType.PlayerIsController} && ${ConditionType.CreatureDiedUnderYourControlThisTurn}`,
            effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }]
        }
    ]
};
