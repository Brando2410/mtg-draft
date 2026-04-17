import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const AlchemistsGift: CardDefinition = {
    name: "Alchemist's Gift",
    manaCost: "{B}",
    scryfall_id: "6e4c9574-1ee3-461e-848f-8f02c6a8b7ee",
    image_url: "https://cards.scryfall.io/normal/front/6/e/6e4c9574-1ee3-461e-848f-8f02c6a8b7ee.jpg?1594735950",
    oracleText: "Target creature gets +1/+1 and gains your choice of deathtouch or lifelink until end of turn. (Any amount of damage a creature with deathtouch deals to a creature is enough to destroy it. Damage dealt by a creature with lifelink also causes its controller to gain that much life.)",
    colors: ["B"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            id: "alchemist_gift_spell",
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.Creature, count: 1 },
            effects: [
                {
                    type: EffectType.Choice,
                    targetMapping: TargetMapping.Self,
                    label: 'Choose a keyword',
                    choices: [
                        {
                            label: 'Deathtouch',
                            effects: [
                                { type: EffectType.ApplyContinuousEffect, powerModifier: 1, toughnessModifier: 1, duration: { type: DurationType.UntilEndOfTurn }, abilitiesToAdd: ['Deathtouch'], layer: 7, targetMapping: TargetMapping.Target1 }
                            ]
                        },
                        {
                            label: 'Lifelink',
                            effects: [
                                { type: EffectType.ApplyContinuousEffect, powerModifier: 1, toughnessModifier: 1, duration: { type: DurationType.UntilEndOfTurn }, abilitiesToAdd: ['Lifelink'], layer: 7, targetMapping: TargetMapping.Target1 }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};

