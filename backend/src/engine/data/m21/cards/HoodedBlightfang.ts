import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const HoodedBlightfang: CardDefinition = {
    name: "Hooded Blightfang",
    manaCost: "{2}{B}",

    oracleText: "Deathtouch\nWhenever a creature you control with deathtouch attacks, each opponent loses 1 life and you gain 1 life.\nWhenever a creature you control with deathtouch deals damage to a planeswalker, destroy that planeswalker.",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Snake"],
    power: "1",
    toughness: "4",
    keywords: ["Deathtouch"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            condition: 'YOU_CONTROL_ATTACKER_WITH_DEATHTOUCH',
            effects: [
                { type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.EachOpponent },
                { type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.DamageDealt,
            condition: 'YOU_CONTROL_SOURCE_WITH_DEATHTOUCH && EVENT_TARGET_IS_PLANESWALKER',
            effects: [{
                type: EffectType.Destroy,
                targetMapping: TargetMapping.EventTarget
            }]
        }
    ],
    scryfall_id: "ac38a51f-9a3b-451c-b72d-6d4e0b296fbd",
    image_url: "https://cards.scryfall.io/normal/front/a/c/ac38a51f-9a3b-451c-b72d-6d4e0b296fbd.jpg?1594736187",
    rarity: "rare"
};

