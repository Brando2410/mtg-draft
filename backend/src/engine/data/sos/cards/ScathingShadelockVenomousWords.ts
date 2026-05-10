import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
    export const ScathingShadelockVenomousWords: CardDefinition = {
    name: "Scathing Shadelock // Venomous Words",
    manaCost: "{4}{B} // {B}",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Snake", "Warlock"],
    keywords: [],
    oracleText: "At the beginning of your first main phase, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)\n//\nVenomous Words\n{B}\nSorcery\nTarget creature you control gets +2/+0 and gains deathtouch until end of turn.",
    power: "4",
    toughness: "6",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.PreCombatMainPhaseStart,
            condition: ConditionType.IsYourTurn,
            effects: [
                {
                    type: EffectType.Prepare,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    preparedFace: {
        name: "Venomous Words",
        manaCost: "{B}",
        colors: ["B"],
        types: ["Sorcery"],
        oracleText: "Target creature you control gets +2/+0 and gains deathtouch until end of turn.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinitions: [{
                    type: TargetType.Creature,
                    count: 1,
                    restrictions: [Restriction.YouControl]
    }],
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        duration: { type: DurationType.UntilEndOfTurn },
                        powerModifier: 2,
                        abilitiesToAdd: ["Deathtouch"],
                        targetMapping: TargetMapping.Target1
                    }
                ]
            }
        ],
    },
    scryfall_id: "03e664cd-c3a6-4263-b2d8-dd99058fb8ec",
    image_url: "https://cards.scryfall.io/normal/front/0/3/03e664cd-c3a6-4263-b2d8-dd99058fb8ec.jpg?1775937593",
    rarity: "uncommon"
};

