import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const Shock: CardDefinition = {
    name: "Shock",
    manaCost: "{R}",
    scryfall_id: "5f571873-1002-45a0-91cd-b2c732c50b1d",
    image_url: "https://cards.scryfall.io/normal/front/5/f/5f571873-1002-45a0-91cd-b2c732c50b1d.jpg?1594736779",
    oracleText: "Shock deals 2 damage to any target.",
    colors: ["R"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{ type: TargetType.AnyTarget, count: 1 }],
            effects: [{ type: EffectType.DealDamage, amount: 2, targetMapping: TargetMapping.Target1 }]
        }
    ]
};
