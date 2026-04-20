import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';
export const WisdomofAges: CardDefinition = {
    name: "Wisdom of Ages",
    manaCost: "{4}{U}{U}{U}",
    colors: [
        "U"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Return all instant and sorcery cards from your graveyard to your hand. You have no maximum hand size for the rest of the game.\nExile Wisdom of Ages.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.MoveToZone,
                    label: "Return all instant and sorcery cards from your graveyard to your hand",
                    zone: Zone.Hand,
                    targetDefinition: {
                        type: TargetType.CardInGraveyard,
                        restrictions: [
                            Restriction.InstantOrSorcery
                        ]
                    },
                    targetMapping: TargetMapping.AllMatchingCards
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.Permanent },
                    playerModifier: { maxHandSize: 999 },
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.Exile,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ]
};
