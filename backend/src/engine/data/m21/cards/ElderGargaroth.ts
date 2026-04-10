import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType } from "@shared/engine_types";

const gargarothChoice = (idSuffix: string) => ({
    id: `gargaroth_${idSuffix}_trigger`,
    type: AbilityType.Triggered,
    triggerEvent: idSuffix === 'attack' ? 'ON_ATTACK' : 'ON_BLOCK',
    activeZone: ZoneRequirement.Battlefield,
    triggerCondition: (state: any, event: any, source: any) => event.sourceId === source.id,
    effects: [{
        type: EffectType.Choice,
        choices: [
            {
                label: "Create a 3/3 green Beast creature token",
                effects: [{
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Beast', power: '3', toughness: '3', colors: ['G'],
                        types: ['Creature'], subtypes: ['Beast'],
                        image_url: 'https://cards.scryfall.io/large/front/d/e/ded254ec-1d94-4458-944c-329a4305ee4c.jpg'
                    },
                    amount: 1,
                    targetMapping: 'CONTROLLER'
                }]
            },
            {
                label: "You gain 3 life",
                effects: [{ type: EffectType.GainLife, amount: 3, targetMapping: 'CONTROLLER' }]
            },
            {
                label: "Draw a card",
                effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ],
        targetMapping: 'CONTROLLER'
    }]
});

export const ElderGargaroth: Record<string, ImplementableCard> = {
    "Elder Gargaroth": {
        name: "Elder Gargaroth",
        manaCost: "{3}{G}{G}",
        oracleText: "Vigilance, reach, trample\nWhenever Elder Gargaroth attacks or blocks, choose one —\n• Create a 3/3 green Beast creature token.\n• You gain 3 life.\n• Draw a card.",
        colors: ["green"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Beast"],
        power: "6",
        toughness: "6",
        keywords: ["Vigilance", "Reach", "Trample"],
        abilities: [
            gargarothChoice('attack'),
            gargarothChoice('block')
        ]
    }
};
