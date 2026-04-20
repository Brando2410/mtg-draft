import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const ScavengingOoze: CardDefinition = {
    name: "Scavenging Ooze",
    manaCost: "{1}{G}",
    scryfall_id: "487116df-b88d-47a3-a0ed-28ad14bbb97c",
    image_url: "https://cards.scryfall.io/normal/front/4/8/487116df-b88d-47a3-a0ed-28ad14bbb97c.jpg?1594737205",
    oracleText: "{G}: Exile target card from a graveyard. If it was a creature card, put a +1/+1 counter on Scavenging Ooze and you gain 1 life.",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Ooze"],
    power: "2",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{G}' }],
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                count: 1,
            },
            effects: [
                { type: EffectType.Exile, targetMapping: TargetMapping.Target1 },
                {
                    type: EffectType.AddCounters,
                    counterType: '+1/+1',
                    amount: 1,
                    condition: 'TARGET_1_IS_CREATURE_CARD',
                    targetMapping: TargetMapping.Self
                },
                {
                    type: EffectType.GainLife,
                    amount: 1,
                    condition: 'TARGET_1_IS_CREATURE_CARD',
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
