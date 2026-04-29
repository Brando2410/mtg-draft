import * as fs from 'fs';
const path = 'backend/src/engine/modules/state/LayerProcessor.ts';
let content = fs.readFileSync(path, 'utf8');

// The problematic block we want to replace
const startMarker = "// 3. Update effective stats for all objects in all zones (to set isPlayable correctly)";

const startIndex = content.indexOf(startMarker);
if (startIndex !== -1) {
    const endIndex = content.indexOf("obj.effectiveStats = {", startIndex);
    
    if (endIndex !== -1) {
        // Find the end of the block
        let currentIdx = endIndex;
        let openBraces = 0;
        let foundStart = false;
        
        while (currentIdx < content.length) {
            if (content[currentIdx] === '{') {
                openBraces++;
                foundStart = true;
            } else if (content[currentIdx] === '}') {
                openBraces--;
            }
            currentIdx++;
            if (foundStart && openBraces === 0) {
                break;
            }
        }
        
        // now find the end of the forEach })
        const endForEachIdx = content.indexOf("});", currentIdx) + 3;
        
        const oldBlock = content.substring(startIndex, endForEachIdx);
        
        const newBlock = `// 3. Evaluate playability ONLY for objects the player can interact with (Hand, Virtual Hand)
    if (!SpellProcessor) {
      SpellProcessor = require("../actions/spells/SpellProcessor").SpellProcessor;
    }

    [
      ...Object.values(state.players).flatMap((p) => [
        ...p.hand,
        ...p.virtualHand,
      ])
    ].forEach((obj) => {
      // NOTE: We pass activeEffects to avoid O(N^2) continuous effect scanning
      const stats = this.getEffectiveStats(obj, state, undefined, activeEffects);

      const isVirtual = Object.values(state.players).some((p) =>
        p.virtualHand.some((v) => v.id === obj.id),
      );
      
      const inGraveyard =
        obj.zone === Zone.Graveyard ||
        Object.values(state.players).some((p) =>
          p.graveyard.some((g) => g.id === obj.id),
        );

      const hasFlashbackKeyword =
        (stats.keywords || []).some(
          (k: string) => k.toLowerCase() === "flashback",
        ) ||
        (obj.definition.keywords || []).some(
          (k: string) => k.toLowerCase() === "flashback",
        ) ||
        obj.definition.oracleText?.toLowerCase().includes("flashback");

      const graveyardAbility = (obj.definition.abilities || []).find(
        (a): a is any => {
          if (typeof a === 'string') return false;
          return (a.type === "Activated") &&
            a.activeZone === Zone.Graveyard;
        }
      );

      const isFlashback = !!hasFlashbackKeyword && (inGraveyard || isVirtual);
      const isActivation = !!graveyardAbility && (inGraveyard || isVirtual);

      let isPlayable = false;
      let displayCost = obj.definition.manaCost;

      // FAST PATH: isPlayable requires expensive restriction matching, only do it if the object is owned by the active player
      if (state.priorityPlayerId === obj.controllerId) {
          isPlayable = PriorityProcessor.canObjectBePlayed(state, obj.controllerId, obj.id);
          
          if (isFlashback) {
            displayCost =
              obj.definition.flashbackCost ||
              (obj.definition as any).flashback_cost ||
              obj.definition.manaCost;
          } else if (isActivation && graveyardAbility) {
            displayCost =
              graveyardAbility.manaCost ||
              graveyardAbility.costs?.find((c: any) => c.type === "Mana")?.value ||
              obj.definition.manaCost;
          }

          try {
            if (SpellProcessor) {
              const { totalMana } = SpellProcessor.getEffectiveCosts(
                state,
                obj,
                [],
                undefined,
                isFlashback,
                stats,
              );
              displayCost = totalMana;
            }
          } catch (e) {
          }
      }

      obj.effectiveStats = {
        ...stats,
        isPlayable,
        manaCost: displayCost,
        isFlashback,
        isActivation,
        isVirtual,
      };
    });`;
        
        content = content.replace(oldBlock, newBlock);
        fs.writeFileSync(path, content);
        console.log("Successfully patched LayerProcessor.ts");
    } else {
        console.error("Could not find endIndex");
    }
} else {
    console.error("Could not find startMarker");
}
