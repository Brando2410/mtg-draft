import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const OrysaTideChoreographer: CardDefinition = {
    name: "Orysa, Tide Choreographer",
    manaCost: "{4}{U}",
    scryfall_id: "010ed379-63f5-452c-9cd4-00d51647c0e3",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/0/1/010ed379-63f5-452c-9cd4-00d51647c0e3.jpg?1775937343",
    colors: [
        "U"
    ],
    types: [
        "Legendary",
        "Creature"
    ],
    subtypes: [
        "Merfolk",
        "Bard"
    ],
    keywords: [],
    oracleText: "This spell costs {3} less to cast if creatures you control have total toughness 10 or greater.\nWhen Orysa enters, draw two cards.",
    abilities: [
        {
            type: AbilityType.Static,
            costReduction: {
                amount: '{3}',
                condition: 'TOTAL_TOUGHNESS_GE:10'
            }
        },
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    power: "2",
    toughness: "2"
};
    
