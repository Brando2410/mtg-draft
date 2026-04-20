import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const PursuedWhale: CardDefinition = {
    name: "Pursued Whale",
    manaCost: "{5}{U}{U}",
    scryfall_id: "b1501118-5837-49b5-9446-0bc3032035ca",
    image_url: "https://cards.scryfall.io/normal/front/b/1/b1501118-5837-49b5-9446-0bc3032035ca.jpg?1594735617",
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
            targetDefinition: { type: TargetType.Opponent, count: 1 },
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
                    image_url: "https://cards.scryfall.io/large/front/e/5/e53a3ae8-0051-4f18-bbbe-ad79446d656f.jpg?1594733640",
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
                    }],
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
    ]
};
