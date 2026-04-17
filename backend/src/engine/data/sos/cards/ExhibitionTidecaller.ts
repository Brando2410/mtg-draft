import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
    export const ExhibitionTidecaller: CardDefinition = {
    name: "Exhibition Tidecaller",
    manaCost: "{U}",
    scryfall_id: "a58c364e-d0c5-41b9-8c8b-2e5a99468cc7",
    image_url: "https://cards.scryfall.io/normal/front/a/5/a58c364e-d0c5-41b9-8c8b-2e5a99468cc7.jpg?1775937242",
    colors: [
        "U"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Djinn",
        "Wizard"
    ],
    keywords: [],
    oracleText: "Opus — Whenever you cast an instant or sorcery spell, target player mills three cards. If five or more mana was spent to cast that spell, that player mills ten cards instead.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            targets: [{ type: TargetType.Player }],
            condition: ConditionType.PlayerIsController,
            effects: [
                {
                    type: EffectType.Mill,
                    amount: 10,
                    condition: 'SPENT_MANA_GE:5',
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.Mill,
                    amount: 3,
                    condition: 'SPENT_MANA_LT:5',
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    power: "0",
    toughness: "2"
};
    
