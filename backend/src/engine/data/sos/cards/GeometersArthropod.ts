import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';
export const GeometersArthropod: CardDefinition = {
    name: "Geometer's Arthropod",
    manaCost: "{G}{U}",
    scryfall_id: "ec0f3613-1edc-40e8-8f26-2e5ef13be55e",
    rarity: "rare",
    image_url: "https://cards.scryfall.io/normal/front/e/c/ec0f3613-1edc-40e8-8f26-2e5ef13be55e.jpg?1775938325",
    colors: ["G", "U"],
    types: ["Creature"],
    subtypes: ["Fractal", "Crab"],
    power: "1",
    toughness: "4",
    keywords: [],
    oracleText: "Whenever you cast a spell with {X} in its mana cost, look at the top X cards of your library. Put one of them into your hand and the rest on the bottom of your library in a random order.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: 'PLAYER_IS_CONTROLLER && EVENT_OBJECT_HAS_X',
            effects: [
                {
                    type: EffectType.LookAtTopAndPick,
                    fromTop: DynamicAmount.X, // In this context, the engine should resolve X from the event object
                    targetMapping: TargetMapping.Controller,
                    remainderZone: Zone.Library,
                    remainderPosition: 'bottom'
                }
            ]
        }
    ]
};
