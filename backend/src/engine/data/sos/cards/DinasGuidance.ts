import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';
    export const DinasGuidance: CardDefinition = {
    name: "Dina's Guidance",
    manaCost: "{1}{B}{G}",
    colors: [
        "B",
        "G"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Search your library for a creature card, reveal it, put it into your hand or graveyard, then shuffle.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetDefinition: { type: TargetType.Creature, count: 1 },
                    reveal: true,
                    zone: CostType.Exile,
                    effects: [
                        {
                            type: CostType.Choice,
                            label: "Put card into hand or graveyard?",
                            choices: [
                                {
                                    label: "Into Hand",
                                    effects: [
                                        {
                                            type: EffectType.MoveToZone,
                                            zone: Zone.Hand,
                                            targetMapping: TargetMapping.Target1
                                        }
                                    ]
                                },
                                {
                                    label: "Into Graveyard",
                                    effects: [
                                        {
                                            type: EffectType.MoveToZone,
                                            zone: Zone.Graveyard,
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
    