import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetMapping, Zone, SelectionType } from '@shared/engine_types';

export const RubbleRouser: CardDefinition = {
    "name": "Rubble Rouser",
    "manaCost": "{2}{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Dwarf",
        "Sorcerer"
    ],
    "oracleText": "When this creature enters, you may discard a card. If you do, draw a card.\n{T}, Exile a card from your graveyard: Add {R}. When you do, this creature deals 1 damage to each opponent.",
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.Choice,
                    optional: true,
                    label: 'Discard a card to draw a card?',
                    choices: [
                        {
                            label: 'Discard and draw',
                            effects: [
                                { type: EffectType.DiscardCards, amount: 1, targetMapping: TargetMapping.Controller },
                                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: 'Tap' },
                { type: 'Exile', value: 1, sourceZone: Zone.Graveyard, restrictions: ['Any'] }
            ],
            effects: [
                { type: EffectType.AddMana, value: '{R}' },
                { type: EffectType.DealDamage, amount: 1, targetMapping: TargetMapping.EachOpponent }
            ]
        }
    ],
    "power": "1",
    "toughness": "4"
};



