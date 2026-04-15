import { AbilityType, CardDefinition, Zone, TargetMapping, TargetType, Restriction } from '@shared/engine_types';

export const SuspendAggression: CardDefinition = {
    name: "Suspend Aggression",
    manaCost: "{1}{W}",
    colors: ["W"],
    type_line: "Instant",
    types: ["Instant"],
    oracleText: "Exile target nonland permanent. Exile the top card of that card's owner's library. Until the end of that player's next turn, its owner may play those cards.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Permanent,
                restrictions: [Restriction.NonLand],
                count: 1,
                zone: Zone.Battlefield
            },
            effects: [
                {
                    type: 'Exile',
                    targetMapping: TargetMapping.Target1,
                    next: {
                        type: 'Exile', // Exile top card of owner's library
                        targetMapping: 'TARGET_1_OWNER',
                        fromTop: 1,
                        sourceZones: [Zone.Library],
                        next: {
                            type: 'ApplyContinuousEffect',
                            targetMapping: 'PARENT_CONTEXT_EXILED_IDS',
                            duration: 'UntilEndOfYourNextTurn',
                            targetControllerMapping: 'PARENT_CONTEXT_EXILED_IDS_OWNERS', // Custom mapping for untilTurnOfPlayerId
                            canPlayExiled: true
                        }
                    }
                }
            ]
        }
    ]
};


