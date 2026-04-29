import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from '@shared/engine_types';
export const NoxiousNewt: CardDefinition = {
    name: "Noxious Newt",
    manaCost: "{1}{G}",
    scryfall_id: "3a028306-c5d7-4f8f-b6f4-0d103fd47000",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/3/a/3a028306-c5d7-4f8f-b6f4-0d103fd47000.jpg?1775938060",
    colors: [
        "G"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Salamander"
    ],
    keywords: ["Deathtouch"],
    oracleText: "Deathtouch\n{T}: Add {G}.",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            isManaAbility: true,
            effects: [
                {
                    type: EffectType.AddMana,
                    manaType: 'G',
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    power: "1",
    toughness: "2"
};

