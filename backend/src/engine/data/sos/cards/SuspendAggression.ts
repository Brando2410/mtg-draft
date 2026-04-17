import { AbilityType, CardDefinition, CostType, DurationType, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';
export const SuspendAggression: CardDefinition = {
    name: "Suspend Aggression",
    manaCost: "{1}{W}",
    colors: ["W"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Exile target nonland permanent. Exile the top card of that card's owner's library. Until the end of that player's next turn, its owner may play those cards.",
    type_line: "Instant",

    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                restrictions: [Restriction.NonLand],
                count: 1,
                zone: Zone.Battlefield
            },
            effects: [
                {
                    type: CostType.Exile,
                    targetMapping: TargetMapping.Target1,
                    next: {
                        type: CostType.Exile, // Exile top card of owner's library
                        targetMapping: TargetMapping.Target1Owner,
                        fromTop: 1,
                        sourceZones: ['Library'],
                        next: {
                            type: EffectType.ApplyContinuousEffect,
                            targetMapping: 'PARENT_CONTEXT_EXILED_IDS',
                            duration: { type: DurationType.UntilEndOfTurn, targetMapping: TargetMapping.Target1Owner },
                            targetControllerMapping: 'PARENT_CONTEXT_EXILED_IDS_OWNERS', // Custom mapping for untilTurnOfPlayerId
                            canPlayExiled: true
                        }
                    }
                }
            ]
        }
    ]
};

