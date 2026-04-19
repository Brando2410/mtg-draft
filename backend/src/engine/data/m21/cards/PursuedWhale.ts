import { AbilityType, CardDefinition, EffectType, RestrictionType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const PursuedWhale: CardDefinition = {
    name: "Pursued Whale",
    manaCost: "{5}{U}{U}",
    scryfall_id: "b1501118-5837-49b5-9446-0bc3032035ca",
    image_url: "https://cards.scryfall.io/normal/front/b/1/b1501118-5837-49b5-9446-0bc3032035ca.jpg?1594735617",
    colors: ["U"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Whale"],
    power: 8,
    toughness: 8,
    keywords: [],
    oracleText: "When Pursued Whale enters the battlefield, target opponent creates a 1/1 red Pirate creature token with \"This creature can't block\" and \"Creatures you control attack each combat if able.\"\nSpells your opponents cast that target Pursued Whale cost {3} more to cast.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [{
                type: EffectType.CreateToken,
                amount: 1,
                targetMapping: TargetMapping.EachOpponent,
                tokenBlueprint: {
                    name: "Pirate",
                    colors: ["R"],
                    types: ["Creature"],
                    subtypes: ["Pirate"],
                    power: 1,
                    toughness: 1,
                    image_url: "https://cards.scryfall.io/static/img/tokens/m21-6.png",
                    abilities: [{
                        type: AbilityType.Static,
                        effects: [
                            {
                                type: EffectType.ApplyContinuousEffect,
                                restrictions: [{ type: RestrictionType.CannotBlock }],
                                targetMapping: TargetMapping.Self,
                                layer: 6
                            },
                            {
                                type: EffectType.ApplyContinuousEffect,
                                restrictions: [{ type: RestrictionType.MustAttack }],
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
