import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetMapping } from '@shared/engine_types';

export const JadziStewardofFateOraclesGift: CardDefinition = {
    name: "Jadzi, Steward of Fate",
    manaCost: "{2}{U}",
    colors: ["U"],
    types: ["Legendary", "Creature"],
    subtypes: ["Human", "Wizard"],
    power: "2",
    toughness: "4",
    keywords: ["Prepared"],
    oracleText: "Jadzi enters prepared.\nWhen Jadzi enters, draw two cards, then discard two cards.",
    entersPrepared: true,
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                { type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Controller },
                { type: EffectType.DiscardCards, amount: 2, targetMapping: TargetMapping.Controller }
            ]
        }
    ],

    preparedFace: {
        name: "Oracle's Gift",
        manaCost: "{X}{X}{U}",
        colors: ["U"],
        types: ["Sorcery"],
        oracleText: "Create X 0/0 green and blue Fractal creature tokens, then put X +1/+1 counters on each Fractal you control.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.CreateToken,
                        tokenBlueprint: {
                            name: "Fractal",
                            colors: ["G", "U"],
                            types: ["Creature", "Token"],
                            subtypes: ["Fractal"],
                            power: "0",
                            toughness: "0"
                        },
                        amount: "X",
                        targetMapping: TargetMapping.Controller
                    },
                    {
                        type: EffectType.AddCounters,
                        counterType: 'p1p1',
                        amount: "X",
                        targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                        restrictions: ['Fractal']
                    }
                ]
            }
        ]
    }
};
