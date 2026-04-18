const fs = require('fs');

let mapper = fs.readFileSync('c:/Users/Brando/Desktop/keyday3/mtg draft/backend/src/engine/modules/actions/TargetMapper.ts', 'utf-8');
mapper = mapper.replace(
  "import { TargetValidator } from './TargetValidator';",
  "import { LayerProcessor } from '../state/LayerProcessor';\nimport { ManaProcessor } from '../magic/ManaProcessor';\nimport { TargetValidator } from './TargetValidator';"
);

// All references to this in TargetMapper resolving validation must point to validator
mapper = mapper.replace(/this\.findObjectInAnyZone/g, 'TargetValidator.findObjectInAnyZone');
mapper = mapper.replace(/this\.matchesRestrictions/g, 'TargetValidator.matchesRestrictions');

fs.writeFileSync('c:/Users/Brando/Desktop/keyday3/mtg draft/backend/src/engine/modules/actions/TargetMapper.ts', mapper);

let val = fs.readFileSync('c:/Users/Brando/Desktop/keyday3/mtg draft/backend/src/engine/modules/actions/TargetValidator.ts', 'utf-8');
val = val.replace(/this\.getDefinitionForIndex/g, 'TargetMapper.getDefinitionForIndex');
val = val.replace(/this\.generateTargetPrompt/g, 'TargetMapper.generateTargetPrompt');
val = val.replace(/this\.calculateTotalCounts/g, 'TargetMapper.calculateTotalCounts');
fs.writeFileSync('c:/Users/Brando/Desktop/keyday3/mtg draft/backend/src/engine/modules/actions/TargetValidator.ts', val);

console.log('Fixed TS errors in TargetMapper and TargetValidator');
