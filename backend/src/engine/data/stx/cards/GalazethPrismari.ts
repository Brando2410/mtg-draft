import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const GalazethPrismari: CardDefinition = {
        name: "Galazeth Prismari",
        manaCost: "{2}{U}{R}",
        colors: ["U", "R"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Elder", "Dragon"],
        power: "3",
        toughness: "4",
        keywords: ["Flying"],
        oracleText: "Flying. When Galazeth Prismari enters the battlefield, create a Treasure token. Artifacts you control have '{T}: Add one mana of any color. Spend this mana only to cast an instant or sorcery spell.'",
        abilities: [
            {
                type: AbilityType.Triggered,
                eventMatch: TriggerEvent.EnterBattlefield,
                effects: [{ type: EffectType.CreateToken, tokenBlueprint: { name: 'Treasure', types: ['Artifact', 'Token'], subtypes: ['Treasure'], oracleText: '{T}, Sacrifice this artifact: Add one mana of any color.' } }]
            },
            {
                type: AbilityType.Static,
                effects: [{
                    type: EffectType.AddActivatedAbility, 
                    targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                    restrictions: [{ type: 'Type', value: 'Artifact' }],
                    abilitiesToAdd: [{
                        id: 'galazeth_mana_ability',
                        type: AbilityType.Activated,
                        costs: [{ type: 'Tap', targetMapping: TargetMapping.Self }],
                        effects: [{ 
                            type: EffectType.AddMana, 
                            amount: 1,
                            manaType: 'ANY',
                            manaRestriction: { types: ['Instant', 'Sorcery'] }
                        }]
                    }]
                }]
            }
        ]
    };
