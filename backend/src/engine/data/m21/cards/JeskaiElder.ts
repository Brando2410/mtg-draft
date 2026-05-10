import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const JeskaiElder: CardDefinition = {
    name: "Jeskai Elder",
    manaCost: "{1}{U}",

    oracleText: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\nWhenever Jeskai Elder deals combat damage to a player, you may draw a card. If you do, discard a card.",
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Human", "Monk"],
    power: "1",
    toughness: "2",
    keywords: ["Prowess"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.DamageDealtToPlayer,
            condition: ConditionType.EventObjectIsTriggerSource,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Draw then discard?",
                    optional: true,
                    effects: [
                        {
                            type: EffectType.DrawCards,
                            amount: 1,
                            targetMapping: TargetMapping.Controller
                        },
                        {
                            type: EffectType.DiscardCards,
                            amount: 1,
                            targetMapping: TargetMapping.Controller
                        }
                    ],
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "38fd9091-2d22-411f-955a-24c32293cdca",
    image_url: "https://cards.scryfall.io/normal/front/3/8/38fd9091-2d22-411f-955a-24c32293cdca.jpg?1673147323",
    rarity: "common"
};

