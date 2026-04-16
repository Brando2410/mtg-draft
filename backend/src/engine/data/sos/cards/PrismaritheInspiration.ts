import { AbilityType, CardDefinition, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const PrismaritheInspiration: CardDefinition = {
    "name": "Prismari, the Inspiration",
    "manaCost": "{5}{U}{R}",
    "colors": [
        "R",
        "U"
    ],
    "types": [
        "Legendary",
        "Creature"
    ],
    "subtypes": [
        "Elder",
        "Dragon"
    ],
    "keywords": ["Flying", "Ward—Pay 5 life"],
    "oracleText": "Flying\nWard—Pay 5 life.\nInstant and sorcery spells you cast have storm. (Whenever you cast an instant or sorcery spell, copy it for each spell cast before it this turn. You may choose new targets for the copies.)",
    "abilities": [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 6,
                    targetMapping: 'MATCHING_CARDS',
                    activeZones: [Zone.Stack],
                    restrictions: ['Instant or Sorcery', 'youcontrol'],
                    keywordsToAdd: ['Storm']
                }
            ]
        }
    ],
    "power": "7",
    "toughness": "7"
};



