import { AbilityType, CardDefinition, EffectType, TargetType, TriggerEvent, TargetMapping } from '@shared/engine_types';

export const FelineSovereign: CardDefinition = {
    name: "Feline Sovereign",
    manaCost: "{2}{G}",
    scryfall_id: "84a9485a-d356-4cbe-b257-b62008a21328",
    image_url: "https://cards.scryfall.io/normal/front/8/4/84a9485a-d356-4cbe-b257-b62008a21328.jpg?1594736953",
    oracleText: "Other Cats you control get +1/+1 and have protection from Dogs.\nWhenever one or more Cats you control deal combat damage to a player, destroy up to one target artifact or enchantment that player controls.",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Cat"],
    power: "2",
    toughness: "3",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    toughnessModifier: 1,
                    targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                    restrictions: [
                        { type: 'Identity', value: 'Other' },
                        { type: 'Type', value: 'Cat' }
                    ],
                    layer: 7
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    abilitiesToAdd: ['Protection from Dogs'],
                    targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                    restrictions: [
                        { type: 'Identity', value: 'Other' },
                        { type: 'Type', value: 'Cat' }
                    ],
                    layer: 6
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.DamageDealtToPlayer,
            condition: (state: any, event: any, source: any) => {
                if (!event.data?.isCombat) return false;
                const attacker = state.battlefield.find((o: any) => o.id === event.sourceId);
                return attacker && attacker.controllerId === source.controllerId && attacker.definition.subtypes.some((s: any) => s.toLowerCase() === 'cat');
            },
            targetDefinition: {
                type: TargetType.ArtifactOrEnchantment,
                count: 1,
                optional: true,
                restrictions: [
                    { type: 'Control', value: 'Opponent' }
                ]
            },
            effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
        }
    ]
};
