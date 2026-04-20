import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const GriffinAerie: CardDefinition = {
    name: "Griffin Aerie",
    manaCost: "{1}{W}",
    scryfall_id: "6ea1ee60-5644-4f78-913d-32c3f0c2427b",
    image_url: "https://cards.scryfall.io/normal/front/6/e/6ea1ee60-5644-4f78-913d-32c3f0c2427b.jpg?1594734990",
    oracleText: "At the beginning of your end step, if you gained 3 or more life this turn, create a 2/2 white Griffin creature token with flying.",
    colors: ["W"],
    types: ["Enchantment"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EndStep,
            condition: 'OUR_TURN_AND_GAINED_3_OR_MORE_LIFE_THIS_TURN',  //wrong
            effects: [
                {
                    type: EffectType.CreateToken,
                    definition: {
                        name: 'Griffin',
                        power: "2",
                        toughness: "2",
                        colors: ['W'],
                        types: ['Creature'],
                        subtypes: ['Griffin'],
                        keywords: ['Flying'],
                        image_url: 'https://cards.scryfall.io/large/front/4/b/4be9770e-2825-4321-867a-efdb40adc4f2.jpg?1594733513'
                    },
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
