import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const TeferisTutelage: CardDefinition = {
    name: "Teferi's Tutelage",
    manaCost: "{2}{U}",
    oracleText: "When this enchantment enters, draw a card, then discard a card.\nWhenever you draw a card, target opponent mills two cards.",
    colors: ["U"],
    types: ["Enchantment"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller },
                { type: EffectType.DiscardCards, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Draw,
            condition: 'EVENT_PLAYER_IS_YOU',
            effects: [
                { type: EffectType.Mill, amount: 2, targetDefinition: { type: TargetType.Opponent } }
            ]
        }
    ]
};



