import { AbilityType, ZoneRequirement, TargetMapping, TriggerEvent, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const AdherentofHope: Record<string, ImplementableCard> = {
    "Adherent of Hope": {
        name: "Adherent of Hope",
        manaCost: "{1}{W}",
        oracleText: "At the beginning of combat on your turn, if you control a Basri planeswalker, put a +1/+1 counter on this creature.",
        colors: ["white"],
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
                activeZone: ZoneRequirement.Battlefield,
                    eventMatch: TriggerEvent.BeginningOfCombatStep,
                condition: 'IS_YOUR_TURN && HAS_PERMANENT:Basri,youcontrol',
                effects: [{ type: EffectType.AddCounters, amount: 1, counterType: 'p1p1', targetMapping: TargetMapping.Self }]
            }
        ]
    }
};


