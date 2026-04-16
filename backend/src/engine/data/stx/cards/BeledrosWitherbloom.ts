import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const BeledrosWitherbloom: CardDefinition = {
        name: "Beledros Witherbloom",
        manaCost: "{5}{B}{G}",
        colors: ["B", "G"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Elder", "Dragon"],
        power: "4",
        toughness: "4",
        keywords: ["Flying"],
        oracleText: "Flying. At the beginning of each upkeep, create a 1/1 black and green Pest creature token with \"When this creature dies, you gain 1 life.\"\nPay 10 life: Untap all lands you control. Activate only once each turn.",
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Upkeep,
                effects: [{ 
                    type: EffectType.CreateToken, 
                    tokenBlueprint: { 
                        name: 'Pest', 
                        power: "1", 
                        toughness: "1", 
                        colors: ['B', 'G'], 
                        types: ['Creature', 'Token'], 
                        subtypes: ['Pest'],
                        abilities: [{
                            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Death,
                            effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }]
                        }]
                    } 
                }]
            },
            {
                type: AbilityType.Activated,
                costs: [{ type: 'PayLife', value: 10 }],
                restrictions: [{ type: 'OncePerTurn' }],
                effects: [{ type: EffectType.Untap, targetMapping: TargetMapping.AllLandsYouControl }]
            }
        ]
    };


