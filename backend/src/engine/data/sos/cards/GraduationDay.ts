import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
export const GraduationDay: CardDefinition = {
    name: "Graduation Day",
    manaCost: "{1}{G}",
    scryfall_id: "db1cea01-123e-4b23-8b98-f94cabce3912",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/d/b/db1cea01-123e-4b23-8b98-f94cabce3912.jpg?1775937020",
    colors: [
        "G"
    ],
    types: [
        "Enchantment"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, put a +1/+1 counter on target creature you control.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: 'REPARTEE_TRIGGER',
            targetDefinition: {
                type: TargetType.AnyTarget,
                count: 1,
                restrictions: [Restriction.Creature, Restriction.YouControl]
            },
            effects: [
                {
                    type: EffectType.AddCounters,
                    amount: 1,
                    counterType: '+1/+1',
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
