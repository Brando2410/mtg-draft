import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const BasicConjuration: CardDefinition = {
        name: 'Basic Conjuration',
        manaCost: '{1}{G}',
        colors: ['G'],
        types: ['Sorcery'],
        subtypes: ['Lesson'],
        oracleText: 'Look at the top six cards of your library. You may reveal a creature card from among them and put it into your hand. Put the rest on the bottom of your library in a random order. You gain 2 life.',
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.LookAtTopAndPick,
                        fromTop: 6,
                        optional: true,
                        restrictions: [
                { type: 'Type', value: 'Creature' }
            ],
                        reveal: true,
                        zone: Zone.Hand,
                        targetMapping: TargetMapping.Controller,
                        remainderZone: Zone.Library,
                        remainderPosition: 'bottom',
                        shuffleRemainder: true
                    },
                    { type: EffectType.GainLife, amount: 2 }
                ]
            }
        ]
    };

