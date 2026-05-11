import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const Erode: CardDefinition = {
    name: "Erode",
    manaCost: "{W}",
    colors: ["W"],
    types: ["Instant"],
    oracleText: "Destroy target creature or planeswalker. Its controller may search their library for a basic land card, put it onto the battlefield tapped, then shuffle.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.CreatureOrPlaneswalker,
                count: 1
            }],
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.Choice,
                    label: 'Search for a basic land and put it onto the battlefield tapped?',
                    targetMapping: TargetMapping.Target1Controller,
                    choices: [
                        {
                            label: 'Yes',
                            effects: [
                                {
                                    type: EffectType.SearchLibrary,
                                    targetDefinitions: [{
                                        type: TargetType.Land,
                                        count: 1,
                                        minCount: 0,
                                        optional: true,
                                        restrictions: [Restriction.Basic]
                                    }],
                                    zone: Zone.Battlefield,
                                    targetMapping: TargetMapping.Target1Controller,
                                    tapped: true,
                                    shuffle: true
                                }
                            ]
                        },
                        {
                            label: 'No',
                            effects: []
                        }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "32e670da-7563-4f6a-a7db-4c126a440eb8",
    image_url: "https://cards.scryfall.io/normal/front/3/2/32e670da-7563-4f6a-a7db-4c126a440eb8.jpg?1775937013",
    rarity: "rare"
};

