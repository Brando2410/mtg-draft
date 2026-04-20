import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const EmbracetheParadox: CardDefinition = {
    name: "Embrace the Paradox",
    manaCost: "{3}{G}{U}",
    scryfall_id: "c0cf5e0f-3668-46f2-850d-d91a538e8ead",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/c/0/c0cf5e0f-3668-46f2-850d-d91a538e8ead.jpg?1775938288",
    colors: [
        "G",
        "U"
    ],
    types: [
        "Instant"
    ],
    oracleText: "Draw three cards. You may put a land card from your hand onto the battlefield tapped.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 3
                },
                {
                    type: EffectType.Choice,
                    label: 'You may put a land card from hand onto battlefield tapped',
                    choices: [
                        {
                            label: 'Yes',
                            targetDefinition: {
                                type: TargetType.Card,
                                zone: Zone.Hand,
                                count: 1,
                                minCount: 0,
                                optional: true,
                                restrictions: [Restriction.Land]
                            },
                            effects: [
                                {
                                    type: EffectType.PutOnBattlefield,
                                    targetMapping: TargetMapping.Target1,
                                    tapped: true
                                }
                            ]
                        },
                        { label: 'Decline', effects: [] }
                    ]
                }
            ]
        }
    ]
};
