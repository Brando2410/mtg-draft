import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const CheerfulOsteomancerRaiseDead: CardDefinition = {
    name: "Cheerful Osteomancer",
    manaCost: "{3}{B}",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Orc", "Warlock"],
    power: "4",
    toughness: "2",
    keywords: ["Prepared"],
    oracleText: "This creature enters prepared.",
    entersPrepared: true,

    preparedFace: {
        name: "Raise Dead",
        manaCost: "{B}",
        colors: ["B"],
        types: ["Sorcery"],
        oracleText: "Return target creature card from your graveyard to your hand.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: { type: 'CardInGraveyard', count: 1, restrictions: ['Creature', 'Yours'] },
                effects: [{ type: EffectType.ReturnToHand, targetMapping: TargetMapping.Target1 }]
            }
        ]
    }
};
