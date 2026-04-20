import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const SwiftResponse: CardDefinition = {
    name: "Swift Response",
    manaCost: "{1}{W}",
    scryfall_id: "a90c1ad0-8cbd-471a-a70c-ee6717af0bd8",
    image_url: "https://cards.scryfall.io/normal/front/a/9/a90c1ad0-8cbd-471a-a70c-ee6717af0bd8.jpg?1594735239",
    oracleText: "Destroy target tapped creature.",
    colors: ["W"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
                restrictions: [Restriction.Tapped]
            },
            effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
        }
    ]
};
