import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const GriffinAerie: CardDefinition = {
    name: "Griffin Aerie",
    manaCost: "{1}{W}",
    oracleText: "At the beginning of your end step, if you gained 3 or more life this turn, create a 2/2 white Griffin creature token with flying.",
    colors: ["W"],
    types: ["Enchantment"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EndStep,
            condition: `${ConditionType.IsYourTurn} && ${ConditionType.LifeGained3OrMoreThisTurn}`,
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Griffin',
                        power: "2",
                        toughness: "2",
                        colors: ['W'],
                        types: ['Creature'],
                        subtypes: ['Griffin'],
                        keywords: ['Flying'],

                    },
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "6ea1ee60-5644-4f78-913d-32c36065957f",
    image_url: "https://cards.scryfall.io/normal/front/6/e/6ea1ee60-5644-4f78-913d-32c36065957f.jpg?1594734998",
    rarity: "uncommon"
};

