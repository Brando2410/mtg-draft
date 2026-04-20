import { AbilityType, CardDefinition, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const TeferisAgelessInsight: CardDefinition = {
    name: "Teferi's Ageless Insight",
    manaCost: "{2}{U}{U}",
    scryfall_id: "c3896dfb-0351-464a-974f-c02741093159",
    image_url: "https://cards.scryfall.io/normal/front/c/3/c3896dfb-0351-464a-974f-c02741093159.jpg?1594735819",
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
    ]
};
