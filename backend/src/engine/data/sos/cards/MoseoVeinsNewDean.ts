import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent, Zone, TargetType, DurationType } from '@shared/engine_types';

export const MoseoVeinsNewDean: CardDefinition = {
    "name": "Moseo, Vein's New Dean",
    "manaCost": "{2}{B}",
    "colors": ["B"],
    "types": ["Legendary", "Creature"],
    "subtypes": ["Bird", "Skeleton", "Warlock"],
    "oracleText": "Flying\nWhen Moseo enters, create a 1/1 black and green Pest creature token with \"Whenever this token attacks, you gain 1 life.\"\nInfusion — At the beginning of your end step, if you gained life this turn, return up to one target creature card with mana value X or less from your graveyard to the battlefield, where X is the amount of life you gained this turn.",
    "keywords": ["Flying"],
    "abilities": [
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
            condition: 'GAINED_LIFE_THIS_TURN',
            triggerCondition: 'PLAYER_IS_CONTROLLER', // Only in your end step
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                count: 1,
                optional: true,
                restrictions: [
                    'Creature', 
                    { type: 'ManaValueLe', value: 'GAINED_LIFE_AMOUNT' }
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
    "power": "2",
    "toughness": "1"
};
