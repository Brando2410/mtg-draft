import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';
    export const Erode: CardDefinition = {
    name: "Erode",
    manaCost: "{W}",
    colors: ["W"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
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
                    type: CostType.Choice,
                    label: 'Search for a basic land?',
                    targetMapping: TargetMapping.Target1Controller, // The player who makes the choice
                    choices: [
                        {
                            label: 'Search for a basic land (enters tapped)',
                            effects: [
                                {
                                    type: EffectType.SearchLibrary,
                                    targetDefinition: {
                                        type: TargetType.Land,
                                        count: 1,
                                        restrictions: [
                { type: 'Type', value: 'Basic' }
            ]
                                    },
                                    zone: Zone.Battlefield,
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
    