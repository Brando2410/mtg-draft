import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const AdherentofHope: CardDefinition = {
    name: "Adherent of Hope",
    manaCost: "{1}{W}",
    oracleText: "At the beginning of combat on your turn, if you control a Basri planeswalker, put a +1/+1 counter on this creature.",
    colors: ["W"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Human", "Soldier"],
    power: "2",
    toughness: "1",
    keywords: [],
    abilities: [
        {
            id: "adherent_hope_combat",
            type: AbilityType.Triggered,
            activeZone: Zone.Battlefield,
            eventMatch: TriggerEvent.BeginningOfCombatStep,
            condition: 'IS_YOUR_TURN && HAS_PERMANENT:Basri,youcontrol',
            effects: [{ type: EffectType.AddCounters, amount: 1, counterType: 'p1p1', targetMapping: TargetMapping.Self }]
        }
    ]

};



