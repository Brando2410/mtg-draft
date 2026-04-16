import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const GroupProject: CardDefinition = {
    "name": "Group Project",
    "manaCost": "{1}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "Create a 2/2 red and white Spirit creature token.\nFlashback—Tap three untapped creatures you control. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    "keywords": ["Flashback"],
    "flashbackCost": "{0}",
    "abilities": [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.CreateToken,
                    amount: 1,
                    tokenBlueprint: {
                        name: "Spirit",
                        colors: ["R", "W"],
                        types: ["Creature"],
                        subtypes: ["Spirit"],
                        power: "2",
                        toughness: "2",
                        image_url: 'https://cards.scryfall.io/png/front/f/9/f98c0167-7434-4607-87c4-315fa8b6972e.png?1682693862'
                    },
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Static,
            activeZone: Zone.Graveyard,
            effects: [
                {
                    type: 'AdditionalCost',
                    condition: 'IS_FLASHBACK_CAST',
                    targetMapping: 'SELF',
                    additionalCosts: [{ type: 'TapSelection', value: 3, restrictions: ['Creature', 'Untapped'] }]
                }
            ]
        }
    ]
};



