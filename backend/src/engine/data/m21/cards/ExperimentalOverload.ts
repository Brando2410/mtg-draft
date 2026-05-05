import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping } from '@shared/engine_types';

export const ExperimentalOverload: CardDefinition = {
    name: "Experimental Overload",
    manaCost: "{2}{U}{R}",
    scryfall_id: "6f1bace4-a327-4eb6-a6ef-8394e76c06b7",
    image_url: "https://cards.scryfall.io/normal/front/6/f/6f1bace4-a327-4eb6-a6ef-8394e76c06b7.jpg?1594737377",
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
                        image_url: 'https://cards.scryfall.io/large/front/0/b/0ba503b6-9fa0-482f-870f-ac95ee03893c.jpg?1594733724',
                        power: 0,
                        toughness: 0
                    },
                    powerOverride: 'INSTANT_SORCERY_IN_GRAVEYARD_COUNT',
                    toughnessOverride: 'INSTANT_SORCERY_IN_GRAVEYARD_COUNT',
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.Choice,
                    label: "Return an instant or sorcery card from your graveyard to your hand?",
                    optional: true,
                    minChoices: 0,
                    maxChoices: 1,
                    selectionPool: TargetMapping.ControllerGraveyard,
                    restrictions: [Restriction.InstantOrSorcery],
                    effects: [{ type: EffectType.ReturnToHand }]
                }
            ]
        }
    ]
};
