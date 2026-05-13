import { AbilityType, CardDefinition, ConditionType, EffectType, Restriction, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const GarruksUprising: CardDefinition = {
    name: "Garruk's Uprising",
    manaCost: "{2}{G}",

    oracleText: "When this enchantment enters, if you control a creature with power 4 or greater, draw a card.\nCreatures you control have trample. (Each of those creatures can deal excess combat damage to the player or planeswalker it's attacking.)\nWhenever a creature you control with power 4 or greater enters, draw a card.",
    colors: ["G"],
    types: ["Enchantment"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            condition: `${ConditionType.EventSourceIsSelf} && ${ConditionType.HasPermanent}:${Restriction.Creature},${Restriction.Power4OrGreater}`,
            effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }]
        },
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    abilitiesToAdd: ['Trample'],
                    restrictions: [Restriction.Creature, Restriction.YouControl],
                    targetMapping: TargetMapping.AllMatchingPermanents
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            condition: `${ConditionType.EventObjectControllerIsYou} && ${ConditionType.EventObjectMatches}:${Restriction.Creature},${Restriction.Power4OrGreater} && !${ConditionType.EventSourceIsSelf}`,
            effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }]
        }
    ],
    scryfall_id: "71a4860a-8bb6-45c0-b00a-b4a42da33ab9",
    image_url: "https://cards.scryfall.io/normal/front/7/1/71a4860a-8bb6-45c0-b00a-b4a42da33ab9.jpg?1594737017",
    rarity: "uncommon"
};

