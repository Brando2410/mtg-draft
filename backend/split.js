const fs = require('fs');
const pf = 'c:/Users/Brando/Desktop/keyday3/mtg draft/backend/src/engine/modules/actions/TargetingProcessor.ts';
const content = fs.readFileSync(pf, 'utf-8');
const lines = content.split('\n');

const getLines = (start, end) => lines.slice(start - 1, end).join('\n');

// 1. TargetMapper.ts
let mapper = `import { GameObject, GameObjectId, GameState, PlayerId, Zone, TargetType, TargetMapping } from '@shared/engine_types';
import { TargetValidator } from './TargetValidator';

export class TargetMapper {
` + '\n' + getLines(12, 197) + '\n\n' + getLines(1215, 1485) + '\n}\n';

// 2. TargetValidator.ts
let validator = `import { GameObject, GameObjectId, GameState, PlayerId, Zone, TargetType, TargetMapping } from '@shared/engine_types';
import { LayerProcessor } from '../state/LayerProcessor';
import { ManaProcessor } from '../magic/ManaProcessor';
import { TargetMapper } from './TargetMapper';

export class TargetValidator {
` + '\n' + getLines(199, 953) + '\n}\n';

fs.writeFileSync('c:/Users/Brando/Desktop/keyday3/mtg draft/backend/src/engine/modules/actions/TargetMapper.ts', mapper);
fs.writeFileSync('c:/Users/Brando/Desktop/keyday3/mtg draft/backend/src/engine/modules/actions/TargetValidator.ts', validator);

console.log('Successfully wrote TargetMapper.ts and TargetValidator.ts!');
