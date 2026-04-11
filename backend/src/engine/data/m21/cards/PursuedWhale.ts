import { ImplementableCard, AbilityType, EffectType, ZoneRequirement, TargetType } from '@shared/engine_types';

export const PursuedWhale: Record<string, ImplementableCard> = {
    "Pursued Whale": {
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
                id: 'pursued_whale_etb',
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                triggerEvent: 'ON_ETB',
                effects: [{
                    type: EffectType.CreateToken,
                    amount: 1,
                    targetMapping: 'OPPONENT',
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
                                targetMapping: 'ALL_CREATURES_YOU_CONTROL'
                            }],
                            oracleText: "Creatures you control attack each combat if able."
                        }],
                        oracleText: "This creature can't block. Creatures you control attack each combat if able."
                    }
                }]
            },
            {
                id: 'pursued_whale_tax',
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{
                    type: EffectType.SpellTax,
                    amount: 3,
                    condition: 'SPELL_TARGETS_SOURCE',
                    targetMapping: 'OPPONENT'
                }],
                oracleText: "Spells your opponents cast that target Pursued Whale cost {3} more to cast."
            }
        ]
    }
};
