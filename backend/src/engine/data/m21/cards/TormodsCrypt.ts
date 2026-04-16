import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const TormodsCrypt: CardDefinition = {
    name: "Tormod's Crypt",
    manaCost: "{0}",
    oracleText: "{T}, Sacrifice Tormod's Crypt: Exile all cards from target player's graveyard.",
    colors: [],
    types: ["Artifact"],
    abilities: [
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [
                { type: EffectType.Tap },
                { type: EffectType.Sacrifice, targetMapping: TargetMapping.Self }
            ],
            targetDefinition: {
                type: TargetType.Player,
                count: 1
            },
            effects: [
                {
                    type: EffectType.ExileAllCards,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};


