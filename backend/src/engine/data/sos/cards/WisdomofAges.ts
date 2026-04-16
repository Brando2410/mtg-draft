import { CardDefinition, AbilityType, EffectType, TargetMapping, Zone, DurationType } from '@shared/engine_types';

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
    oracleText: "Return all instant and sorcery cards from your graveyard to your hand. You have no maximum hand size for the rest of the game.\nExile Wisdom of Ages.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Hand,
                    sourceZones: [Zone.Graveyard],
                    restrictions: ['Instant_OR_Sorcery'],
                    targetMapping: TargetMapping.TargetAll
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: DurationType.Permanent,
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


