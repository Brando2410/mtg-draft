import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from "@shared/engine_types";

export const MangaraTheDiplomat: CardDefinition = {
    name: "Mangara, the Diplomat",
    manaCost: "{3}{W}",
    scryfall_id: "9b4e628f-5fc5-4c17-a07d-448d361d7e7c",
    image_url: "https://cards.scryfall.io/normal/front/9/b/9b4e628f-5fc5-4c17-a07d-448d361d7e7c.jpg?1594735076",
    oracleText: "Lifelink\nWhenever an opponent attacks with creatures, if two or more of those creatures are attacking you and/or planeswalkers you control, draw a card.\nWhenever an opponent casts their second spell each turn, draw a card.",
    colors: ["W"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Human", "Cleric"],
    power: "2",
    toughness: "4",
    keywords: ["Lifelink"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            condition: 'OPPONENT_ATTACKING_WITH_2_OR_MORE_AT_YOU_OR_YOUR_PLANESWALKERS',
            effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.SecondSpellCast,
            condition: 'PLAYER_IS_OPPONENT',
            effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }]
        }
    ]
};
