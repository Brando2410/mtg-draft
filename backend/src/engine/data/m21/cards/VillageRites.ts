import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping } from '@shared/engine_types';

export const VillageRites: CardDefinition = {
    name: "Village Rites",
    manaCost: "{B}",
    scryfall_id: "0fad9fa8-e4b5-4927-991f-06774616f392",
    image_url: "https://cards.scryfall.io/normal/front/0/f/0fad9fa8-e4b5-4927-991f-06774616f392.jpg?1594736441",
    oracleText: "As an additional cost to cast this spell, sacrifice a creature.\nDraw two cards.",
    colors: ["B"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            costs: [
                { type: CostType.Sacrifice, restrictions: [Restriction.Creature] }
            ],
            effects: [{
                type: EffectType.DrawCards,
                amount: 2,
                targetMapping: TargetMapping.Controller
            }]
        }
    ]
};
