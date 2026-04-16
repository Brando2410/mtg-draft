import { AbilityType, CardDefinition, EffectType } from '@shared/engine_types';
    export const SlumberingTrudge: CardDefinition = {
    name: "Slumbering Trudge",
    manaCost: "{X}{G}",
    colors: [
        "G"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Plant",
        "Beast"
    ],
    keywords: [],
    oracleText: "This creature enters with a number of stun counters on it equal to three minus X. If X is 2 or less, it enters tapped.",
    entersTappedCondition: "X_LE:2", //mabye not working
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.EntersWithCounters,
                    counterType: 'stun',
                    amount: 'THREE_MINUS_X'
                }
            ]
        }
    ],
    power: "6",
    toughness: "6"
};
    