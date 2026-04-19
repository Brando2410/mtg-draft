import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const AnointedChorister: CardDefinition = {

    name: "Anointed Chorister",
    manaCost: "{W}",
    scryfall_id: "9c977c67-b0c0-40b0-b129-28de094aaf40",
    image_url: "https://cards.scryfall.io/normal/front/9/c/9c977c67-b0c0-40b0-b129-28de094aaf40.jpg?1594734721",
    oracleText: "Lifelink (Damage dealt by this creature also causes you to gain that much life.)\n{4}{W}: This creature gets +3/+3 until end of turn.",
    colors: ["W"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Human", "Cleric"],
    power: "1",
    toughness: "1",
    keywords: ["Lifelink"],
    abilities: [
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [{ type: 'Mana', value: '{4}{W}' }],
            effects: [{ type: EffectType.ApplyContinuousEffect, powerModifier: 3, toughnessModifier: 3, duration: { type: DurationType.UntilEndOfTurn }, layer: 7, targetMapping: TargetMapping.Self }]
        }
    ]

};

