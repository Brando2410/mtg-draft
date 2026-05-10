import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const PrismariCommand: CardDefinition = {
    name: 'Prismari Command',
    manaCost: '{1}{U}{R}',
    colors: ['U', 'R'],
    types: ['Instant'],
    oracleText: 'Choose two —\n• Prismari Command deals 2 damage to any target.\n• Target player draws two cards, then discards two cards.\n• Create a Treasure token.\n• Destroy target artifact.',
    abilities: [{
        type: AbilityType.Spell,
        effects: [{
            type: EffectType.Choice,
            label: 'Choose two',
            minChoices: 2,
            maxChoices: 2,
            choices: [
                {
                    label: 'Deal 2 damage to any target',
                    targetDefinitions: [{ count: 1, type: TargetType.AnyTarget }],
                    effects: [{ type: EffectType.DealDamage, amount: 2, targetMapping: TargetMapping.Target1 }]
                },
                {
                    label: 'Target player draws 2, discards 2',
                    targetDefinitions: [{ count: 1, type: TargetType.Player }],
                    effects: [{ type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Target1 }, { type: EffectType.DiscardCards, amount: 2, targetMapping: TargetMapping.Target1 }]
                },
                {
                    label: 'Create a Treasure token',
                    effects: [{
                        type: EffectType.CreateToken,
                        tokenBlueprint: {
                            name: 'Treasure',
                            colors: [],
                            types: ['Artifact'],
                            subtypes: ['Treasure'],
                            abilities: {
                                type: AbilityType.Activated,
                                id: '{T}, Sacrifice this artifact: Add one mana of any color.',
                                isManaAbility: true,
                                costs: [{ type: CostType.Tap }, { type: CostType.SacrificeSelf }],
                                effects: [{ type: EffectType.AddMana, manaType: 'ANY' }]
                            }
                        }
                    }]
                },
                {
                    label: 'Destroy target artifact',
                    targetDefinitions: [{ count: 1, type: TargetType.Artifact }],
                    effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
                }
            ]
        }]
    }],
    scryfall_id: "372d0c0b-439c-413f-aac4-5174c75aadb0",
    image_url: "https://cards.scryfall.io/normal/front/3/7/372d0c0b-439c-413f-aac4-5174c75aadb0.jpg?1775941859",
    rarity: "rare"
};

