import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const ScavengingOoze: CardDefinition = {
    name: "Scavenging Ooze",
    manaCost: "{1}{G}",

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
            targetDefinitions: [{
                type: TargetType.CardInGraveyard,
                count: 1
            }],
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
    ],
    scryfall_id: "8c504c23-1e9a-411b-9cfe-4180d0c744f6",
    image_url: "https://cards.scryfall.io/normal/front/8/c/8c504c23-1e9a-411b-9cfe-4180d0c744f6.jpg?1730489464",
    rarity: "rare"
};

