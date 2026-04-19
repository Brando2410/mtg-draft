import { AbilityType, CardDefinition, EffectType } from '@shared/engine_types';

export const TeachingsoftheArchaics: CardDefinition = {
        name: 'Teachings of the Archaics',
        manaCost: '{2}{U}',
        colors: ['U'],
        types: ['Sorcery'],
        subtypes: ['Lesson'],
        oracleText: "If an opponent has more cards in hand than you, draw two cards. Otherwise, you may discard a card. If you do, draw two cards.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.Choice,
                        condition: 'OpponentHasMoreCardsInHand',
                        choices: [
                            { label: 'Draw two cards', effects: [{ type: EffectType.DrawCards, amount: 2 }] }
                        ],
                        onFailureEffects: [
                            {
                                type: EffectType.Choice,
                                label: 'Discard a card to draw two?',
                                optional: true,
                                choices: [{
                                    label: 'Discard & Draw',
                                    costs: [{ type: 'Discard', value: 1 }],
                                    effects: [{ type: EffectType.DrawCards, amount: 2 }]
                                }]
                            }
                        ]
                    }
                ]
            }
        ]
    };

