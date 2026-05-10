import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, Zone } from '@shared/engine_types';

export const EurekaMoment: CardDefinition = {
    name: 'Eureka Moment',
    manaCost: '{2}{G}{U}',

    colors: ['G', 'U'],
    types: ['Instant'],
    oracleText: 'Draw two cards. You may put a land card from your hand onto the battlefield.',
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                { type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Controller },
                {
                    type: EffectType.Choice,
                    label: "Put a land onto the battlefield?",
                    optional: true,
                    choices: [{
                        label: "Put Land",
                        effects: [{
                            type: EffectType.MoveToZone,
                            zone: Zone.Battlefield,
                            sourceZones: [Zone.Hand],
                            targetMapping: TargetMapping.Controller,
                            restrictions: [Restriction.Land]
                        }]
                    }]
                }
            ]
        }
    ],
    scryfall_id: "4d267ed8-e760-4f92-962b-f83dea822c45",
    image_url: "https://cards.scryfall.io/normal/front/4/d/4d267ed8-e760-4f92-962b-f83dea822c45.jpg?1775941743",
    rarity: "common"
};

