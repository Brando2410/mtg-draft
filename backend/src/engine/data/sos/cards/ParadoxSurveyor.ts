import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const ParadoxSurveyor: CardDefinition = {
    name: "Paradox Surveyor",
    manaCost: "{G}{G/U}{U}",
    colors: [
        "G",
        "U"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Elf",
        "Druid"
    ],
    keywords: ["Reach"],
    oracleText: "Reach\nWhen this creature enters, look at the top five cards of your library. You may reveal a land card or a card with {X} in its mana cost from among them and put it into your hand. Put the rest on the bottom of your library in a random order.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.LookAtTopAndPick,
                    amount: 5,
                    optional: true,
                    restrictions: [
                        { types: [Restriction.Land] },
                        { hasxinmanacost: true }
                    ],
                    remainderPosition: 'bottom',
                    shuffleRemainder: true,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    power: "3",
    toughness: "3"
};
    
