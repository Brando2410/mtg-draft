import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const Revitalize: Record<string, ImplementableCard> = {
    "Revitalize": {
        name: "Revitalize",
        manaCost: "{1}{W}",
        oracleText: "You gain 3 life.\nDraw a card.",
        colors: ["white"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "revitalize_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [
                    { type: 'GainLife', amount: 3, targetMapping: 'CONTROLLER' },
                    { type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }
                ]
            }
        ]
    }
};
