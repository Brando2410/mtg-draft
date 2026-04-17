import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const DividebyZero: CardDefinition = {
    name: 'Divide by Zero',
    manaCost: '{2}{U}',
    scryfall_id: "1958d96e-ec44-48ab-80b1-5b01a24ac7b8",
    image_url: "https://cards.scryfall.io/normal/front/1/9/1958d96e-ec44-48ab-80b1-5b01a24ac7b8.jpg?1702134275",
    colors: ['U'],
    types: ['Instant'],
    oracleText: 'Return target spell or permanent with mana value 1 or greater to its owner\'s hand.\nLearn.',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                count: 1,
                type: TargetType.SpellOrPermanent,
                restrictions: ["mv >= 1"]
            },
            effects: [
                { type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.Target1 },
                { type: EffectType.Learn }
            ]
        }
    ]
};

