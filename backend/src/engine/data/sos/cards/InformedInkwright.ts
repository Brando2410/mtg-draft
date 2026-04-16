import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const InformedInkwright: CardDefinition = {
    "name": "Informed Inkwright",
    "manaCost": "{1}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Human",
        "Wizard"
    ],
    "oracleText": "Vigilance\nRepartee — Whenever you cast an instant or sorcery spell that targets a creature, create a 1/1 white and black Inkling creature token with flying.",
    "keywords": ["Vigilance"],
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastSpell,
            condition: 'REPARTEE_TRIGGER',
            effects: [
                {
                    type: EffectType.CreateToken,
                    amount: 1,
                    tokenBlueprint: {
                        name: "Inkling",
                        colors: ["W", "B"],
                        types: ["Creature"],
                        subtypes: ["Inkling"],
                        power: "1",
                        toughness: "1",
                        keywords: ["Flying"],
                        image_url: "https://cards.scryfall.io/png/front/c/9/c9deae5c-80d4-4701-b425-91853b7ee03b.png?1682693898"
                    },
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    "power": "2",
    "toughness": "2"
};





