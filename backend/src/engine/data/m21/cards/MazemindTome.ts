import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const MazemindTome: Record<string, ImplementableCard> = {
    "Mazemind Tome": {
        name: "Mazemind Tome",
        manaCost: "{2}",
        oracleText: "{T}, Put a page counter on this artifact: Scry 1. (Look at the top card of your library. You may put that card on the bottom.)\n{2}, {T}, Put a page counter on this artifact: Draw a card.\nWhen there are four or more page counters on this artifact, exile it. If you do, you gain 4 life.",
        colors: [],
        supertypes: [],
        types: ["Artifact"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "mazemind_tome_scry",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Tap', value: null }],
                effects: [
                    { type: 'AddCounters', amount: 1, value: 'page', targetMapping: 'SELF' },
                    { type: 'Scry', amount: 1, targetMapping: 'CONTROLLER' }
                ]
            },
            {
                id: "mazemind_tome_draw",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{2}' }, { type: 'Tap', value: null }],
                effects: [
                    { type: 'AddCounters', amount: 1, value: 'page', targetMapping: 'SELF' },
                    { type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }
                ]
            },
            {
                id: "mazemind_tome_exile_trigger",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_COUNTERS_ADDED',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any) => event.counterType === 'page' && (event.data?.object?.counters['page'] || 0) >= 4,
                effects: [
                    { type: 'Exile', targetMapping: 'SELF' },
                    { type: 'GainLife', amount: 4, targetMapping: 'CONTROLLER' }
                ]
            }
        ]
    }
};


