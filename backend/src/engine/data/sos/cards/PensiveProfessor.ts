import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const PensiveProfessor: CardDefinition = {
    name: "Pensive Professor",
    manaCost: "{1}{U}{U}",


    colors: [
        "U"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Human",
        "Wizard"
    ],
    keywords: ["Increment"],
    oracleText: "Increment (Whenever you cast a spell, if the amount of mana you spent is greater than this creature's power or toughness, put a +1/+1 counter on this creature.)\nWhenever one or more +1/+1 counters are put on this creature, draw a card.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CountersAdded,
            condition: 'TRIGGER_TARGET_IS_SELF && EVENT_COUNTER_TYPE_MATCHES:p1p1',
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    power: "0",
    toughness: "2",
    scryfall_id: "66d47940-84f9-4479-8562-45e5148435d4",
    image_url: "https://cards.scryfall.io/normal/front/6/6/66d47940-84f9-4479-8562-45e5148435d4.jpg?1775937349",
    rarity: "rare"
};

