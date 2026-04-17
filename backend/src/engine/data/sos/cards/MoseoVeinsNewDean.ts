import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';
export const MoseoVeinsNewDean: CardDefinition = {
    name: "Moseo, Vein's New Dean",
    manaCost: "{2}{B}",
    scryfall_id: "6877180c-22a1-4c4d-9178-316f4c34661b",
    image_url: "https://cards.scryfall.io/normal/front/6/8/6877180c-22a1-4c4d-9178-316f4c34661b.jpg?1775937545",
    colors: ["B"],
    types: ["Legendary", "Creature"],
    subtypes: ["Bird", "Skeleton", "Warlock"],
    keywords: ["Flying"],
    oracleText: "Flying\nWhen Moseo enters, create a 1/1 black and green Pest creature token with \"Whenever this token attacks, you gain 1 life.\"\nInfusion — At the beginning of your end step, if you gained life this turn, return up to one target creature card with mana value X or less from your graveyard to the battlefield, where X is the amount of life you gained this turn.",
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
                        colors: ['B', 'G'],
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
            condition: `${ConditionType.Infusion} && ${ConditionType.IsYourTurn}`,
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                count: 1,
                minCount: 0,
                optional: true,
                restrictions: [
                    "Creature",
                    {
                        type: 'ManaValueLe',
                        value: 'GAINED_LIFE_AMOUNT'
                    }
                ]
            },
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Battlefield,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    power: "2",
    toughness: "1"
};
