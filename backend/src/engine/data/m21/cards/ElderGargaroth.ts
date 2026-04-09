import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const ElderGargaroth: Record<string, ImplementableCard> = {
    "Elder Gargaroth": {
        name: "Elder Gargaroth",
        manaCost: "{3}{G}{G}",
        oracleText: "Vigilance, reach, trample\nWhenever this creature attacks or blocks, choose one —\n• Create a 3/3 green Beast creature token.\n• You gain 3 life.\n• Draw a card.",
        colors: ["green"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Beast"],
        power: "6",
        toughness: "6",
        keywords: ["Vigilance"],
        abilities: [
            {
                id: "elder_gargaroth_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ATTACK_OR_BLOCK',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.sourceId === source.sourceId,
                effects: [{
                    type: 'Choice',
                    label: 'Choose a mode for Elder Gargaroth:',
                    choices: [
                        { label: 'Create 3/3 Beast', effects: [{ type: 'CreateToken', tokenBlueprint: { name: 'Beast', power: '3', toughness: '3', colors: ['G'], types: ['Creature'], subtypes: ['Beast'] }, targetMapping: 'CONTROLLER' }] },
                        { label: 'Gain 3 life', effects: [{ type: 'GainLife', amount: 3, targetMapping: 'CONTROLLER' }] },
                        { label: 'Draw a card', effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }] }
                    ]
                }]
            }
        ]
    }
};
