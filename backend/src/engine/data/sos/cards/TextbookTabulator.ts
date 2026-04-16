import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const TextbookTabulator: CardDefinition = {
    name: "Textbook Tabulator",
    manaCost: "{2}{U}",
    colors: [
        "U"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Frog",
        "Wizard"
    ],
    keywords: ["Increment"],
    oracleText: "Increment (Whenever you cast a spell, if the amount of mana you spent is greater than this creature's power or toughness, put a +1/+1 counter on this creature.)\nWhen this creature enters, surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.Surveil,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    power: "0",
    toughness: "3"
};
    