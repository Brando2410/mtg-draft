import { AbilityType, CardDefinition, EffectType } from '@shared/engine_types';

export const DarkRitual: CardDefinition = {
    name: "Dark Ritual",
    manaCost: "{B}",
    oracleText: "Add {B}{B}{B}.",
    colors: ["B"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.AddMana,
                    manaType: "{B}{B}{B}"
                }
            ]
        }
    ]
};
