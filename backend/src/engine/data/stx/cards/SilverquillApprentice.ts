import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const SilverquillApprentice: CardDefinition = {
    name: "Silverquill Apprentice",
    manaCost: "{1}{W}",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Human", "Duelist"], // Scryfall: Human Duelist,
    power: "2",
    toughness: "2",
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, target creature gets +1/+0 until end of turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Magecraft,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1
            }],
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                powerModifier: 1,
                duration: { type: DurationType.UntilEndOfTurn },
                targetMapping: TargetMapping.Target1
            }]
        }
    ],
    scryfall_id: "42d0770e-9084-4aa7-b543-2b6ba18378dc",
    image_url: "https://cards.scryfall.io/normal/front/4/2/42d0770e-9084-4aa7-b543-2b6ba18378dc.jpg?1624739992",
    rarity: "uncommon"
};

