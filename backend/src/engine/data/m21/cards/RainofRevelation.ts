import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const RainofRevelation: Record<string, ImplementableCard> = {
    "Rain of Revelation": {
        name: "Rain of Revelation",
        manaCost: "{3}{U}",
        oracleText: "Draw three cards, then discard a card.",
        colors: ["blue"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "rain_revelation_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [
                    { type: 'DrawCards', amount: 3, targetMapping: 'CONTROLLER' },
                    { type: 'DiscardCards', amount: 1, targetMapping: 'CONTROLLER' }
                ]
            }
        ]
    }
};
