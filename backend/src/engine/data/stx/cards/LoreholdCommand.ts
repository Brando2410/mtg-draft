import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const LoreholdCommand: CardDefinition = {
        name: 'Lorehold Command',
        manaCost: '{3}{R}{W}',
    scryfall_id: "e4f0885f-1049-4a19-853d-f4e6d4bec29e",
    image_url: "https://cards.scryfall.io/normal/front/e/4/e4f0885f-1049-4a19-853d-f4e6d4bec29e.jpg?1627429447",
        colors: ['R', 'W'],
        types: ['Instant'],
        oracleText: 'Choose two —\n• Create a 3/2 red and white Spirit creature token.\n• Creatures you control get +1/+0 and gain indestructible and haste until end of turn.\n• Lorehold Command deals 3 damage to any target and you gain 3 life.\n• Target player sacrifices a permanent and draws two cards.',
        abilities: [{
            type: AbilityType.Spell,
            effects: [{
                type: EffectType.Choice,
                label: 'Choose two',
                minChoices: 2,
                maxChoices: 2,
                choices: [
                    { 
                        label: 'Create 3/2 Spirit', 
                        effects: [{ type: EffectType.CreateToken, tokenBlueprint: { name: 'Spirit', power: "3", toughness: "2", colors: ['R', 'W'], types: ['Creature', 'Token'], subtypes: ['Spirit'] } }] 
                    },
                    { 
                        label: 'Creatures get +1/+0, indestructible, haste', 
                        effects: [{ type: EffectType.ApplyContinuousEffect, duration: 'UNTIL_END_OF_TURN', powerModifier: 1, abilitiesToAdd: ['Indestructible', 'Haste'], targetMapping: TargetMapping.AllCreaturesYouControl }] 
                    },
                    { 
                        label: 'Deal 3 damage, gain 3 life', 
                        targetDefinition: { count: 1, type: TargetType.AnyTarget },
                        effects: [{ type: EffectType.DealDamage, amount: 3, targetMapping: TargetMapping.Target1 }, { type: EffectType.GainLife, amount: 3, targetMapping: TargetMapping.Controller }] 
                    },
                    { 
                        label: 'Player sacrifices permanent, draws 2', 
                        targetDefinition: { count: 1, type: TargetType.Player },
                        effects: [
                            { type: EffectType.Sacrifice, targetMapping: TargetMapping.Target1, restrictions: [Restriction.Permanent] }, 
                            { type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Target1 }
                        ] 
                    }
                ]
            }]
        }]
    };

