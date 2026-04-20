import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const FalconerAdept: CardDefinition = {
    name: "Falconer Adept",
    manaCost: "{3}{W}",
    scryfall_id: "fb4733e6-6fe2-4460-ac9f-82feb583d790",
    image_url: "https://cards.scryfall.io/normal/front/f/b/fb4733e6-6fe2-4460-ac9f-82feb583d790.jpg?1594734928",
    oracleText: "Whenever this creature attacks, create a 1/1 white Bird creature token with flying that's tapped and attacking.",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Human", "Soldier"],
    power: "2",
    toughness: "3",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            condition: ConditionType.EventObjectIsTriggerSource,
            effects: [{
                type: EffectType.CreateToken,
                definition: {
                    name: 'Bird',
                    power: '1',
                    toughness: '1',
                    colors: ['W'],
                    types: ['Creature'],
                    subtypes: ['Bird'],
                    keywords: ['Flying'],
                    image_url: 'https://cards.scryfall.io/large/front/d/1/d1e8e639-5060-4b36-9f79-3051410889f8.jpg?1594733494'
                },
                targetMapping: TargetMapping.Controller,
                isAttacking: true,
                tapped: true
            }]
        }
    ]
};
