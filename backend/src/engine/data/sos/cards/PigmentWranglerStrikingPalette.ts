import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const PigmentWranglerStrikingPalette: CardDefinition = {
    name: "Pigment Wrangler",
    manaCost: "{4}{R}",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Orc", "Sorcerer"],
    power: "4",
    toughness: "4",
    keywords: ["Flying", "Prepared"],
    oracleText: "Flying\nThis creature enters prepared.",
    entersPrepared: true,

    preparedFace: {
        name: "Striking Palette",
        manaCost: "{R}",
        colors: ["R"],
        types: ["Sorcery"],
        oracleText: "When you next cast an instant or sorcery spell this turn, copy that spell. You may choose new targets for the copy.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.CreateDelayedTrigger,
                        eventMatch: TriggerEvent.CastInstantOrSorcery,
                        duration: { type: 'UNTIL_END_OF_TURN' },
                        effects: [
                            {
                                type: EffectType.CopySpellOnStack,
                                chooseNewTargets: true,
                                targetMapping: TargetMapping.TriggerEventSource
                            }
                        ]
                    }
                ]
            }
        ]
    }
};
