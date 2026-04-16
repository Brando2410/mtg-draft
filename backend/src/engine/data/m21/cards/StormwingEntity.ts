import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const StormwingEntity: CardDefinition = {
    name: "Stormwing Entity",
    manaCost: "{3}{U}{U}",
    oracleText: "This spell costs {2}{U} to cast if you've cast an instant or sorcery spell this turn.\nFlying\nWhen this creature enters, scry 2.\nProwess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Elemental", "Siren"],
    power: "3",
    toughness: "3",
    keywords: ["Flying", "Prowess"],
    abilities: [
        {
            type: AbilityType.Static,
            activeZone: Zone.Hand,
            effects: [
                {
                    type: EffectType.CostReduction,
                    targetMapping: TargetMapping.Self,
                    manaReduction: '{1}{U}',
                    condition: 'CAST_INSTANT_SORCERY_THIS_TURN'
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            activeZone: Zone.Battlefield,
            effects: [{ type: EffectType.Scry, amount: 2, targetMapping: TargetMapping.Controller }]
        }
    ]
};




