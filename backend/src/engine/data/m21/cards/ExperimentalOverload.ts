import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const ExperimentalOverload: CardDefinition = {
    name: "Experimental Overload",
    manaCost: "{2}{U}{R}",
    oracleText: "Create an X/X blue and red Weird creature token, where X is the number of instant and sorcery cards in your graveyard. Then you may return an instant or sorcery card from your graveyard to your hand. Exile Experimental Overload.",
    colors: ["U", "R"],
    types: ["Sorcery"],
    exileOnResolution: true,
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Weird',
                        colors: ['U', 'R'],
                        types: ['Creature'],
                        subtypes: ['Weird'],
                        power: 0,
                        toughness: 0
                    },
                    powerOverride: (state: any, source: any) => {
                        const graveyard = state.players[source.controllerId].graveyard;
                        return graveyard.filter((c: any) =>
                            c.definition.types.includes('Instant') || c.definition.types.includes('Sorcery')
                        ).length;
                    },
                    toughnessOverride: (state: any, source: any) => {
                        const graveyard = state.players[source.controllerId].graveyard;
                        return graveyard.filter((c: any) =>
                            c.definition.types.includes('Instant') || c.definition.types.includes('Sorcery')
                        ).length;
                    },
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.Choice,
                    label: "You may return an instant or sorcery card from your graveyard to your hand",
                    optional: true,
                    targetDefinition: {
                        type: TargetType.CardInGraveyard,
                        count: 1,
                        restrictions: [
                            { type: 'Any', restrictions: ['Instant', 'Sorcery'] },
                            'YouControl'
                        ]
                    },
                    effects: [
                        { type: EffectType.ReturnToHand, targetMapping: TargetMapping.Target1 }
                    ],
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};


