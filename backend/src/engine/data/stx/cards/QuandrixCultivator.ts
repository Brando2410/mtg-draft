import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

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
                                restrictions: [
                { type: 'Type', value: 'Basic' },
                { type: 'Type', value: 'Forest_OR_Island' }
            ]
                            },
                            zone: Zone.Battlefield,
                            tapped: true,
                        }
                    ]
                }
            ]
        }
    ]
};


