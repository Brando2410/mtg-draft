import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const SedgemoorWitch: ImplementableCard = {
    name: 'Sedgemoor Witch',
    manaCost: '{2}{B}',
    type_line: 'Creature — Human Warlock',
    types: ['Creature'],
    subtypes: ['Human', 'Warlock'],
    power: '3',
    toughness: '2',
    keywords: ['Menace', 'Ward 3 life'],
    colors: ['black'],
    supertypes: [],
    oracleText: 'Menace\nWard — Pay 3 life.\nMagecraft — Whenever you cast or copy an instant or sorcery spell, create a 1/1 black and green Pest creature token with “When this token dies, you gain 1 life.”',
    abilities: [
        {
            id: 'sedgemoor_witch_magecraft',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.CreateToken,
                    amount: 1,
                    tokenBlueprint: {
                        name: 'Pest',
                        power: '1',
                        toughness: '1',
                        colors: ['black', 'green'],
                        types: ['Creature'],
                        subtypes: ['Pest'],
                        oracleText: 'When this creature dies, you gain 1 life.',
                        abilities: [
                            {
                                id: 'pest_token_death',
                                type: AbilityType.Triggered,
                                triggerEvent: TriggerEvent.Death,
                                triggerCondition: (state: any, event: any, source: any) => event.targetId === source.sourceId,
                                effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: 'CONTROLLER' }]
                            }
                        ]
                    }
                }
            ]
        }
    ]
};
