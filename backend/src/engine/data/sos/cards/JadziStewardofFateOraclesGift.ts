import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const JadziStewardofFateOraclesGift: CardDefinition = {
    name: "Jadzi, Steward of Fate // Oracle's Gift",
    manaCost: "{2}{U}",
    colors: ["U"],
    types: ["Legendary", "Creature"],
    subtypes: ["Human", "Wizard"],
    keywords: ["Prepared"],
    oracleText: "Jadzi enters prepared.\nWhen Jadzi enters, draw two cards, then discard two cards.",
    power: "2",
    toughness: "4",
    entersPrepared: true,
    image_url: "https://cards.scryfall.io/png/front/a/9/a95b6baf-01e6-49c3-9a26-394b127d53c3.png?1775937293",
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
        image_url: "https://cards.scryfall.io/png/front/a/9/a95b6baf-01e6-49c3-9a26-394b127d53c3.png?1775937293",
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
                            toughness: "0",
                            image_url: "https://cards.scryfall.io/png/front/9/1/910f48ab-b04e-4874-b31d-a86a7bc5af14.png?1682693894"
                        },
                        amount: DynamicAmount.X,
                        targetMapping: TargetMapping.Controller
                    },
                    {
                        type: EffectType.AddCounters,
                        counterType: '+1/+1',
                        amount: DynamicAmount.X,
                        targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                        restrictions: ['Fractal']
                    }
                ]
            }
        ]
    }
};
    