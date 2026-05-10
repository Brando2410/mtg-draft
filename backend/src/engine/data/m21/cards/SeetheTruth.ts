import { AbilityType, CardDefinition, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const SeetheTruth: CardDefinition = {
    name: "See the Truth",
    manaCost: "{1}{U}",

    oracleText: "Look at the top three cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order. If this spell was cast from anywhere other than your hand, instead put all three of those cards into your hand.",
    colors: ["U"],
    types: ["Sorcery"],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.LookAtTopAndPick,
                    fromTop: 3,
                    amount: 1,
                    zone: Zone.Hand,
                    remainderZone: Zone.Library,
                    remainderPosition: 'bottom',
                    condition: 'CAST_FROM_HAND',
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.MoveToZone,
                    fromTop: 3,
                    sourceZones: [Zone.Library],
                    zone: Zone.Hand,
                    condition: 'NOT_CAST_FROM_HAND',
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "91af15cc-fdd5-4d72-a53a-314fa5353527",
    image_url: "https://cards.scryfall.io/normal/front/9/1/91af15cc-fdd5-4d72-a53a-314fa5353527.jpg?1594735741",
    rarity: "rare"
};

