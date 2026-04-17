import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';
export const AjanisResponse: CardDefinition = {
    name: "Ajani's Response",
    manaCost: "{4}{W}",
    scryfall_id: "9cd1417a-badc-4abd-a8ca-5b31f85c1072",
    image_url: "https://cards.scryfall.io/normal/front/9/c/9cd1417a-badc-4abd-a8ca-5b31f85c1072.jpg?1776047920",
    colors: [
        "W"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "This spell costs {3} less to cast if it targets a tapped creature.\nDestroy target creature.",
    abilities: [
        {
            type: AbilityType.Static,
            activeZone: Zone.Hand,
            effects: [
                {
                    type: EffectType.CostReduction,
                    amount: 3,
                    targetMapping: TargetMapping.Self,
                    condition: ConditionType.TargetsTappedCreature
                }
            ]
        },
        {
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.Creature },
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
