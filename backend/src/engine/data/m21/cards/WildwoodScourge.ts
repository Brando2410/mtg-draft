import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const WildwoodScourge: CardDefinition = {
    name: "Wildwood Scourge",
    manaCost: "{X}{G}",
    scryfall_id: "46ff0b33-d153-4b0e-ac48-7e5ed70ead09",
    image_url: "https://cards.scryfall.io/normal/front/4/6/46ff0b33-d153-4b0e-ac48-7e5ed70ead09.jpg?1594737301",
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
    ]
};
