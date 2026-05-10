import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping } from '@shared/engine_types';

export const PracticalResearch: CardDefinition = {
    name: 'Practical Research',
    manaCost: '{3}{U}{R}',
    colors: ['U', 'R'],
    types: ['Instant'],
    oracleText: 'Draw four cards. Then discard two cards unless you discard an instant or sorcery card.',
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                { type: EffectType.DrawCards, amount: 4, targetMapping: TargetMapping.Controller },
                {
                    type: EffectType.Choice,
                    label: "Choose one",
                    choices: [
                        {
                            label: "Discard 1 Instant or Sorcery card",
                            effects: [{
                                type: EffectType.DiscardCards,
                                amount: 1,
                                restrictions: [Restriction.InstantOrSorcery]
                            }]
                        },
                        {
                            label: "Discard 2 cards",
                            effects: [{
                                type: EffectType.DiscardCards,
                                amount: 2
                            }]
                        }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "74edd3e3-b2de-4ba0-a508-0418b0151d87",
    image_url: "https://cards.scryfall.io/normal/front/7/4/74edd3e3-b2de-4ba0-a508-0418b0151d87.jpg?1627429890",
    rarity: "uncommon"
};

