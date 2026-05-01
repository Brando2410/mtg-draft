import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const AppliedGeometry: CardDefinition = {
    name: "Applied Geometry",
    manaCost: "{2}{G}{U}",
    scryfall_id: "f109f2eb-895b-44a6-b6b5-81bf3831ccd5",
    rarity: "rare",
    image_url: "https://cards.scryfall.io/normal/front/f/1/f109f2eb-895b-44a6-b6b5-81bf3831ccd5.jpg?1775938180",
    colors: ["G", "U"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Create a token that's a copy of target non-Aura permanent you control, except it's a 0/0 Fractal creature in addition to its other types. Put six +1/+1 counters on it.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Permanent,
                restrictions: [Restriction.YouControl, Restriction.NotAura]
            },
            effects: [
                {
                    type: EffectType.CreateTokenCopy,
                    targetMapping: TargetMapping.Target1,
                    typesToAdd: ['Creature'],
                    subtypesToAdd: ['Fractal'],
                    powerOverride: "0",
                    toughnessOverride: "0",
                    image_url: "https://cards.scryfall.io/normal/front/8/b/8b5f1fdb-04df-4224-acb4-7819c37565f5.jpg?1775828306"
                },
                {
                    type: EffectType.AddCounters,
                    targetMapping: TargetMapping.LastCreatedToken,
                    amount: 6,
                    counterType: '+1/+1'
                }
            ]
        }
    ]
};
