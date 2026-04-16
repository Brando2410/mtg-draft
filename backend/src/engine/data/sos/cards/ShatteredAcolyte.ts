import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const ShatteredAcolyte: CardDefinition = {
    "name": "Shattered Acolyte",
    "manaCost": "{1}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Dwarf",
        "Warlock"
    ],
    "oracleText": "Lifelink\n{1}, Sacrifice this creature: Destroy target artifact or enchantment.",
    "keywords": [
        "Lifelink"
    ],
    "abilities": [
        {
            type: AbilityType.Activated,
            costs: [
                { type: 'Mana', value: '{1}' },
                { type: 'SacrificeSelf' }
            ],
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.Target1
                }
            ],
            targetDefinition: {
                maxTargets: 1,
                restrictions: [{ type: 'CARD_TYPE', value: 'Artifact' }, { type: 'CARD_TYPE', value: 'Enchantment' }]
            }
        }
    ],
    "power": "2",
    "toughness": "2"
};



