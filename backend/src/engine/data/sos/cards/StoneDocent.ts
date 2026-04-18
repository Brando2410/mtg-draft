import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, Zone } from '@shared/engine_types';
export const StoneDocent: CardDefinition = {
    name: "Stone Docent",
    manaCost: "{1}{W}",
    scryfall_id: "c2abfffb-bf36-44af-9a27-6e109e4d77dd",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/c/2/c2abfffb-bf36-44af-9a27-6e109e4d77dd.jpg?1775937164",
    colors: [
        "W"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Spirit",
        "Chimera"
    ],
    keywords: [],
    oracleText: "{W}, Exile this card from your graveyard: You gain 2 life. Surveil 1. Activate only as a sorcery. (Look at the top card of your library. You may put it into your graveyard.)",
    abilities: [
        {
            type: AbilityType.Activated,
            activatedOnlyAsSorcery: true,
            costs: [
                { type: CostType.Mana, value: '{W}' },
                { type: CostType.ExileSelf }
            ],
            activeZone: Zone.Graveyard,
            effects: [
                {
                    type: EffectType.GainLife,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.Surveil,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ],
        }
    ],
    power: "3",
    toughness: "1"
};
