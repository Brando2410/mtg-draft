import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const ReconstructHistory: CardDefinition = {
    name: 'Reconstruct History',
    manaCost: '{2}{W}{R}',
    colors: ['W', 'R'],
    types: ['Sorcery'],
    oracleText: 'Return up to one target artifact card, up to one target enchantment card, up to one target instant card, up to one target sorcery card, and up to one target planeswalker card from your graveyard to your hand. Exile Reconstruct History.',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                count: 5,
                minCount: 0,
                optional: true,
                type: TargetType.CardInGraveyard,
                perTargetRestrictions: [
                    [{ type: 'Type', value: 'Artifact' }],
                    [{ type: 'Type', value: 'Enchantment' }],
                    [{ type: 'Type', value: 'Instant' }],
                    [{ type: 'Type', value: 'Sorcery' }],
                    [{ type: 'Type', value: 'Planeswalker' }]
                ]
            },
            effects: [
                { type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.TargetAll },
                { type: EffectType.Exile, targetMapping: TargetMapping.Self }
            ]
        }
    ]
  };

