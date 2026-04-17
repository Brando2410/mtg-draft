
import { CardDefinition } from '@shared/engine_types';
import { AngelicPage } from './cards/AngelicPage';
import { ChandrasOutrage } from './cards/ChandrasOutrage';
import { DeathlessKnight } from './cards/DeathlessKnight';
import { IndulgentAristocrat } from './cards/IndulgentAristocrat';

export const random: Record<string, CardDefinition> = {
    [AngelicPage.name]: AngelicPage,
    [ChandrasOutrage.name]: ChandrasOutrage,
    [DeathlessKnight.name]: DeathlessKnight,
    [IndulgentAristocrat.name]: IndulgentAristocrat,
};


