import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const DoubleMajor: CardDefinition = {
    name: "Double Major",
    manaCost: "{G}{U}",
    scryfall_id: "c3d35413-8742-4443-8859-93c91112978d",
    image_url: "https://cards.scryfall.io/normal/front/c/3/c3d35413-8742-4443-8859-93c91112978d.jpg?1627428638",
    colors: ['G', 'U'],
    types: ["Instant"],
    oracleText: "Copy target creature spell you control, except the copy isn't legendary if the spell is legendary.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
                restrictions: ['youcontrol']
            },
            effects: [{
                type: EffectType.CopySpellOnStack,
                targetMapping: TargetMapping.Target1,
                isLegendary: false
            }]
        }
    ]
};
