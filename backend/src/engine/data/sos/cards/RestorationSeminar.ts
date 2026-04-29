import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const RestorationSeminar: CardDefinition = {
    name: "Restoration Seminar",
    manaCost: "{5}{W}{W}",
    scryfall_id: "9ebc4ecf-2fa2-4ab8-afde-3b91cf5eadb6",
    image_url: "https://cards.scryfall.io/normal/front/9/e/9ebc4ecf-2fa2-4ab8-afde-3b91cf5eadb6.jpg?1775937123",
    colors: ["W"],
    types: ["Sorcery"],
    subtypes: ["Lesson"],
    keywords: ["Paradigm"],
    oracleText: "Return target nonland permanent card from your graveyard to the battlefield.\nParadigm (Then exile this spell. After you first resolve a spell with this name, you may cast a copy of it from exile without paying its mana cost at the beginning of each of your first main phases.)",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Choose a nonland permanent to return",
                    selectionPool: TargetMapping.ControllerGraveyard,
                    targetDefinition: {
                        type: TargetType.CardInGraveyard,
                        count: 1,
                        restrictions: [Restriction.NonLandPermanent]
                    },
                    effects: [
                        {
                            type: EffectType.PutOnBattlefield,
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                }
            ]
        }
    ]
};
