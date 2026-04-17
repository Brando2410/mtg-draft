import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const EliteInterceptorRejoinder: CardDefinition = {
    name: "Elite Interceptor",
    manaCost: "{W}",
    scryfall_id: "2970683e-e69c-42cb-a067-34abd56fb42b",
    image_url: "https://cards.scryfall.io/normal/front/2/9/2970683e-e69c-42cb-a067-34abd56fb42b.jpg?1775936992",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Human", "Wizard"],
    keywords: ["Prepared"],
    oracleText: "This creature enters prepared.",
    power: "1",
    toughness: "2",

    image_url: "https://cards.scryfall.io/png/front/2/9/2970683e-e69c-42cb-a067-34abd56fb42b.png?1775936992",
    entersPrepared: true,
    preparedFace: {
        name: "Rejoinder",
        image_url: "https://cards.scryfall.io/png/front/2/9/2970683e-e69c-42cb-a067-34abd56fb42b.png?1775936992",
        manaCost: "{1}{W}",
        colors: ["W"],
        types: ["Sorcery"],
        oracleText: "You may tap or untap target creature. Draw a card.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: { type: TargetType.Creature, count: 1, minCount: 0, optional: true },
                effects: [
                    {
                        type: CostType.Choice,
                        label: "Tap or untap?",
                        choices: [
                            { label: CostType.Tap, effects: [{ type: CostType.Tap, targetMapping: TargetMapping.Target1 }] },
                            { label: EffectType.Untap, effects: [{ type: EffectType.Untap, targetMapping: TargetMapping.Target1 }] }
                        ]
                    },
                    { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }
                ]
            }
        ]
    }
};
