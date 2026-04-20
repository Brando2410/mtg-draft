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
                            targetDefinition: {
                                type: TargetType.Card,
                                count: 1,
                                restrictions: [Restriction.Basic, { type: Restriction.Any, restrictions: [Restriction.Forest, Restriction.Island] }]
                            },
                            zone: Zone.Battlefield,
                            tapped: true
                        }
                    ]
                }
            ]
        }
    ]
};
