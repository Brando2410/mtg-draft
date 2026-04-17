import { AbilityType, CardDefinition, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const EurekaMoment: CardDefinition = {
    name: 'Eureka Moment',
    manaCost: '{2}{G}{U}',
    scryfall_id: "e400c9b7-c789-49dd-9f72-b9d1df03fcca",
    image_url: "https://cards.scryfall.io/normal/front/e/4/e400c9b7-c789-49dd-9f72-b9d1df03fcca.jpg?1771242160",
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
                            restrictions: ['Land']
                        }]
                    }]
                }
            ]
        }
    ]
};
