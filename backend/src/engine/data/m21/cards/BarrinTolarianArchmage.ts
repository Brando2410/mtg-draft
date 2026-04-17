import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const BarrinTolarianArchmage: CardDefinition = {
    name: "Barrin, Tolarian Archmage",
    manaCost: "{1}{U}{U}",
    oracleText: "When Barrin enters, return up to one other target creature or planeswalker to its owner's hand.\nAt the beginning of your end step, if a permanent was put into your hand from the battlefield this turn, draw a card.",
    colors: ["U"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Human", "Wizard"],
    power: "2",
    toughness: "2",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            activeZone: Zone.Battlefield,
            condition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
            targetDefinition: { type: TargetType.CreatureOrPlaneswalker, count: 1, optional: true, restrictions: [
                { type: 'Identity', value: 'Other' }
            ] },
            effects: [{ type: EffectType.ReturnToHand, targetMapping: TargetMapping.Target1 }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EndStep,
            activeZone: Zone.Battlefield,
            condition: (state: any, event: any, source: any) => state.activePlayerId === source.controllerId && state.turnState.playersWithPermanentReturnedThisTurn[source.controllerId] === true,
            effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }]
        }
    ]

};



