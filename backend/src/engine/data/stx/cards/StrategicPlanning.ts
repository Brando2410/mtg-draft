import { AbilityType, CardDefinition, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const StrategicPlanning: CardDefinition = {
    name: 'Strategic Planning',
    manaCost: '{1}{U}',
    colors: ['U'],
    types: ['Sorcery'],
    oracleText: 'Look at the top three cards of your library. Put one of them into your hand and the rest into your graveyard.',
    abilities: [
      {
        type: AbilityType.Spell,
        effects: [
          {
            type: EffectType.LookAtTopAndPick,
            fromTop: 3,
            amount: 1,
            zone: Zone.Hand,
            remainderZone: Zone.Graveyard,
            targetMapping: TargetMapping.Controller
          }
        ]
      }
    ],
    scryfall_id: "29306305-cb71-4fef-bf86-f5deb4e7e561",
    image_url: "https://cards.scryfall.io/normal/front/2/9/29306305-cb71-4fef-bf86-f5deb4e7e561.jpg?1631047604",
    rarity: "common"
};

