import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const EliteInterceptorRejoinder: CardDefinition = {
    name: "Elite Interceptor",
    manaCost: "{W}",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Human", "Wizard"],
    power: "1",
    toughness: "2",
    keywords: ["Prepared"],
    oracleText: "This creature enters prepared.",
    entersPrepared: true,

    preparedFace: {
        name: "Rejoinder",
        manaCost: "{1}{W}",
        colors: ["W"],
        types: ["Sorcery"],
        oracleText: "You may tap or untap target creature. Draw a card.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [
                    {
                        type: EffectType.Choice,
                        label: "Tap or untap?",
                        choices: [
                            { label: "Tap", effects: [{ type: EffectType.Tap, targetMapping: TargetMapping.Target1 }] },
                            { label: "Untap", effects: [{ type: EffectType.Untap, targetMapping: TargetMapping.Target1 }] }
                        ]
                    },
                    { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }
                ]
            }
        ]
    }
};
