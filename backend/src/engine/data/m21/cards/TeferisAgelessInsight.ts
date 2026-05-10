import { AbilityType, CardDefinition, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const TeferisAgelessInsight: CardDefinition = {
    name: "Teferi's Ageless Insight",
    manaCost: "{2}{U}{U}",

    oracleText: "If you would draw a card except the first one you draw in each of your draw steps, draw two cards instead.",
    colors: ["U"],
    supertypes: ["Legendary"],
    types: ["Enchantment"],
    abilities: [
        {
            type: AbilityType.Replacement,
            activeZone: Zone.Battlefield,
            replacesEvent: 'DRAW_CARD',
            condition: 'NOT_FIRST_DRAW_IN_DRAW_STEP',
            effects: [{ type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Controller }]
        }
    ],
    scryfall_id: "b1a32b7c-9f26-4504-9f8d-379164d69346",
    image_url: "https://cards.scryfall.io/normal/front/b/1/b1a32b7c-9f26-4504-9f8d-379164d69346.jpg?1706240737",
    rarity: "rare"
};

