import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const BuryinBooks: CardDefinition = {
    name: 'Bury in Books',
    manaCost: '{4}{U}',
    scryfall_id: "ac2a2cf5-80cf-4c06-8b04-bc04a5460de5",
    image_url: "https://cards.scryfall.io/normal/front/a/c/ac2a2cf5-80cf-4c06-8b04-bc04a5460de5.jpg?1624590030",
    colors: ['U'],
    types: ['Instant'],
    oracleText: 'Put target creature into its owner\'s library second from the top. It costs {2} less to cast this spell if it targets a creature with mana value 4 or greater.',
    abilities: [
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.CostReduction,
                reductionAmount: '{2}',
                condition: 'TargetsManaValue4OrGreater'
            }]
        },
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                count: 1,
                type: TargetType.Creature
            }],
            effects: [{ type: EffectType.MoveToZone, zone: Zone.Library, position: 'top', fromTop: 1, targetMapping: TargetMapping.Target1 }]
        }
    ]
  };

