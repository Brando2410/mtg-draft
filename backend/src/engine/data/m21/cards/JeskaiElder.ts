import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const JeskaiElder: CardDefinition = {
    name: "Jeskai Elder",
    manaCost: "{1}{U}",
    scryfall_id: "a188164c-01fe-4980-83a5-91d14e218cf5",
    image_url: "https://cards.scryfall.io/normal/front/a/1/a188164c-01fe-4980-83a5-91d14e218cf5.jpg?1594735524",
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
            activeZone: Zone.Battlefield,
            condition: 'EVENT_SOURCE_IS_SELF && EVENT_IS_COMBAT',
            effects: [
                {
                    type: EffectType.Choice,
                    label: "You may draw a card. If you do, discard a card.",
                    optional: true,
                    choices: [
                        {
                            label: "Yes",
                            effects: [
                                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller },
                                { type: EffectType.DiscardCards, amount: 1, targetMapping: TargetMapping.Controller }
                            ]
                        },
                        { label: "No", effects: [] }
                    ],
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};




