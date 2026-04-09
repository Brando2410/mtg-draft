import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const BasrisLieutenant: Record<string, ImplementableCard> = {
    "Basri's Lieutenant": {
        name: "Basri's Lieutenant",
        manaCost: "{3}{W}",
        oracleText: "Vigilance, protection from multicolored\nWhen this creature enters, put a +1/+1 counter on target creature you control.\nWhenever this creature or another creature you control dies, if it had a +1/+1 counter on it, create a 2/2 white Knight creature token with vigilance.",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Human","Knight"],
        power: "3",
        toughness: "4",
        keywords: ["Vigilance"],
        abilities: [
            {
                id: "basri_lieutenant_etb",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                // Rule 603.2: ETB usually triggers only for the object itself unless specified.
                triggerCondition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'YouControl'] },
                effects: [{ type: 'AddCounters', amount: 1, value: '+1/+1', targetMapping: 'TARGET_1' }]
            },
            {
                id: "basri_lieutenant_death_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_DEATH',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    const diedObj = event.data?.object;
                    if (!diedObj) return false;

                    // 1. Must be a creature (Rule 700.4)
                    const isCreature = (diedObj.definition?.types || []).some((t: string) => t.toLowerCase() === 'creature');
                    // 2. Must be controlled by the same player who controls this Lieutenant
                    const isController = diedObj.controllerId === source.controllerId;
                    // 3. Must have had a +1/+1 counter OR be the Lieutenant itself (Rule 603.10)
                    const hadCounter = (diedObj.counters || {})['+1/+1'] > 0;
                    const isSelf = diedObj.id === source.sourceId;

                    return isCreature && isController && (hadCounter || isSelf);
                },
                effects: [{
                    type: 'CreateToken',
                    tokenBlueprint: {
                        name: 'Knight', power: '2', toughness: '2', colors: ['W'],
                        types: ['Creature'], subtypes: ['Knight'], keywords: ['Vigilance'],
                        image_url: 'https://cards.scryfall.io/large/front/2/0/204b3adf-e76b-4ce9-b84d-b4e65b7054d4.jpg'
                    },
                    amount: 1,
                    targetMapping: 'CONTROLLER'
                }]
            }
        ]
    }
};
