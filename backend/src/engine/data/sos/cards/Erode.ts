import { AbilityType, CardDefinition, TargetMapping, EffectType, TargetType, Zone } from "@shared/engine_types";

export const Erode: CardDefinition = {
    name: "Erode",
    manaCost: "{W}",
    colors: ["W"],
    types: ["Instant"],
    oracleText: "Destroy target creature or planeswalker. Its controller may search their library for a basic land card, put it onto the battlefield tapped, then shuffle.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.CreatureOrPlaneswalker,
                count: 1,
            },
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.Target1,
                },
                {
                    type: EffectType.Choice,
                    label: 'Search for a basic land?',
                    targetMapping: TargetMapping.Target1Controller, // The player who makes the choice
                    choices: [
                        {
                            label: 'Search for a basic land (enters tapped)',
                            effects: [
                                {
                                    type: EffectType.SearchLibrary,
                                    restrictions: ['Basic', 'Land'],
                                    destination: Zone.Battlefield,
                                    targetMapping: TargetMapping.Target1Controller, // The player whose library is searched
                                    tapped: true,
                                    shuffle: true,
                                }
                            ]
                        }, {
                            label: 'Decline',
                            effects: []
                        }
                    ]
                }
            ]
        }
    ]
};


