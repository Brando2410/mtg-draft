import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

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
                            restrictions: [{ type: 'Subtype', value: 'Basic' }, { type: 'Any', restrictions: [{ type: 'Subtype', value: 'Forest' }, { type: 'Subtype', value: 'Island' }] }],
                            destination: Zone.Battlefield,
                            tapped: true,
                            shuffle: true
                        }
                    ]
                }
            ]
        }
    ]
  };

