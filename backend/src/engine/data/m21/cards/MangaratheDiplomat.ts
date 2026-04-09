import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const MangaratheDiplomat: Record<string, ImplementableCard> = {
    "Mangara, the Diplomat": {
        name: "Mangara, the Diplomat",
        manaCost: "{3}{W}",
        oracleText: "Lifelink\nWhenever an opponent attacks with creatures, if two or more of those creatures are attacking you and/or planeswalkers you control, draw a card.\nWhenever an opponent casts their second spell each turn, draw a card.",
        colors: ["white"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Human","Cleric"],
        power: "2",
        toughness: "4",
        keywords: ["Lifelink"],
        abilities: [
            {
                id: "mangara_attack_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ATTACKERS_DECLARED',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    // "Whenever an opponent attacks with creatures..."
                    const isOpponent = event.playerId !== source.controllerId;
                    if (!isOpponent) return false;

                    // "...if two or more of those creatures are attacking you and/or planeswalkers you control..."
                    const myPlaneswalkers = state.battlefield
                        .filter((o: any) => o.controllerId === source.controllerId && (o.definition.types || []).includes('Planeswalker'))
                        .map((o: any) => o.id);

                    const attackingMeOrMyPWs = (event.data.attackers || []).filter((a: any) =>
                        a.targetId === source.controllerId || myPlaneswalkers.includes(a.targetId)
                    );

                    return attackingMeOrMyPWs.length >= 2;
                },
                effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "mangara_second_spell_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_SECOND_SPELL_CAST',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    // "Whenever an opponent casts their second spell each turn..."
                    return event.playerId !== source.controllerId;
                },
                effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};
