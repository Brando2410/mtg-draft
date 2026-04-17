import { AbilityType, CardDefinition, ConditionType, EffectType, TriggerEvent, Zone, CostType } from '@shared/engine_types';

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
            condition: ConditionType.IsYourTurn,
            effects: [{ type: EffectType.Mill, amount: 1 }]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{5}' },
                {
                    type: CostType.Exile,
                    zone: Zone.Graveyard,
                    restrictions: ['creature']
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


