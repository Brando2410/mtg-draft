import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const DragonsguardElite: ImplementableCard = {
    name: 'Dragonsguard Elite',
    manaCost: '{1}{G}',
    type_line: 'Creature — Human Druid',
    types: ['Creature'],
    subtypes: ['Human', 'Druid'],
    power: '2',
    toughness: '2',
    keywords: [],
    colors: ['green'],
    supertypes: [],
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, put a +1/+1 counter on Dragonsguard Elite.\n{4}{G}{G}: Double the number of +1/+1 counters on Dragonsguard Elite.',
    abilities: [
        {
            id: 'dragonsguard_elite_magecraft',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.AddCounters,
                    targetMapping: 'SELF',
                    amount: 1,
                    value: '+1/+1'
                }
            ]
        },
        {
            id: 'dragonsguard_elite_activated',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Mana', value: '{4}{G}{G}' }],
            effects: [
                {
                    type: EffectType.AddCounters,
                    targetMapping: 'SELF',
                    amount: (state: any, source: any) => (source.counters?.['+1/+1'] || 0),
                    value: '+1/+1'
                }
            ]
        }
    ]
};
