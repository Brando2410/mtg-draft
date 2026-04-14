import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const MultipleChoice: CardDefinition = {
    name: 'Multiple Choice',
    manaCost: '{X}{U}',
    colors: ['U'],
    types: ['Sorcery'],
    oracleText: 'If X is 1, return target creature to its owner\'s hand. If X is 2, create a 2/2 blue Drake creature token with flying. If X is 3, create a 4/4 blue and red Elemental creature token. If X is 4 or more, do all of the above and draw three cards.',
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [{
                type: EffectType.Choice,
                choices: [
                    {
                        label: "X=1: Return Creature",
                        condition: 'XIs1',
                        targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }] },
                        effects: [{ type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.Target1 }]
                    },
                    {
                        label: "X=2: Create 2/2 Drake",
                        condition: 'XIs2',
                        effects: [{ type: EffectType.CreateToken, tokenBlueprint: { name: 'Drake', power: '2', toughness: '2', colors: ['U'], types: ['Creature', 'Token'], subtypes: ['Drake'], keywords: ['Flying'] }, amount: 1 }]
                    },
                    {
                        label: "X=3: Create 4/4 Elemental",
                        condition: 'XIs3',
                        effects: [{ type: EffectType.CreateToken, tokenBlueprint: { name: 'Elemental', power: '4', toughness: '4', colors: ['U', 'R'], types: ['Creature', 'Token'], subtypes: ['Elemental'] }, amount: 1 }]
                    },
                    {
                        label: "X>=4: All Above + Draw 3",
                        condition: 'XIs4OrMore',
                        effects: [
                            {
                                type: EffectType.Choice,
                                label: "Target creature to return hand (X>=4)",
                                targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }] },
                                effects: [{ type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.Target1 }]
                            },
                            { type: EffectType.CreateToken, tokenBlueprint: { name: 'Drake', power: '2', toughness: '2', colors: ['U'], types: ['Creature', 'Token'], subtypes: ['Drake'], keywords: ['Flying'] }, amount: 1 },
                            { type: EffectType.CreateToken, tokenBlueprint: { name: 'Elemental', power: '4', toughness: '4', colors: ['U', 'R'], types: ['Creature', 'Token'], subtypes: ['Elemental'] }, amount: 1 },
                            { type: EffectType.DrawCards, amount: 3, targetMapping: TargetMapping.Controller }
                        ]
                    }
                ]
            }]
        }
    ]
  };
