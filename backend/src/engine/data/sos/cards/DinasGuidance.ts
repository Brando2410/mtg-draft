import { CardDefinition, AbilityType, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const DinasGuidance: CardDefinition = {
    "name": "Dina's Guidance",
    "manaCost": "{1}{B}{G}",
    "colors": [
        "B",
        "G"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Search your library for a creature card, reveal it, put it into your hand or graveyard, then shuffle.",
    "abilities": [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetDefinition: { type: 'Card', count: 1, restrictions: ['Creature'] },
                    reveal: true,
                    destination: Zone.Hand, // Put in hand first by default (revealed)
                    effects: [
                        {
                            type: EffectType.Choice,
                            label: "Move to graveyard?",
                            choices: [
                                { label: "Keep in Hand", effects: [] },
                                { 
                                    label: "Put in Graveyard", 
                                    effects: [
                                        { 
                                            type: EffectType.MoveToZone, 
                                            destination: Zone.Graveyard, 
                                            targetMapping: TargetMapping.Target1 // Target1 here refers to the card being processed by the search sub-effects
                                        }
                                    ] 
                                }
                            ]
                        }
                    ],
                    shuffle: true
                }
            ]
        }
    ]
};
