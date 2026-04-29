import { AbilityType, CardDefinition, CostType, DynamicAmount, EffectType, Restriction, TargetMapping, Zone } from '@shared/engine_types';
export const FixWhatsBroken: CardDefinition = {
    name: "Fix What's Broken",
    manaCost: "{2}{W}{B}",
    scryfall_id: "c0cd1d71-8e4a-4e00-80cd-83aec231fa57",
    rarity: "rare",
    image_url: "https://cards.scryfall.io/normal/front/c/0/c0cd1d71-8e4a-4e00-80cd-83aec231fa57.jpg?1775938304",
    colors: ["B", "W"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "As an additional cost to cast this spell, pay X life.\nReturn each artifact and creature card with mana value X from your graveyard to the battlefield.",
    abilities: [
        {
            type: AbilityType.Spell,
            costs: [{ type: CostType.PayLife, value: DynamicAmount.X }],
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Battlefield,
                    targetMapping: TargetMapping.MatchingCards,
                    restrictions: [
                        Restriction.ArtifactOrCreature,
                        Restriction.Graveyard,
                        Restriction.YouControl,
                        "mv == x"
                    ]
                }
            ]
        }
    ]
};
