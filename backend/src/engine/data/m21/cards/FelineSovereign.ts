import { AbilityType, CardDefinition, EffectType, GameEvent, GameObject, TargetType, Zone } from '@shared/engine_types';

export const FelineSovereign: CardDefinition = {
        name: "Feline Sovereign",
        manaCost: "{2}{G}",
        oracleText: "Other Cats you control get +1/+1 and have protection from Dogs.\nWhenever one or more Cats you control deal combat damage to a player, destroy up to one target artifact or enchantment that player controls.",
        colors: ["green"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Cat"],
        power: "2",
        toughness: "3",
        keywords: [],
        abilities: [
            {
                id: "feline_sovereign_lord",
                type: AbilityType.Static,
                activeZone: Zone.Battlefield,
                effects: [
                    { type: 'ApplyContinuousEffect', powerModifier: 1, toughnessModifier: 1, targetMapping: 'MATCHING_PERMANENTS_YOU_CONTROL', restrictions: ['Other', 'Cat'], layer: 7 },
                    { type: 'ApplyContinuousEffect', abilitiesToAdd: ['Protection from Dogs'], targetMapping: 'MATCHING_PERMANENTS_YOU_CONTROL', restrictions: ['Other', 'Cat'], layer: 6 }
                ]
            },
            {
                id: "feline_sovereign_trigger",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_DAMAGE_PLAYER',
                activeZone: Zone.Battlefield,
                condition: (state: any, event: any, source: any) => {
                    if (!event.data?.isCombat) return false;
                    const attacker = state.battlefield.find((o: any) => o.id === event.sourceId);
                    return attacker && attacker.controllerId === source.controllerId && attacker.definition.subtypes.some((s: any) => s.toLowerCase() === 'cat');
                },
                targetDefinition: { type: 'Permanent', count: 1, optional: true, restrictions: ['ArtifactOrEnchantment', 'OpponentControls'] },
                effects: [{ type: 'Destroy', targetMapping: 'TARGET_1' }]
            }
        ]
    };




