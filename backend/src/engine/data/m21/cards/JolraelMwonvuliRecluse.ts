import { AbilityType, CardDefinition, CostType, DurationType, DynamicAmount, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const JolraelMwonvuliRecluse: CardDefinition = {
    name: "Jolrael, Mwonvuli Recluse",
    manaCost: "{1}{G}",
    scryfall_id: "7dcdcfce-3f32-48f9-83f8-87b9ccbf92e3",
    image_url: "https://cards.scryfall.io/normal/front/7/d/7dcdcfce-3f32-48f9-83f8-87b9ccbf92e3.jpg?1594737074",
    oracleText: "Whenever you draw your second card each turn, create a 2/2 green Cat creature token.\n{4}{G}{G}: Until end of turn, creatures you control have base power and toughness X/X, where X is the number of cards in your hand.",
    colors: ["G"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Human", "Druid"],
    power: "1",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.SecondDraw,
            condition: 'PLAYER_IS_CONTROLLER',
            effects: [{
                type: EffectType.CreateToken,
                tokenBlueprint: {
                    name: 'Cat',
                    power: 2,
                    toughness: 2,
                    colors: ['G'],
                    types: ['Creature'],
                    subtypes: ['Cat']
                },
                targetMapping: TargetMapping.Controller
            }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{4}{G}{G}' }],
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: { type: DurationType.UntilEndOfTurn },
                powerSet: DynamicAmount.HandSize,
                toughnessSet: DynamicAmount.HandSize,
                targetMapping: TargetMapping.AllCreaturesYouControl
            }]
        }
    ]
};

