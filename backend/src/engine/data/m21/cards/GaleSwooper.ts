import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const GaleSwooper: CardDefinition = {
    name: "Gale Swooper",
    manaCost: "{3}{W}",
    scryfall_id: "d2e3b99c-e48e-4f4d-ba7a-e9218137b432",
    image_url: "https://cards.scryfall.io/normal/front/d/2/d2e3b99c-e48e-4f4d-ba7a-e9218137b432.jpg?1594734966",
    oracleText: "Flying\nWhen this creature enters, target creature gains flying until end of turn.",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Griffin"],
    power: "3",
    toughness: "2",
    keywords: ["Flying"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    abilitiesToAdd: ['Flying'],
                    layer: 6,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
