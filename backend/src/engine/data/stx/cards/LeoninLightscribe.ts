import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const LeoninLightscribe: CardDefinition = {
        name: 'Leonin Lightscribe',
        manaCost: '{1}{W}',
    scryfall_id: "2a465d7b-398c-444b-9eae-331ea2513f6d",
    image_url: "https://cards.scryfall.io/normal/front/2/a/2a465d7b-398c-444b-9eae-331ea2513f6d.jpg?1624589525",
        colors: ['W'],
        types: ['Creature'],
        subtypes: ['Cat', 'Cleric'],
        power: "2",
        toughness: "2",
        oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, creatures you control get +1/+1 until end of turn.',
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Magecraft,
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        targetMapping: TargetMapping.AllCreaturesYouControl,
                        duration: 'UNTIL_END_OF_TURN',
                        powerModifier: 1,
                        toughnessModifier: 1
                    }
                ]
            }
        ]
    };


