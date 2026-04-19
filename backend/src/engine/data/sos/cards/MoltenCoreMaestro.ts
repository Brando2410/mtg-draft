import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const MoltenCoreMaestro: CardDefinition = {
    name: "Molten-Core Maestro",
    manaCost: "{1}{R}",
    scryfall_id: "326dfe32-3674-4a11-acd8-5ba62371235a",
    rarity: "rare",
    image_url: "https://cards.scryfall.io/normal/front/3/2/326dfe32-3674-4a11-acd8-5ba62371235a.jpg?1775937832",
    colors: [
        "R"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Goblin",
        "Bard"
    ],
    keywords: ["Menace"],
    oracleText: "Menace\nOpus — Whenever you cast an instant or sorcery spell, put a +1/+1 counter on this creature. If five or more mana was spent to cast that spell, add an amount of {R} equal to this creature's power.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: ConditionType.PlayerIsController,
            effects: [
                {
                    type: EffectType.AddCounters,
                    amount: 1,
                    counterType: '+1/+1',
                    targetMapping: TargetMapping.Self
                },
                {
                    type: EffectType.AddMana,
                    condition: 'SPENT_MANA_GE:5',
                    manaType: 'R',
                    amount: 'POWER'
                }
            ]
        }
    ],
    power: "2",
    toughness: "2"
};

