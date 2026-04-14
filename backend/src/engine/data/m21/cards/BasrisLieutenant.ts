import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType } from '@shared/engine_types';

export const BasrisLieutenant: Record<string, ImplementableCard> = {
    "Basri's Lieutenant": {
        name: "Basri's Lieutenant",
        manaCost: "{3}{W}",
        oracleText: "Vigilance, protection from multicolored.\nWhen Basri's Lieutenant enters the battlefield, put a +1/+1 counter on target creature you control.\nWhenever Basri's Lieutenant or another creature you control dies, if it had a +1/+1 counter on it, create a 2/2 white Knight creature token with vigilance.",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Human", "Knight"],
        power: "3",
        toughness: "4",
        keywords: ["Vigilance", "Protection from multicolored"],
        abilities: [
            {
                id: "basri_lieutenant_etb",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'YouControl'] },
                effects: [
                    { type: EffectType.AddCounters, amount: 1, counterType: 'p1p1', targetMapping: 'TARGET_1' }
                ]
            },
            {
                id: "basri_lieutenant_death_trigger",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_DEATH',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => {
                    const diedObj = event.data?.object;
                    if (!diedObj) return false;

                    const isCreature = (diedObj.definition?.types || []).some((t: string) => t.toLowerCase() === 'creature');
                    const isControlledByYou = diedObj.controllerId === source.controllerId;
                    const hadCounter = (diedObj.counters?.['p1p1'] || 0) > 0;

                    return isCreature && isControlledByYou && hadCounter;
                },
                effects: [
                    {
                        type: EffectType.CreateToken,
                        tokenBlueprint: {
                            name: 'Knight', power: '2', toughness: '2', colors: ['W'],
                            types: ['Creature'], subtypes: ['Knight'], keywords: ['Vigilance'],
                            image_url: 'https://cards.scryfall.io/large/front/2/0/204b3adf-e76b-4ce9-b84d-b4e65b7054d4.jpg'
                        },
                        amount: 1,
                        targetMapping: 'CONTROLLER'
                    }
                ]
            }
        ]
    }
};


