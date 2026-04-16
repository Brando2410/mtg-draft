import { AbilityType, CardDefinition, DurationType, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const AlpineHoundmaster: CardDefinition = {
    name: "Alpine Houndmaster",
    manaCost: "{R}{W}",
    oracleText: "When this creature enters, you may search your library for a card named Alpine Watchdog and/or a card named Igneous Cur, reveal them, put them into your hand, then shuffle.\nWhenever this creature attacks, it gets +X/+0 until end of turn, where X is the number of other attacking creatures.",
    colors: ["R", "W"],
    types: ["Creature"],
    subtypes: ["Human", "Warrior"],
    power: "2",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetDefinition: {
                        type: TargetType.Card,
                        count: 2,
                        restrictions: [{ type: 'Any', restrictions: [{ type: 'Name', value: 'Alpine Watchdog' }, { type: 'Name', value: 'Igneous Cur' }] }]
                    },
                    zone: Zone.Hand,
                    reveal: true,
                    optional: true,
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            condition: 'SelfIsAttacking',
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                powerModifier: DynamicAmount.OtherAttackingCreaturesCount,
                duration: { type: DurationType.UntilEndOfTurn },
                targetMapping: TargetMapping.Self
            }]
        }
    ]
};

