import { CardDefinition, AbilityType, Zone } from '@shared/engine_types';

export const SoaringStoneglider: CardDefinition = {
    "name": "Soaring Stoneglider",
    "manaCost": "{2}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Elephant",
        "Cleric"
    ],
    "oracleText": "As an additional cost to cast this spell, exile two cards from your graveyard or pay {1}{W}.\nFlying, vigilance",
    "keywords": [
        "Flying",
        "Vigilance"
    ],
    "abilities": [
        {
            type: AbilityType.Spell,
            costs: [
                {
                    type: 'Choice',
                    label: 'Choose an additional cost',
                    choices: [
                        {
                            label: 'Exile 2 cards from your graveyard',
                            costs: [{ type: 'Exile', amount: 2, sourceZones: [Zone.Graveyard] }]
                        },
                        {
                            label: 'Pay {1}{W}',
                            costs: [{ type: 'Mana', value: '{1}{W}' }]
                        }
                    ]
                }
            ]
        }
    ],
    "power": "4",
    "toughness": "3"
};


