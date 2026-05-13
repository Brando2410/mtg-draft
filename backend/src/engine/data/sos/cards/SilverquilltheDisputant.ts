import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping } from '@shared/engine_types';
export const SilverquilltheDisputant: CardDefinition = {
    name: "Silverquill, the Disputant",
    manaCost: "{2}{W}{B}",
    colors: ["B", "W"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Elder", "Dragon"],
    keywords: ["Flying", "Vigilance"],
    oracleText: "Flying, vigilance\nEach instant and sorcery spell you cast has casualty 1. (As you cast that spell, you may sacrifice a creature with power 1 or greater. When you do, copy the spell and you may choose new targets for the copy.)",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.Controller,
                    restrictions: [Restriction.InstantOrSorcery],
                    abilitiesToAdd: ['Casualty 1']
                }
            ]
        }
    ],
    power: "4",
    toughness: "4",
    scryfall_id: "1742c9cd-5ba0-4335-9999-acc7f9d4f73c",
    image_url: "https://cards.scryfall.io/normal/front/1/7/1742c9cd-5ba0-4335-9999-acc7f9d4f73c.jpg?1775938577",
    rarity: "mythic"
};

