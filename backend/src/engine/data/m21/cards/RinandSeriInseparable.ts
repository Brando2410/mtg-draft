import { AbilityType, CardDefinition, CostType, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const RinandSeriInseparable: CardDefinition = {
    name: "Rin and Seri, Inseparable",
    manaCost: "{1}{G}{W}{R}",
    oracleText: "Whenever you cast a Dog spell, create a 1/1 green Cat creature token.\nWhenever you cast a Cat spell, create a 1/1 white Dog creature token.\n{R}{G}{W}, {T}: Rin and Seri, Inseparable deals damage to any target equal to the number of Dogs you control. You gain life equal to the number of Cats you control.",
    colors: ["G", "W", "R"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Dog", "Cat"],
    power: "4",
    toughness: "4",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: 'PLAYER_IS_CONTROLLER_AND_SPELL_IS_DOG',
            effects: [{
                type: EffectType.CreateToken,
                tokenBlueprint: {
                    name: 'Cat',
                    power: '1',
                    toughness: '1',
                    colors: ['G'],
                    types: ['Creature'],
                    subtypes: ['Cat'],
                    image_url: 'https://cards.scryfall.io/large/front/d/a/dac6631b-483a-4424-81ae-432d43100693.jpg?1594733879'
                },
                targetMapping: TargetMapping.Controller
            }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: 'PLAYER_IS_CONTROLLER_AND_SPELL_IS_CAT',
            effects: [{
                type: EffectType.CreateToken,
                tokenBlueprint: {
                    name: 'Dog',
                    power: '1',
                    toughness: '1',
                    colors: ['W'],
                    types: ['Creature'],
                    subtypes: ['Dog'],
                    image_url: 'https://cards.scryfall.io/large/front/1/7/17f65f37-124b-4493-85af-906963286348.jpg?1594733857'
                },
                targetMapping: TargetMapping.Controller
            }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{R}{G}{W}' }, { type: CostType.Tap }],
            targetDefinitions: [{ type: TargetType.AnyTarget, count: 1 }],
            effects: [
                { type: EffectType.DealDamage, amount: DynamicAmount.DogsYouControlCount, targetMapping: TargetMapping.Target1 },
                { type: EffectType.GainLife, amount: DynamicAmount.CatsYouControlCount, targetMapping: TargetMapping.Controller }
            ]
        }
    ]
};
