import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const WildwoodScourge: CardDefinition = {
    name: "Wildwood Scourge",
    manaCost: "{X}{G}",

    oracleText: "Wildwood Scourge enters the battlefield with X +1/+1 counters on it.\nWhenever one or more +1/+1 counters are put on another non-Hydra creature you control, put a +1/+1 counter on Wildwood Scourge.",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Hydra"],
    power: "0",
    toughness: "0",
    entersWithXCounters: true,
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CountersAddedOther,
            condition: 'PLAYER_IS_CONTROLLER_AND_OBJECT_IS_NON_HYDRA_CREATURE_AND_COUNTERS_IS_PLUS_1_PLUS_1',
            effects: [
                {
                    type: EffectType.AddCounters,
                    amount: 1,
                    counterType: '+1/+1',
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    scryfall_id: "36359fb6-fb8c-4382-8555-e348422f116c",
    image_url: "https://cards.scryfall.io/normal/front/3/6/36359fb6-fb8c-4382-8555-e348422f116c.jpg?1730489480",
    rarity: "uncommon"
};

