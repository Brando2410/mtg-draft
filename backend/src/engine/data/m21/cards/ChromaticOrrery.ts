import { AbilityType, EffectType, CardDefinition, TargetMapping, CostType } from "@shared/engine_types";

export const ChromaticOrrery: CardDefinition = {
    name: "Chromatic Orrery",
    manaCost: "{7}",
    scryfall_id: "3af78d76-ad5c-44ba-880d-b834bcde5398",
    image_url: "https://cards.scryfall.io/normal/front/3/a/3af78d76-ad5c-44ba-880d-b834bcde5398.jpg?1594737470",
    oracleText: "You may spend mana as though it were mana of any color.\n{T}: Add {C}{C}{C}{C}{C}.\n{5}, {T}: Draw a card for each color among permanents you control.",
    colors: [],
    supertypes: [],
    types: ["Artifact"],
    subtypes: [],
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.AllowSpendManaAsAnyColor,
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Activated,
            isManaAbility: true,
            costs: [
                { type: CostType.Tap }
            ],
            effects: [
                {
                    type: EffectType.AddMana,
                    value: '{C}{C}{C}{C}{C}',
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{5}' },
                { type: CostType.Tap }
            ],
            effects: [
                {
                    type: EffectType.DrawCards,
                    // Functional counting for colors among permanents you control
                    amount: (state: any, source: any) => {
                        const colors = new Set<string>();
                        state.battlefield.filter((o: any) => o.controllerId === source.controllerId).forEach((o: any) => {
                            (o.definition.colors || []).forEach((c: string) => colors.add(c));
                        });
                        return colors.size;
                    },
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};

