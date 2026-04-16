import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const PursuedWhale: CardDefinition = {

    name: "Pursued Whale",
    manaCost: "{5}{U}{U}",
    colors: ["U"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Whale"],
    power: "8",
    toughness: "8",
    keywords: [],
    oracleText: "When Pursued Whale enters the battlefield, target opponent creates a 1/1 red Pirate creature token with \"This creature can't block\" and \"Creatures you control attack each combat if able.\"\nSpells your opponents cast that target Pursued Whale cost {3} more to cast.",
    abilities: [
        {

            type: AbilityType.Triggered,
            activeZone: Zone.Battlefield,
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
                    power: "1",
                    toughness: "1",
                    keywords: ['CannotBlock'],
                    abilities: [{
                        type: AbilityType.Static,
                        effects: [{
                            type: EffectType.ApplyContinuousEffect,
                            restrictions: [{ type: 'MustAttack' }],
                            targetMapping: TargetMapping.AllCreaturesYouControl
                        }],

                    }],
                }
            }]
        },
        {

            type: AbilityType.Static,
            activeZone: Zone.Battlefield,
            effects: [{
                type: EffectType.SpellTax,
                amount: 3,
                condition: 'SPELL_TARGETS_SOURCE',
                targetMapping: TargetMapping.EachOpponent
            }],
        }
    ]
};




