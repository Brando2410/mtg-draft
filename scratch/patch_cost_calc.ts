import * as fs from 'fs';
const path = 'backend/src/engine/modules/actions/spells/SpellCostCalculator.ts';
let content = fs.readFileSync(path, 'utf8');

// Add static imports
const staticImports = `import { ManaProcessor } from '../../magic/ManaProcessor';

// Static imports for performance
let LayerProcessor: any;
let TargetingProcessor: any;
let ConditionProcessor: any;
let EffectProcessor: any;`;

content = content.replace("import { ManaProcessor } from '../../magic/ManaProcessor';", staticImports);

// Replace LayerProcessor require
content = content.replace(/const \{ LayerProcessor \} = require\('\.\.\/\.\.\/state\/LayerProcessor'\);/g, "if (!LayerProcessor) LayerProcessor = require('../../state/LayerProcessor').LayerProcessor;");

// Replace TargetingProcessor require
content = content.replace(/const \{ TargetingProcessor \} = require\('\.\.\/targeting\/TargetingProcessor'\);/g, "if (!TargetingProcessor) TargetingProcessor = require('../targeting/TargetingProcessor').TargetingProcessor;");

// Replace ConditionProcessor require
content = content.replace(/const \{ ConditionProcessor \} = require\('\.\.\/\.\.\/core\/logic\/ConditionProcessor'\);/g, "if (!ConditionProcessor) ConditionProcessor = require('../../core/logic/ConditionProcessor').ConditionProcessor;");

// Replace EffectProcessor require
content = content.replace(/const \{ EffectProcessor \} = require\('\.\.\/\.\.\/effects\/EffectProcessor'\);/g, "if (!EffectProcessor) EffectProcessor = require('../../effects/EffectProcessor').EffectProcessor;");

fs.writeFileSync(path, content);
console.log("Patched SpellCostCalculator.ts");
