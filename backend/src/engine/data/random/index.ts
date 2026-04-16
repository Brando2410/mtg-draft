import { CardDefinition } from '@shared/engine_types';
import { AngelicPage } from './cards/AngelicPage';
import { ChandrasOutrage } from './cards/ChandrasOutrage';
import { DeathlessKnight } from './cards/DeathlessKnight';
import { IndulgentAristocrat } from './cards/IndulgentAristocrat';

export const random: Record<string, CardDefinition | Partial<CardDefinition>> = {
    ...AngelicPage,
    ...ChandrasOutrage,
    ...DeathlessKnight,
    ...IndulgentAristocrat,
};


