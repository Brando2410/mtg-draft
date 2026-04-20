import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const DefendtheCampus: CardDefinition = {
    name: 'Defend the Campus',
    manaCost: '{1}{W}',
    scryfall_id: "85e4e1b5-77d6-4af4-b22e-6f6b4d129f5d",
    image_url: "https://cards.scryfall.io/normal/front/8/5/85e4e1b5-77d6-4af4-b22e-6f6b4d129f5d.jpg?1624589309",
    colors: ['W'],
    types: ['Instant'],
    oracleText: 'Choose one —\n• Creatures you control get +1/+1 until end of turn.\n• Destroy target creature with power 4 or greater.',
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [{
                type: EffectType.Choice,
                choices: [
                    {
                        label: "+1/+1 to your creatures",
                        effects: [{ type: EffectType.ApplyContinuousEffect, targetMapping: TargetMapping.AllCreaturesYouControl, duration: { type: DurationType.UntilEndOfTurn }, powerModifier: 1, toughnessModifier: 1 }]
                    },
                    {
                        label: "Destroy target creature with power 4 or greater",
                        targetDefinition: { count: 1, type: TargetType.Creature, restrictions: [Restriction.Power4OrGreater] },
                        effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
                    }
                ]
            }]
        }
    ]
};
