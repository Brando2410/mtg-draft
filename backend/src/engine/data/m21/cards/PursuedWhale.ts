import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const PursuedWhale: CardDefinition = {
    name: "Pursued Whale",
    manaCost: "{5}{U}{U}",

    oracleText: "When Pursued Whale enters the battlefield, target opponent creates a 1/1 red Pirate creature token with \"This creature can't block\" and \"Creatures you control attack each combat if able.\"\nSpells your opponents cast that target Pursued Whale cost {3} more to cast.",
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Whale"],
    power: "8",
    toughness: "8",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinitions: [{ type: TargetType.Opponent, count: 1 }],
            effects: [{
                type: EffectType.CreateToken,
                amount: 1,
                targetMapping: TargetMapping.Target1,
                tokenBlueprint: {
                    name: "Pirate",
                    colors: ["R"],
                    types: ["Creature"],
                    subtypes: ["Pirate"],
                    power: "1",
                    toughness: "1",

                    abilities: [{
                        type: AbilityType.Static,
                        effects: [
                            {
                                type: EffectType.ApplyContinuousEffect,
                                restrictions: [Restriction.CannotBlock],
                                targetMapping: TargetMapping.Self,
                                layer: 6
                            },
                            {
                                type: EffectType.ApplyContinuousEffect,
                                restrictions: [Restriction.MustAttack],
                                targetMapping: TargetMapping.AllCreaturesYouControl,
                                layer: 6
                            }
                        ]
                    }]
                }
            }]
        },
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.SpellTax,
                amount: 3,
                condition: 'SPELL_TARGETS_SOURCE',
                targetMapping: TargetMapping.EachOpponent
            }]
        }
    ],
    scryfall_id: "f1ba925b-9216-4e37-814d-b061950b3998",
    image_url: "https://cards.scryfall.io/normal/front/f/1/f1ba925b-9216-4e37-814d-b061950b3998.jpg?1674141436",
    rarity: "rare"
};

