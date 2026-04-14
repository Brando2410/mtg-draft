import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const LoreholdExcavation: CardDefinition = {
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
                    zone: Zone.Graveyard, 
                    restriction: { type: 'Type', value: 'Creature' }
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
  };
