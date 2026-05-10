import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const ThunderdrumSoloist: CardDefinition = {
    name: "Thunderdrum Soloist",
    manaCost: "{1}{R}",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Dwarf", "Bard"],
    power: "1",
    toughness: "3",
    keywords: ["Reach"],
    oracleText: "Reach\nOpus — Whenever you cast an instant or sorcery spell, this creature deals 1 damage to each opponent. If five or more mana was spent to cast that spell, this creature deals 3 damage to each opponent instead.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: ConditionType.PlayerIsController,
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 3,
                    condition: `${ConditionType.SpentManaGe}:5`,
                    targetMapping: TargetMapping.EachOpponent,
                    sourceMapping: TargetMapping.Self
                },
                {
                    type: EffectType.DealDamage,
                    amount: 1,
                    condition: `${ConditionType.SpentManaLt}:5`,
                    targetMapping: TargetMapping.EachOpponent,
                    sourceMapping: TargetMapping.Self
                }
            ]
        }
    ],
    scryfall_id: "590d1d95-ed13-4121-899f-f5a2d8a6617a",
    image_url: "https://cards.scryfall.io/normal/front/5/9/590d1d95-ed13-4121-899f-f5a2d8a6617a.jpg?1775937905",
    rarity: "uncommon"
};

