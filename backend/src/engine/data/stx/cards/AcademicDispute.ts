import { AbilityType, CardDefinition, DurationType, EffectType, RestrictionType, TargetMapping, TargetType } from '@shared/engine_types';

export const AcademicDispute: CardDefinition = {
    name: "Academic Dispute",
    manaCost: "{R}",
    scryfall_id: "4620cc3b-e401-4096-b310-fed080806344",
    image_url: "https://cards.scryfall.io/normal/front/4/6/4620cc3b-e401-4096-b310-fed080806344.jpg?1624591542",
    colors: ["R"],
    types: ["Instant"],
    oracleText: "Target creature blocks this turn if able. Target creature gets +1/+0 and gains reach until end of turn. Learn.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1
            }],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    restrictionsToAdd: [{ type: RestrictionType.MustBlock }],
                    powerModifier: 1,
                    abilitiesToAdd: ['Reach'],
                    targetMapping: TargetMapping.Target1,
                    layer: 6
                },
                { type: EffectType.Learn }
            ]
        }
    ]
};
