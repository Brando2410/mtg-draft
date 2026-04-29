import { GameObject, GameState, PlayerState, ContinuousEffect, AbilityDefinition, AbilityType } from '@shared/engine_types';
import { ManaParser } from './ManaParser';
import { ManaPoolManager } from './ManaPoolManager';

export class ManaValidator {

  public static canPayManaCost(player: PlayerState, costStr: string, state?: GameState, payingFor?: GameObject): boolean {
    if (!costStr || player.manaCheat) return true;
    
    // Support for Chromatic Orrery / Spend as Any Color
    const canSpendAsAnyColor = state?.ruleRegistry.continuousEffects.some((e: ContinuousEffect) => 
        (e.type === 'AllowSpendManaAsAnyColor' || e.spendAnyMana) && 
        e.controllerId === player.id &&
        (!e.targetIds || !payingFor || e.targetIds.includes(payingFor.id))
    );
    const pool = ManaPoolManager.getUsableMana(player, payingFor);

    if (canSpendAsAnyColor) {
        const totalFloating = Object.values(pool).reduce((a, b) => a + (b as number), 0);
        const totalRequired = ManaParser.getManaValue(costStr);
        return totalFloating >= totalRequired;
    }

    const requirements = ManaParser.parseManaCost(costStr);
    
    // Check colored mana first (including hybrids)
    for (const [symbol, amount] of Object.entries(requirements.colored)) {
      if (symbol.includes('/')) {
        const options = symbol.split('/');
        const totalAvailable = options.reduce((sum: number, opt: string) => {
          if (opt === 'P') return sum;
          return sum + (pool[opt as keyof typeof pool] || 0);
        }, 0);
        if (totalAvailable < amount) return false;
      } else {
        if ((pool[symbol as keyof typeof pool] || 0) < amount) return false;
      }
    }

    const totalFloating = Object.values(pool).reduce((a, b) => a + (b as number), 0);
    const totalRequired = ManaParser.getManaValue(costStr);
    
    return totalFloating >= totalRequired;
  }

  /**
   * Complex check: Can the player pay this cost using floating mana AND untapped sources?
   */
  public static canPayWithTotal(player: PlayerState, battlefield: GameObject[], costStr: string, payingFor?: GameObject): boolean {
    if (!costStr || player.manaCheat) return true;
    const requirements = ManaParser.parseManaCost(costStr);
    
    // 1. Prepare available sources
    const pool = { ...ManaPoolManager.getUsableMana(player, payingFor) };
    const untappedSources: { id: string, colors: string[], value: number }[] = [];

    const { oracle } = require('./../../../OracleLogicMap');
    battlefield.forEach((obj: GameObject) => {
      if (obj.controllerId === player.id && !obj.isTapped) {
        const logic = oracle.getCard(obj.definition.name);
        const abilities = (logic?.abilities || obj.definition.abilities || []) as (AbilityDefinition | string)[];
        const manaAbilities = abilities.filter((a): a is AbilityDefinition => typeof a !== 'string' && !!a.isManaAbility);
        if (manaAbilities.length === 0) return;

        const isLegalForSource = (restrictions: string[]) => {
          if (!restrictions || restrictions.length === 0) return true;
          if (!payingFor) return false;
          const typeLine = (payingFor.definition.type_line || '').toLowerCase();
          const types = (payingFor.definition.types || []).map(t => t.toLowerCase());
          return restrictions.every(r => {
            const lowR = r.toLowerCase();
            if (lowR === 'instant_or_sorcery') {
              return typeLine.includes('instant') || typeLine.includes('sorcery') || types.includes('instant') || types.includes('sorcery');
            }
            return typeLine.includes(lowR) || types.includes(lowR);
          });
        };

        const sourceAbilities: { colors: string[], value: number }[] = [];
        manaAbilities.forEach((a) => {
          const colors = new Set<string>();
          const restrictions: string[] = [];

          const extract = (effects: any[]) => {
            if (!effects) return;
            effects.forEach((e: any) => {
              if (e.type === 'AddMana' || e.mana || e.manaType) {
                const val = e.value || e.manaType || e.mana || '{C}';
                const res = ManaParser.parseManaCost(val.toString());
                Object.keys(res.colored).forEach(c => colors.add(c));
                if (res.generic > 0) colors.add('C');
                
                const rawR = e.manaRestrictions || e.restriction || e.restrictions;
                if (rawR) {
                  if (Array.isArray(rawR)) restrictions.push(...rawR);
                  else restrictions.push(rawR);
                }
              }
              if (e.choices) e.choices.forEach((c: any) => extract(c.effects));
              if (e.effects) extract(e.effects);
            });
          };
          extract(a.effects || []);
          
          if (isLegalForSource(restrictions)) {
            let val = 0;
            if (a.effects) {
              a.effects.forEach((e: any) => {
                const v = e.value || e.manaType || e.mana || '{C}';
                val = Math.max(val, ManaParser.getManaValue(String(v)) * (e.amount || 1));
              });
            }
            sourceAbilities.push({ colors: Array.from(colors), value: val });
          }
        });

        if (sourceAbilities.length > 0) {
            const bestAbility = sourceAbilities.sort((a,b) => b.value - a.value)[0];
            untappedSources.push({ id: obj.id, colors: bestAbility.colors, value: bestAbility.value });
        }
      }
    });

    // 2. Greedy validation for colored costs
    const coloredReqs: string[] = [];
    Object.entries(requirements.colored).forEach(([symbol, amount]) => {
        for (let i = 0; i < (amount as number); i++) coloredReqs.push(symbol);
    });

    const usedSources = new Map<string, number>(); // id -> value used
    for (const req of coloredReqs) {
        // a. Try pool first
        if (req.includes('/')) {
            const options = req.split('/');
            const found = options.find(opt => (pool as any)[opt] > 0);
            if (found) { (pool as any)[found]--; continue; }
        } else if ((pool as any)[req] > 0) {
            (pool as any)[req]--;
            continue;
        }

        // b. Try sources
        const options = req.includes('/') ? req.split('/') : [req];
        const possibleSources = untappedSources
            .filter(l => !usedSources.has(l.id) && l.colors.some((c: string) => options.includes(c)))
            .sort((a, b) => a.colors.length - b.colors.length);

        if (possibleSources.length > 0) {
            const source = possibleSources[0];
            usedSources.set(source.id, 1); // Mark 1 mana used from this source
        } else {
            return false;
        }
    }

    // 3. Final generic check
    const remainingPool = Object.values(pool).reduce((a, b) => a + (b as number), 0);
    const untranslatedSourcesValue = untappedSources
        .filter(s => !usedSources.has(s.id))
        .reduce((sum, s) => sum + s.value, 0);
    
    // Add leftover value from sources that were partially used for colored mana
    const partialSourcesValue = untappedSources
        .filter(s => usedSources.has(s.id))
        .reduce((sum, s) => sum + Math.max(0, s.value - usedSources.get(s.id)!), 0);

    return (remainingPool + untranslatedSourcesValue + partialSourcesValue) >= requirements.generic;
  }
}
