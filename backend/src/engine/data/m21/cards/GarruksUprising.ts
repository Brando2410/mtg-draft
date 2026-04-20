import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const GarruksUprising: CardDefinition = {
    name: "Garruk's Uprising",
    manaCost: "{2}{G}",
    scryfall_id: "71a4860a-8bb6-45c0-b00a-b4a42da33ab9",
    image_url: "https://cards.scryfall.io/normal/front/7/1/71a4860a-8bb6-45c0-b00a-b4a42da33ab9.jpg?1594737017",
    oracleText: "When this enchantment enters, if you control a creature with power 4 or greater, draw a card.\nCreatures you control have trample. (Each of those creatures can deal excess combat damage to the player or planeswalker it's attacking.)\nWhenever a creature you control with power 4 or greater enters, draw a card.",
    colors: ["G"],
    types: ["Enchantment"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            condition: (state: any, event: any, source: any) =>
                event.sourceId === source.id &&
                state.battlefield.some((o: any) => o.controllerId === source.controllerId && (o.effectiveStats?.power || 0) >= 4),
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
            condition: (state: any, event: any, source: any) => {
                const entered = state.battlefield.find((o: any) => o.id === event.sourceId);
                return entered &&
                    entered.controllerId === source.controllerId &&
                    entered.definition.types.includes('Creature') &&
                    (entered.effectiveStats?.power || 0) >= 4 &&
                    entered.id !== source.id;
            },
            effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }]
        }
    ]
};
