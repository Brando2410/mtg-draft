import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const STX_SchoolUncommons: CardDefinition[] = [
  {
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
                                restrictions: ['Basic', 'Forest_or_Island']
                            },
                            zone: Zone.Battlefield,
                            tapped: true,
                            shuffle: true
                        }
                    ]
                }
            ]
        }
    ]
  },
  {
    name: 'Lorehold Excavation',
    manaCost: '{R}{W}',
    colors: ['R', 'W'],
    types: ['Enchantment'],
    oracleText: "At the beginning of your end step, mill a card.\n{5}, Exile a creature card from your graveyard: Create a 3/2 red and white Spirit creature token.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EndStep,
            condition: 'YourTurn',
            effects: [{ type: EffectType.Mill, amount: 1 }]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: 'Mana', value: '{5}' },
                { 
                    type: 'Exile', 
                    sourceZone: Zone.Graveyard, 
                    restrictions: ['Creature']
                }
            ],
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Spirit',
                        manaCost: '',
                        colors: ['R', 'W'],
                        types: ['Creature', 'Token'],
                        subtypes: ['Spirit'],
                        power: "3",
                        toughness: "2"
                    },
                    amount: 1
                }
            ]
        }
    ]
  }
];


