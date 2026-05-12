import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const BlueSunsZenith: CardDefinition = {
    name: "Blue Sun's Zenith",
    manaCost: "{X}{U}{U}{U}",
    oracleText: "Target player draws X cards. Shuffle Blue Sun's Zenith into its owner's library.",
    colors: ["U"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Player,
                count: 1
            }],
            effects: [
                {
                    type: EffectType.DrawCards,
                    amount: DynamicAmount.X,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Library,
                    shuffle: true,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    set: "soa",
    scryfall_id: "500a2aa4-712f-41be-920e-f2f448ff83d0",
    image_url: "https://cards.scryfall.io/normal/front/5/0/500a2aa4-712f-41be-920e-f2f448ff83d0.jpg?1562435461",
    rarity: "rare"
};

