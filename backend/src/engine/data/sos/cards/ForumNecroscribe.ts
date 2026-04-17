import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';
    export const ForumNecroscribe: CardDefinition = {
    name: "Forum Necroscribe",
    manaCost: "{5}{B}",
    colors: [
         "B"
     ],
    types: [
         "Creature"
     ],
    subtypes: [
         "Troll",
         "Warlock"
     ],
    keywords: ["Ward—Discard a card"],
    oracleText: "Ward—Discard a card.\nRepartee — Whenever you cast an instant or sorcery spell that targets a creature, return target creature card from your graveyard to the battlefield.",
    abilities: [
         {
             type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastInstantOrSorcery,
             targets: [{ type: 'Card', restrictions: [
                { type: 'Type', value: 'Creature' },
                { type: 'Zone', value: 'Graveyard' },
                { type: 'Control', value: 'YouControl' }
            ] }],
             condition: 'PLAYER_IS_CONTROLLER && SPELL_TARGETS_CREATURE',
             effects: [
                 {
                     type: EffectType.MoveToZone,
                     zone: Zone.Battlefield,
                     targetMapping: TargetMapping.Target1
                 }
             ]
         }
     ],
     power: "5",
     toughness: "4"
 };
    