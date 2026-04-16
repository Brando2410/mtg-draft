import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const JolraelMwonvuliRecluse: CardDefinition = {
    name: "Jolrael, Mwonvuli Recluse",
    manaCost: "{1}{G}",
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
            activeZone: Zone.Battlefield,
            condition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
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
            activeZone: Zone.Battlefield,
            costs: [{ type: CostType.Mana, value: '{4}{G}{G}' }],
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: { type: DurationType.UntilEndOfTurn },
                powerSet: (state: any, source: any) => state.players[source.controllerId].hand.length,
                toughnessSet: (state: any, source: any) => state.players[source.controllerId].hand.length,
                targetMapping: TargetMapping.AllCreaturesYouControl
            }]
        }
    ]
};

