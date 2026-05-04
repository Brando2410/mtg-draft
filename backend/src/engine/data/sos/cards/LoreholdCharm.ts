import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const LoreholdCharm: CardDefinition = {
    name: "Lorehold Charm",
    manaCost: "{R}{W}",
    scryfall_id: "5fe70295-e550-4577-a341-dab6c25aabfd",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/5/f/5fe70295-e550-4577-a341-dab6c25aabfd.jpg?1775938389",
    colors: ["R", "W"],
    types: ["Instant"],
    oracleText: "Choose one —\n• Each opponent sacrifices a nontoken artifact.\n• Return target artifact or creature card with mana value 2 or less from your graveyard to the battlefield.\n• Creatures you control get +1/+1 and gain trample until end of turn.",
    abilities: [
        {
            type: AbilityType.Spell,
            modes: [
                {

                    label: "Each opponent sacrifices a nontoken artifact",
                    effects: [
                        {
                            type: EffectType.Sacrifice,
                            targetMapping: TargetMapping.EachOpponent,
                            restrictions: [
                                Restriction.Artifact,
                                Restriction.NonToken
                            ]
                        }
                    ]
                },
                {
                    label: "Return target artifact or creature with MV 2 or less from your graveyard",
                    targetDefinitions: [{
                        type: TargetType.CardInGraveyard,
                        count: 1,
                        restrictions: [
                            Restriction.ArtifactOrCreature,
                            Restriction.ManaValue2OrLess,
                            Restriction.YouOwn
                        ]
                    }],
                    effects: [
                        {
                            type: EffectType.PutOnBattlefield,
                            zone: Zone.Battlefield,
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                },
                {
                    label: "Creatures you control get +1/+1 and trample",
                    effects: [
                        {
                            type: EffectType.ApplyContinuousEffect,
                            powerModifier: 1,
                            toughnessModifier: 1,
                            abilitiesToAdd: ['Trample'],
                            duration: { type: DurationType.UntilEndOfTurn },
                            targetMapping: TargetMapping.AllCreaturesYouControl
                        }
                    ]
                }
            ]
        }
    ]
};
