import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const FalconerAdept: CardDefinition = {
    name: "Falconer Adept",
    manaCost: "{3}{W}",
    scryfall_id: "fb4733e6-6fe2-4460-ac9f-82feb583d790",
    image_url: "https://cards.scryfall.io/normal/front/f/b/fb4733e6-6fe2-4460-ac9f-82feb583d790.jpg?1594734928",
    oracleText: "Whenever this creature attacks, create a 1/1 white Bird creature token with flying that's tapped and attacking.",
    colors: ["W"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Human", "Soldier"],
    power: "2",
    toughness: "3",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            condition: (state: any, event: any, source: any) => event.playerId === source.controllerId && event.targetId === source.sourceId,
            effects: [{
                type: EffectType.CreateToken,
                tokenBlueprint: { name: 'Bird', power: '1', toughness: '1', colors: ['W'], types: ['Creature'], subtypes: ['Bird'], keywords: ['Flying'] },
                targetMapping: TargetMapping.Controller,
                isAttacking: true
            }]
        }
    ]
};




