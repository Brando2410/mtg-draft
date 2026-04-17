import { AbilityType, CardDefinition, CostType, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';
    export const SunderingArchaic: CardDefinition = {
    name: "Sundering Archaic",
    manaCost: "{6}",
    colors: [],
    types: [
        "Creature"
    ],
    subtypes: [
        "Avatar"
    ],
    keywords: [],
    oracleText: "Converge — When this creature enters, exile target nonland permanent an opponent controls with mana value less than or equal to the number of colors of mana spent to cast this creature.\n{2}: Put target card from a graveyard on the bottom of its owner's library.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: {
                count: 1,
                restrictions: [
                { type: 'Type', value: 'Nonland' },
                { type: 'Control', value: 'OpponentControl' },
                { type: 'ManaValue',
                comparison: 'LessOrEqual',
                value: DynamicAmount.ConvergeAmount }
            ]
            },
            effects: [
                {
                    type: CostType.Exile,
                    targetMapping: TargetMapping.Target1
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{2}' }],
            targetDefinition: {
                count: 1,
                type: TargetType.CardInGraveyard
            },
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Library,
                    position: 'bottom',
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    power: "3",
    toughness: "3"
};
    