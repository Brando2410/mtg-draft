import { AbilityType, CardDefinition, CostType, DynamicAmount, EffectType } from '@shared/engine_types';
    export const TopiaryLecturer: CardDefinition = {
    name: "Topiary Lecturer",
    manaCost: "{2}{G}",
    colors: [
        "G"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Elf",
        "Druid"
    ],
    keywords: ["Increment"],
    oracleText: "Increment (Whenever you cast a spell, if the amount of mana you spent is greater than this creature's power or toughness, put a +1/+1 counter on this creature.)\n{T}: Add an amount of {G} equal to this creature's power.",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [
                {
                    type: CostType.Tap
                }
            ],
            isManaAbility: true,
            effects: [
                {
                    type: EffectType.AddMana,
                    manaType: 'G',
                    amount: DynamicAmount.SourcePower
                }
            ]
        }
    ],
    power: "1",
    toughness: "2",
    scryfall_id: "4f16a1c2-0a80-45e4-b025-3aa0c0b03812",
    image_url: "https://cards.scryfall.io/normal/front/4/f/4f16a1c2-0a80-45e4-b025-3aa0c0b03812.jpg?1776000370",
    rarity: "uncommon"
};

