import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType, Zone } from '@shared/engine_types';

export const QuandrixApprentice: ImplementableCard = {
    name: 'Quandrix Apprentice',
    manaCost: '{G}{U}',
    type_line: 'Creature — Human Wizard',
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: '2',
    toughness: '2',
    keywords: [],
    colors: ['green', 'blue'],
    supertypes: [],
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, look at the top three cards of your library. You may reveal a land card from among them and put that card into your hand. Put the rest on the bottom of your library in a random order.',
    abilities: [
        {
            id: 'quandrix_apprentice_magecraft',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.LookAtTopAndPick,
                    fromTop: 3,
                    optional: true,
                    reveal: true,
                    restrictions: ['Land'],
                    destination: Zone.Hand,
                    remainderZone: Zone.Library,
                    remainderPosition: 'bottom',
                    shuffleRemainder: true
                }
            ]
        }
    ]
};
