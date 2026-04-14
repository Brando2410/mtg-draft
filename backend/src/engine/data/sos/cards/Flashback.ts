import { CardDefinition, Zone } from '@shared/engine_types';

export const Flashback: CardDefinition = {
    "name": "Flashback",
    "manaCost": "{R}",
    "colors": [
        "R"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Target instant or sorcery card in your graveyard gains flashback until end of turn. The flashback cost is equal to its mana cost. (You may cast that card from your graveyard for its flashback cost. Then exile it.)",
    "abilities": [
        {
            type: 'Spell',
            targetDefinition: {
                type: 'CardInGraveyard',
                count: 1,
                restrictions: ['InstantOrSorcery']
            },
            effects: [
                {
                    type: 'ApplyContinuousEffect',
                    targetMapping: 'TARGET_1',
                    duration: 'UNTIL_END_OF_TURN',
                    abilitiesToAdd: ['Flashback'],
                    flashbackCostOverride: 'SOURCE_MANA_COST'
                }
            ]
        }
    ]
};
