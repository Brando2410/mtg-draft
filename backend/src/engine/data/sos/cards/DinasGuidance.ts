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
                    destination: Zone.Library, 
                    libraryPosition: 'top',
                    effects: [
                        {
                            type: EffectType.Choice,
                            label: "Put card into hand or graveyard?",
                            choices: [
                                { 
                                    label: "Into Hand", 
                                    effects: [
                                        { 
                                            type: EffectType.MoveToZone, 
                                            destination: Zone.Hand, 
                                            targetMapping: TargetMapping.Target1 
                                        }
                                    ] 
                                },
                                { 
                                    label: "Into Graveyard", 
                                    effects: [
                                        { 
                                            type: EffectType.MoveToZone, 
                                            destination: Zone.Graveyard, 
                                            targetMapping: TargetMapping.Target1 
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


