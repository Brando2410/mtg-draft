import { AbilityType, CardDefinition, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const SilverquilltheDisputant: CardDefinition = {
    "name": "Silverquill, the Disputant",
    "manaCost": "{2}{W}{B}",
    "colors": [
        "B",
        "W"
    ],
    "types": [
        "Legendary",
        "Creature"
    ],
    "subtypes": [
        "Elder",
        "Dragon"
    ],
    "keywords": [
        "Flying",
        "Vigilance"
    ],
    "oracleText": "Flying, vigilance\nEach instant and sorcery spell you cast has casualty 1. (As you cast that spell, you may sacrifice a creature with power 1 or greater. When you do, copy the spell and you may choose new targets for the copy.)",
    "abilities": [
        {
            type: AbilityType.Static,
            activeZone: Zone.Battlefield,
            effects: [
                {
                    type: EffectType.AdditionalCost,
                    targetMapping: TargetMapping.Controller,
                    restrictions: ['InstantOrSorcery'],
                    additionalCosts: [
                        {
                            type: 'Sacrifice',
                            restrictions: ['power>=1'],
                            isCasualty: true,
                            optional: true,
                            label: 'Casualty 1'
                        }
                    ]
                }
            ]
        }
    ],
    "power": "4",
    "toughness": "4"
};



