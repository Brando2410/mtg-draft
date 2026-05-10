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
                { type: CostType.Exile, amount: 1, sourceZones: [Zone.Graveyard], restrictions: [Restriction.Card] }
            ],
            effects: [
                { type: EffectType.AddMana, manaType: 'R' },
                { type: EffectType.DealDamage, amount: 1, targetMapping: TargetMapping.EachOpponent }
            ]
        }
    ],
    power: "1",
    toughness: "4",
    scryfall_id: "afe61957-a9bb-42b0-98e8-b5fa418cbaff",
    image_url: "https://cards.scryfall.io/normal/front/a/f/afe61957-a9bb-42b0-98e8-b5fa418cbaff.jpg?1775937860",
    rarity: "common"
};

