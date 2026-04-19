import { AbilityType, CardDefinition, EffectType, TargetType, Zone } from "@shared/engine_types";

export const FinishingBlow: CardDefinition = {
        name: "Finishing Blow",
        manaCost: "{4}{B}",
    scryfall_id: "2b85a552-2119-4d9c-b7c1-c09c2d9f2f38",
    image_url: "https://cards.scryfall.io/normal/front/2/b/2b85a552-2119-4d9c-b7c1-c09c2d9f2f38.jpg?1594736130",
        oracleText: "Destroy target creature or planeswalker.",
        colors: ["black"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: "",
        toughness: "",
        keywords: [],
        abilities: [
            {
                id: "finishing_blow_spell",
                type: AbilityType.Spell,
                activeZone: Zone.Hand,
                targetDefinition: {
                    type: TargetType.Permanent,
                    count: 1,
                    restrictions: [
                { type: 'Type', value: 'creature' },
                { type: 'Type', value: 'planeswalker' }
            ]
                },
                effects: [
                    {
                        type: EffectType.Destroy,
                        targetMapping: "TARGET_1"
                    }
                ],
                oracleText: "Destroy target creature or planeswalker."
            }
        ]
    };

