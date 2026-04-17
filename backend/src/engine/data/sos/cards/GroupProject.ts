import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';
export const GroupProject: CardDefinition = {
    name: "Group Project",
    manaCost: "{1}{W}",
    scryfall_id: "e8abc1eb-6225-4b18-8502-b5324b818aed",
    image_url: "https://cards.scryfall.io/normal/front/e/8/e8abc1eb-6225-4b18-8502-b5324b818aed.jpg?1775937026",
    colors: [
        "W"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: ["Flashback"],
    oracleText: "Create a 2/2 red and white Spirit creature token.\nFlashbackâ€”Tap three untapped creatures you control. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    flashbackCost: "{0}",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.CreateToken,
                    amount: 1,
                    tokenBlueprint: {
                        name: "Spirit",
                        colors: ["R", "W"],
                        types: ["Creature"],
                        subtypes: ["Spirit"],
                        power: "2",
                        toughness: "2",
                    },
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Static,
            activeZone: Zone.Graveyard,
            effects: [
                {
                    type: EffectType.AdditionalCost,
                    condition: 'IS_FLASHBACK_CAST',
                    targetMapping: TargetMapping.Self,
                    additionalCosts: [{
                        type: CostType.TapSelection, value: 3, restrictions: [
                            "Creature",
                            "untapped"
                        ]
                    }]
                }
            ]
        }
    ]
};
