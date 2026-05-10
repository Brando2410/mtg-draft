import { AbilityType, CardDefinition, EffectType, Restriction, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const QuandrixCultivator: CardDefinition = {
    name: 'Quandrix Cultivator',
    manaCost: '{G/U}{G}{G}{G/U}',
    colors: ['G', 'U'],
    types: ['Creature'],
    subtypes: ['Turtle', 'Druid'],
    power: '3',
    toughness: '4',
    oracleText: "When Quandrix Cultivator enters the battlefield, you may search your library for a basic Forest or Island card, put it onto the battlefield tapped, then shuffle.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.Choice,
                    label: 'Search for Forest or Island?',
                    optional: true,
                    effects: [
                        {
                            type: EffectType.SearchLibrary,
                            targetDefinitions: [{
                                type: TargetType.Card,
                                count: 1,
                                restrictions: [Restriction.Basic, { type: Restriction.Any, restrictions: [Restriction.Forest, Restriction.Island] }]
                            }],
                            zone: Zone.Battlefield,
                            tapped: true
                        }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "e3ca9ff7-0dcf-4ecc-879c-957d290ad7f5",
    image_url: "https://cards.scryfall.io/normal/front/e/3/e3ca9ff7-0dcf-4ecc-879c-957d290ad7f5.jpg?1624739546",
    rarity: "uncommon"
};

