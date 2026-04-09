import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const GrimTutor: Record<string, ImplementableCard> = {
    'Grim Tutor': {
        name: 'Grim Tutor',
        manaCost: '{1}{B}{B}',
        oracleText: 'Search your library for a card, put that card into your hand, then shuffle. You lose 3 life.',
        colors: ['black'],
        supertypes: [],
        types: ['Sorcery'],
        subtypes: [],
        power: '',
        toughness: '',
        keywords: [],
        abilities: [
            {
                id: 'grim_tutor_effect',
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [
                    { type: 'SearchLibrary', restrictions: [], destination: Zone.Hand },
                    { type: 'LoseLife', amount: 3, targetMapping: 'CONTROLLER' }
                ]
            }
        ]
    }
};
