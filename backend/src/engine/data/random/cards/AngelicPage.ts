import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const AngelicPage: Record<string, ImplementableCard> = {
    "Angelic Page": {
        name: "Angelic Page",
        manaCost: "{1}{W}",
        oracleText: "Flying\n{T}: Target attacking or blocking creature gets +1/+1 until end of turn.",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Angel","Spirit"],
        power: "1",
        toughness: "1",
        keywords: ["Flying"],
        set: "JMP",
        abilities: [
            {
                id: "angelic_page_buff",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Tap', value: null }],
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'AttackingOrBlocking'] },
                effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', powerModifier: 1, toughnessModifier: 1, layer: 7, targetMapping: 'TARGET_1' }]
            }
        ]
    }
};
