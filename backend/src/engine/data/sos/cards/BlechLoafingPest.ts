import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const BlechLoafingPest: CardDefinition = {
    name: "Blech, Loafing Pest",
    manaCost: "{1}{B}{G}",
    scryfall_id: "f588fa50-7cc5-41ba-90df-2d252eb5c785",
    image_url: "https://cards.scryfall.io/normal/front/f/5/f588fa50-7cc5-41ba-90df-2d252eb5c785.jpg?1775938208",
    colors: [
        "B",
        "G"
    ],
    types: [
        "Legendary",
        "Creature"
    ],
    subtypes: [
        "Pest"
    ],
    keywords: [],
    oracleText: "Whenever you gain life, put a +1/+1 counter on each Pest, Bat, Insect, Snake, and Spider you control.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.LifeGain,
            effects: [
                {
                    type: EffectType.AddCounters,
                    amount: 1,
                    counterType: '+1/+1',
                    targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                    restrictions: [
                        "Pest_or_Bat_or_Insect_or_Snake_or_Spider"
                    ]
                }
            ]
        }
    ],
    power: "3",
    toughness: "4"
};
