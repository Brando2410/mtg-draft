import { AbilityType, CardDefinition, EffectType, TargetMapping, Zone } from '@shared/engine_types';
    export const ZimonesExperiment: CardDefinition = {
    name: "Zimone's Experiment",
    manaCost: "{3}{G}",
    colors: [
        "G"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Look at the top five cards of your library. You may reveal up to two creature and/or land cards from among them, then put the rest on the bottom of your library in a random order. Put all land cards revealed this way onto the battlefield tapped and put all creature cards revealed this way into your hand.",
    abilities: [
        {
            id: "zimones_experiment_spell",
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.LookAtTopAndPick,
                    targetMapping: TargetMapping.Controller,
                    fromTop: 5,
                    reveal: true,
                    optional: true,
                    amount: 2, // Up to two
                    restrictions: [
                { type: 'Type', value: 'Creature' },
                { type: 'Type', value: 'Land' }
            ],
                    remainderZone: Zone.Library,
                    remainderPosition: 'bottom',
                    shuffleRemainder: true,
                    onSelected: (card: any) => {
                        const types = card.definition.types.map((t: string) => t.toLowerCase());
                        if (types.includes('land')) {
                            return [{ type: EffectType.MoveToZone, targetId: card.id, zone: Zone.Battlefield, tapped: true }];
                        }
                        if (types.includes('creature')) {
                            return [{ type: EffectType.MoveToZone, targetId: card.id, zone: Zone.Hand }];
                        }
                        return [];
                    }
                }
            ]
        }
    ]
};
    