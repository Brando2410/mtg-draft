import { AbilityType, CardDefinition, ConditionType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const BarrinTolarianArchmage: CardDefinition = {
    name: "Barrin, Tolarian Archmage",
    manaCost: "{1}{U}{U}",
    scryfall_id: "cb078fbb-beb9-4c0b-be93-ed1e73e6f8d8",
    image_url: "https://cards.scryfall.io/normal/front/c/b/cb078fbb-beb9-4c0b-be93-ed1e73e6f8d8.jpg?1594735404",
    oracleText: "When Barrin enters, return up to one other target creature or planeswalker to its owner's hand.\nAt the beginning of your end step, if a permanent was put into your hand from the battlefield this turn, draw a card.",
    colors: ["U"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Human", "Wizard"],
    power: "2",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinitions: [{
                type: TargetType.CreatureOrPlaneswalker,
                count: 1,
                minCount: 0,
                restrictions: [Restriction.Other]
            }],
            effects: [{ type: EffectType.ReturnToHand, targetMapping: TargetMapping.Target1 }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EndStep,
            condition: `${ConditionType.IsYourTurn} && ${ConditionType.PermanentReturnedToHandThisTurn}`,
            effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }]
        }
    ]
};
