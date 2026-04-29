import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const PillardropRescuer: CardDefinition = {
    name: 'Pillardrop Rescuer',
    manaCost: '{4}{W}',
    colors: ['W'],
    types: ['Creature'],
    subtypes: ['Spirit', 'Cleric'],
    power: "2",
    toughness: "2",
    keywords: ['Flying'],
    oracleText: 'Flying\nWhen Pillardrop Rescuer enters the battlefield, return target creature card with mana value 3 or less from your graveyard to your hand.',
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: {
                count: 1,
                type: TargetType.CardInGraveyard,
                restrictions: [Restriction.Creature, Restriction.ManaValue3OrLess, Restriction.YouControl]
            },
            effects: [{ type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.Target1 }]
        }
    ]
};

