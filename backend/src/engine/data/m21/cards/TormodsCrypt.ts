import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const TormodsCrypt: Record<string, ImplementableCard> = {
    "Tormod's Crypt": {
        name: "Tormod's Crypt",
        manaCost: "{0}",
        oracleText: "{T}, Sacrifice Tormod's Crypt: Exile all cards from target player's graveyard.",
        colors: [],
        supertypes: [],
        types: ["Artifact"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "tormod_crypt_exile",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [
                    { type: 'Tap' },
                    { type: 'Sacrifice', value: null, targetMapping: 'SELF' }
                ],
                targetDefinition: { type: 'Player', count: 1 },
                effects: [
                    { type: 'ExileAllCards', targetMapping: 'TARGET_1' }
                ]
            }
        ]
    }
};
