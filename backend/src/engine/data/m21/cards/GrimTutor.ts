import { CardDefinition, AbilityType, ZoneRequirement, Zone, EffectType, TargetType, TargetMapping } from '@shared/engine_types';

export const GrimTutor: CardDefinition = {
    name: 'Grim Tutor',
    manaCost: '{1}{B}{B}',
    oracleText: 'Search your library for a card, put that card into your hand, then shuffle. You lose 3 life.',
    colors: ['B'],
    types: ['Sorcery'],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetDefinition: { type: TargetType.Card, count: 1 },
                    zone: Zone.Hand,
                },
                { type: EffectType.LoseLife, amount: 3, targetMapping: TargetMapping.Controller }
            ]
        }
    ]
};
