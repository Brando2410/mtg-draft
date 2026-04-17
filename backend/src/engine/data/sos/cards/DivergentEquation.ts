import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';
export const DivergentEquation: CardDefinition = {
    name: "Divergent Equation",
    manaCost: "{X}{X}{U}",
    scryfall_id: "26295e25-f1bf-4665-ba00-dad35c49bbc2",
    image_url: "https://cards.scryfall.io/normal/front/2/6/26295e25-f1bf-4665-ba00-dad35c49bbc2.jpg?1775937210",
    colors: [
        "U"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Return up to X target instant and/or sorcery cards from your graveyard to your hand.\nExile Divergent Equation.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                minCount: 0,
                count: 'X' as any,
                restrictions: [
                    "InstantOrSorcery",
                    "youcontrol"
                ]
            },
            effects: [
                { type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.TargetAll },
                { type: CostType.Exile, targetMapping: TargetMapping.Self }
            ]
        }
    ]
};
