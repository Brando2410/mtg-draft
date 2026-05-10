import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const SpiritMascot: CardDefinition = {
    name: "Spirit Mascot",
    manaCost: "{R}{W}",
    colors: ["R", "W"],
    types: ["Creature"],
    subtypes: ["Spirit"],
    keywords: [],
    oracleText: "Whenever one or more cards leave your graveyard, put a +1/+1 counter on this creature.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.LeaveGraveyard,
            condition: 'YOUR_CARD_LEAVES_GRAVEYARD',
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: '+1/+1',
                    amount: 1,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    power: "2",
    toughness: "2",
    scryfall_id: "123f1fde-d8de-4640-baa1-bb3781713168",
    image_url: "https://cards.scryfall.io/normal/front/1/2/123f1fde-d8de-4640-baa1-bb3781713168.jpg?1775938605",
    rarity: "common"
};

