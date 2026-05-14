import { AbilityType, CardDefinition, DynamicAmount, EffectType, Restriction, TargetType } from '@shared/engine_types';

export const FeedtheSwarm: CardDefinition = {
    name: "Feed the Swarm",
    manaCost: "{1}{B}",


    colors: ["B"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Destroy target creature or enchantment an opponent controls. You lose life equal to that permanent's mana value.",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Permanent,
                restrictions: [Restriction.OpponentControl, { type: Restriction.Any, restrictions: [Restriction.Creature, Restriction.Enchantment] }],
                count: 1
            }],
            effects: [
                {
                    type: EffectType.Destroy
                },
                {
                    type: EffectType.LoseLife,
                    amount: DynamicAmount.Target1ManaValue
                }
            ]
        }
    ],
    scryfall_id: "a041cfe3-a02d-41e2-aea3-76bc2bacc10e",
    image_url: "https://cards.scryfall.io/normal/front/a/0/a041cfe3-a02d-41e2-aea3-76bc2bacc10e.jpg?1775936576",
    rarity: "uncommon"
};

