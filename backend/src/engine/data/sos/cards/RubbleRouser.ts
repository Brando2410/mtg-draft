import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';
export const RubbleRouser: CardDefinition = {
    name: "Rubble Rouser",
    manaCost: "{2}{R}",
    colors: [
        "R"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Dwarf",
        "Sorcerer"
    ],
    keywords: [],
    oracleText: "When this creature enters, you may discard a card. If you do, draw a card.\n{T}, Exile a card from your graveyard: Add {R}. When you do, this creature deals 1 damage to each opponent.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: CostType.Choice,
                    label: 'Discard a card to draw a card?',
                    choices: [
                        {
                            label: 'Discard 1 then draw 1',
                            effects: [
                                { type: EffectType.DiscardCards, amount: 1, targetMapping: TargetMapping.Controller },
                                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }
                            ]
                        },
                        {
                            label: 'Decline',
                            effects: []
                        }
                    ]
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Tap },
                { type: CostType.Exile, value: 1, sourceZone: Zone.Graveyard, restrictions: [Restriction.Card] }
            ],
            effects: [
                { type: EffectType.AddMana, manaType: 'R' },
                { type: EffectType.DealDamage, amount: 1, targetMapping: TargetMapping.EachOpponent }
            ]
        }
    ],
    power: "1",
    toughness: "4"
};

