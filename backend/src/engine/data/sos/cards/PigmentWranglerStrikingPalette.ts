import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const PigmentWranglerStrikingPalette: CardDefinition = {
    name: "Pigment Wrangler // Striking Palette",
    manaCost: "{4}{R}",
    scryfall_id: "c2faf4cf-c4b6-4721-ac06-0e045dd9704a",
    image_url: "https://cards.scryfall.io/normal/front/c/2/c2faf4cf-c4b6-4721-ac06-0e045dd9704a.jpg?1775937841",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Orc", "Sorcerer"],
    keywords: ["Flying", "Prepared"],
    oracleText: "Flying\nThis creature enters prepared.",
    power: "4",
    toughness: "4",

    entersPrepared: true,
    image_url: "https://cards.scryfall.io/png/front/c/2/c2faf4cf-c4b6-4721-ac06-0e045dd9704a.png?1775937841",
    preparedFace: {
        name: "Striking Palette",
        image_url: "https://cards.scryfall.io/png/front/c/2/c2faf4cf-c4b6-4721-ac06-0e045dd9704a.png?1775937841",
        manaCost: "{R}",
        colors: ["R"],
        types: ["Sorcery"],
        oracleText: "When you next cast an instant or sorcery spell this turn, copy that spell. You may choose new targets for the copy.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.CreateDelayedTrigger,
                        eventMatch: TriggerEvent.CastInstantOrSorcery,
                        duration: { type: DurationType.UntilEndOfTurn },
                        effects: [
                            {
                                type: EffectType.CopySpellOnStack,
                                chooseNewTargets: true,
                                targetMapping: TargetMapping.TriggerEventSource
                            }
                        ]
                    }
                ]
            }
        ]
    }
};
    
