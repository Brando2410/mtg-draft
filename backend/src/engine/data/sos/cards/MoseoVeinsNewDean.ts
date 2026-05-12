import { AbilityType, CardDefinition, ConditionType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const MoseoVeinsNewDean: CardDefinition = {
    name: "Moseo, Vein's New Dean",
    manaCost: "{2}{B}",
    colors: ["B"],
    types: ["Legendary", "Creature"],
    subtypes: ["Bird", "Skeleton", "Warlock"],
    keywords: ["Flying"],
    oracleText: "Flying\nWhen Moseo enters, create a 1/1 black and green Pest creature token with \"Whenever this token attacks, you gain 1 life.\"\nInfusion — At the beginning of your end step, if you gained life this turn, return up to one target creature card with mana value X or less from your graveyard to the battlefield, where X is the amount of life you gained this turn.",
    power: "2",
    toughness: "1",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.CreateToken,
                    amount: 1,
                    targetMapping: TargetMapping.Controller,
                    tokenBlueprint: {
                        name: 'Pest',
                        colors: ['B', 'G'],
                        types: ['Creature'],
                        subtypes: ['Pest'],
                        power: "1",
                        toughness: "1",
                        oracleText: "Whenever this token attacks, you gain 1 life.",
                        image_url: "https://cards.scryfall.io/normal/front/b/a/ba854032-6ad2-4654-990a-64006e7f92fd.jpg?1777982237",
                        abilities: [
                            {
                                type: AbilityType.Triggered,
                                eventMatch: TriggerEvent.Attack,
                                condition: ConditionType.SelfAttacks,
                                effects: [{
                                    type: EffectType.GainLife,
                                    amount: 1,
                                    targetMapping: TargetMapping.Controller
                                }]
                            }
                        ]
                    }
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EndStep,
            condition: `${ConditionType.IsYourTurn} && ${ConditionType.Infusion}`,

            effects: [
                {
                    type: EffectType.Choice,
                    selectionPool: TargetMapping.ControllerGraveyard,
                    targetDefinitions: [{
                        type: TargetType.CardInGraveyard,
                        count: 1,
                        minCount: 0,
                        restrictions: [
                            Restriction.Creature,
                            Restriction.ManaValueLeLifeGained,
                            Restriction.YouOwn
                        ]
                    }],
                    effects: [
                        {
                            type: EffectType.PutOnBattlefield,
                            zone: Zone.Battlefield,
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "6877180c-22a1-4c4d-9178-316f4c34661b",
    image_url: "https://cards.scryfall.io/normal/front/6/8/6877180c-22a1-4c4d-9178-316f4c34661b.jpg?1775937545",
    rarity: "rare"
};

