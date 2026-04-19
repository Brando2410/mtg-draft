import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const ExhilaratingElocution: CardDefinition = {
    name: 'Exhilarating Elocution',
    manaCost: '{2}{W}{B}',
    scryfall_id: "8468417d-7ef5-43e0-9190-e88f3eed9e82",
    image_url: "https://cards.scryfall.io/normal/front/8/4/8468417d-7ef5-43e0-9190-e88f3eed9e82.jpg?1627428957",
    colors: ['W', 'B'],
    types: ['Sorcery'],
    oracleText: 'Put a +1/+1 counter on each creature you control.',
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [{ type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: TargetMapping.AllCreaturesYouControl }]
        }
    ]
  };

