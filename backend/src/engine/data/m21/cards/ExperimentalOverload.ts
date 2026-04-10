import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType } from '@shared/engine_types';

export const ExperimentalOverload: Record<string, ImplementableCard> = {
    "Experimental Overload": {
        name: "Experimental Overload",
        manaCost: "{2}{U}{R}",
        oracleText: "Create an X/X blue and red Weird creature token, where X is the number of instant and sorcery cards in your graveyard. Then you may return an instant or sorcery card from your graveyard to your hand. Exile Experimental Overload.",
        colors: ["red", "blue"],
        supertypes: [],
        types: ["Sorcery"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "experimental_overload_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [
                    {
                        type: EffectType.CreateToken,
                        tokenBlueprint: {
                            name: 'Weird',
                            colors: ['U', 'R'],
                            types: ['Creature'],
                            subtypes: ['Weird'],
                            image_url: 'https://cards.scryfall.io/large/front/d/1/d1fded7b-c97e-43ed-babf-db17d0a6c24a.jpg'
                        },
                        amount: 1,
                        powerOverride: 'INSTANT_SORCERY_IN_GRAVEYARD_COUNT',
                        toughnessOverride: 'INSTANT_SORCERY_IN_GRAVEYARD_COUNT',
                        targetMapping: 'CONTROLLER'
                    },
                    {
                        type: EffectType.Choice,
                        label: 'Choose an instant or sorcery card from your graveyard to return to your hand',
                        targetIdMapping: 'CONTROLLER_GRAVEYARD',
                        restrictions: ['Instant', 'Sorcery'],
                        optional: true,
                        effects: [
                            { type: EffectType.ReturnToHand, targetMapping: 'SELECTED_CARD' }
                        ]
                    },
                    { type: EffectType.Exile, targetMapping: 'SELF' }
                ]
            }
        ]
    }
};
