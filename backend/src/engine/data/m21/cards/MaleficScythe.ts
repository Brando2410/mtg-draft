import { CardDefinition, AbilityType, EffectType, TargetType, TargetMapping, CostType, Zone, TriggerEvent } from '@shared/engine_types';

export const MaleficScythe: CardDefinition = {
    name: 'Malefic Scythe',
    manaCost: '{B}',
    scryfall_id: "89e2bc57-8f18-4ba1-a11b-9d69d029f56a",
    image_url: "https://cards.scryfall.io/normal/front/8/9/89e2bc57-8f18-4ba1-a11b-9d69d029f56a.jpg?1594736272",
    colors: ['B'],
    types: ['Artifact'],
    subtypes: ['Equipment'],
    oracleText: 'Equipped creature gets +1/+1 for each soul counter on Malefic Scythe.\nWhenever equipped creature dies, put a soul counter on Malefic Scythe.\nEquip {1}',
    abilities: [
        {
            id: 'malefic_scythe_buff',
            type: AbilityType.Static,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                layer: 7,
                powerModifier: 'SOURCE_COUNTERS:soul',
                toughnessModifier: 'SOURCE_COUNTERS:soul',
                targetMapping: TargetMapping.EnchantedCreature
            }]
        },
        {
            id: 'malefic_scythe_trigger',
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.DeathOther,
            condition: (state: any, event: any, source: any) => {
                // Determine if the creature that died was the one Malefic Scythe was attached to.
                // Equipment triggers on equipped creature death (Rule 603.10).
                const scythe = state.battlefield.find((o: any) => o.id === source.sourceId);
                return scythe && event.targetId === scythe.attachedTo;
            },
            effects: [{
                type: EffectType.AddCounters,
                amount: 1,
                counterType: 'soul',
                targetMapping: TargetMapping.Self
            }]
        },
        {
            id: 'malefic_scythe_equip',
            type: AbilityType.Activated,
            activatedOnlyAsSorcery: true,
            costs: [{ type: CostType.Mana, value: '{1}' }],
            targetDefinition: {
                type: TargetType.Creature,
                restrictions: [
                { type: 'Type', value: 'youcontrol' }
            ]
            },
            effects: [{
                type: EffectType.Attach,
                targetMapping: TargetMapping.Target1
            }]
        }
    ]
};
