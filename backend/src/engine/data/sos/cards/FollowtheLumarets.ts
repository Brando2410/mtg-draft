import { AbilityType, CardDefinition, ConditionType, EffectType, Zone } from '@shared/engine_types';
export const FollowtheLumarets: CardDefinition = {
    name: "Follow the Lumarets",
    manaCost: "{1}{G}",
    colors: [
        "G"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Infusion — Look at the top four cards of your library. You may reveal a creature or land card from among them and put it into your hand. If you gained life this turn, you may instead reveal two creature and/or land cards from among them and put them into your hand. Put the rest on the bottom of your library in a random order.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.ConditionalEffect,
                    effects: [
                        {
                            condition: ConditionType.Infusion,
                            type: EffectType.LookAtTopAndPick,
                            fromTop: 4,
                            amount: 2,
                            restrictions: [
                                { type: 'Type', value: 'Creature_OR_Land' }
                            ],
                            reveal: true,
                            optional: true,
                            zone: Zone.Hand,
                            remainderZone: Zone.Library,
                            remainderPosition: 'bottom',
                            shuffleRemainder: true
                        },
                        {
                            condition: 'INFUSION',
                            type: EffectType.LookAtTopAndPick,
                            fromTop: 4,
                            amount: 1,
                            restrictions: [
                                { type: 'Type', value: 'Creature_OR_Land' }
                            ],
                            reveal: true,
                            optional: true,
                            zone: Zone.Hand,
                            remainderZone: Zone.Library,
                            remainderPosition: 'bottom',
                            shuffleRemainder: true
                        }
                    ]
                }
            ]
        }
    ]
};
