import { EffectType, AbilityType, EffectDefinition, ImplementableCard, ZoneRequirement, TargetType } from '../../../../shared/engine_types';

/**
 * ReverseOracle Utility
 * Translates engine-level logic definitions back into human-readable MTG text.
 * 
 * DESIGN PRINCIPLE: Honest Inference
 * - Derives as much text as possible from existing data structures (targetDefinition, restrictions, etc.)
 * - Uses a Subject-Verb-Payload semantic model for grammatically correct phrasing.
 * - Avoids "cheating" by not relying on manual description overrides in logic files.
 */
export class ReverseOracle {
    static reconstructCard(card: any): string {
        const parts: string[] = [];
        
        // 1. Static Keywords
        if (card.keywords && card.keywords.length > 0) {
            parts.push(card.keywords.join(", "));
        }

        // 2. Abilities
        if (card.abilities && Array.isArray(card.abilities)) {
            card.abilities.forEach((ability: any) => {
                parts.push(this.reconstructAbility(ability));
            });
        }

        return parts.filter(p => p.length > 0).join("\n\n");
    }

    static reconstructAbility(ability: any): string {
        switch (ability.type) {
            case 'TriggeredAbility':
            case AbilityType.Triggered:
                return this.reconstructTriggered(ability);
            case 'ActivatedAbility':
            case AbilityType.Activated:
                return this.reconstructActivated(ability);
            case 'Static':
            case AbilityType.Static:
                return this.reconstructStatic(ability);
            case 'Spell':
            case AbilityType.Spell:
                return this.reconstructEffects(ability.effects, ". ", ability);
            default:
                return `[Unknown Ability Type: ${ability.type}]`;
        }
    }

    private static reconstructTriggered(ability: any): string {
        let trigger = "";
        const event = Array.isArray(ability.triggerEvent) ? ability.triggerEvent[0] : ability.triggerEvent;
        const meta = ability.triggerMetadata || {};
        const subject = meta.subject === 'opponent' ? "an opponent" : (meta.subject === 'any' ? "a player" : "you");
        const subjectPossessive = meta.subject === 'opponent' ? "an opponent's" : (meta.subject === 'any' ? "a player's" : "your");

        // Infer Trigger Text
        if (meta.triggerDescription) {
            trigger = meta.triggerDescription;
        } else {
            switch (event) {
                case 'ON_ETB': trigger = "When this creature enters, "; break;
                case 'ON_ETB_OTHER': trigger = `Whenever another ${meta.restrictions?.join(" ") || "permanent"} enters, `; break;
                case 'ON_DEATH': trigger = "When this creature dies, "; break;
                case 'ON_ATTACK': trigger = "Whenever this creature attacks, "; break;
                case 'ON_DRAW': trigger = `Whenever ${subject} draw${subject === 'you' ? "" : "s"} a card, `; break;
                case 'ON_LIFE_GAIN': trigger = `Whenever ${subject} gain${subject === 'you' ? "" : "s"} life, `; break;
                case 'ON_UNTAP': trigger = `Whenever a permanent ${subject} control${subject === 'you' ? "" : "s"} becomes untapped, `; break;
                case 'ON_END_STEP': trigger = `At the beginning of ${subjectPossessive} end step, `; break;
                case 'ON_BEGINNING_OF_COMBAT_STEP': trigger = `At the beginning of combat on ${subjectPossessive} turn, `; break;
                default: trigger = `Whenever ${event || 'event'} triggers, `;
            }
        }

        const condition = ability.triggerCondition || ability.condition;
        const conditionText = condition ? (typeof condition === 'string' ? `if ${this.reconstructCondition(condition)}, ` : "[If condition met] ") : "";
        const isAbilityOptional = ability.optional || ability.targetDefinition?.optional;
        const effectsStr = this.reconstructEffects(ability.effects, isAbilityOptional ? " and " : ". ", ability);
        const finalEffects = isAbilityOptional ? this.applyYouMay(effectsStr) : effectsStr;
        
        return `${trigger}${conditionText}${finalEffects}`;
    }

    private static reconstructActivated(ability: any): string {
        const costs = (ability.costs || []).map((c: any) => {
            if (c.type === 'Mana') return c.value;
            if (c.type === 'Tap') return "{T}";
            if (c.type === 'Sacrifice') return `Sacrifice ${c.targetMapping === 'SELF' ? 'this creature' : 'a creature'}`;
            return c.type;
        }).join(", ");

        const isAbilityOptional = ability.optional || ability.targetDefinition?.optional;
        const effectsStr = this.reconstructEffects(ability.effects, isAbilityOptional ? " and " : ". ", ability);
        const finalEffects = isAbilityOptional ? this.applyYouMay(effectsStr) : effectsStr;
        const target = ability.targetDefinition ? ` target ${this.reconstructTarget(ability.targetDefinition)}` : "";

        return `${costs}: ${finalEffects}${target}.`;
    }

    private static reconstructStatic(ability: any): string {
        const effectsText = this.reconstructEffects(ability.effects || ability.abilities || [], ". ", ability, true);
        if (ability.condition) {
            const conditionText = this.reconstructCondition(ability.condition);
            return `As long as ${conditionText}, ${effectsText}.`;
        }
        return effectsText + ".";
    }

    private static reconstructEffects(effects: any[], joiner: string, abilityContext?: any, isStatic?: boolean): string {
        if (!effects || effects.length === 0) return "";
        return effects.map(e => this.reconstructEffect(e, abilityContext, isStatic)).join(joiner);
    }

    private static reconstructEffect(effect: any, abilityContext?: any, isStatic?: boolean): string {
        const amount = effect.amount === 'EVENT_AMOUNT' ? "that many" : (effect.amount || "");
        const targetMapping = effect.targetMapping || 'CONTROLLER';
        const target = this.reconstructMapping(targetMapping, effect.restrictions, abilityContext);
        
        // Semantic Components
        let verb = "";
        let payload = "";
        let subject = "you";
        let isSubjectYou = true;

        switch (effect.type) {
            case EffectType.DrawCards:
                verb = "draw";
                payload = `${amount} card${amount === 1 ? "" : "s"}`;
                break;
            case EffectType.DealDamage:
                verb = "deal";
                payload = `${amount} damage to ${target}`;
                subject = "this creature";
                isSubjectYou = false;
                break;
            case EffectType.AddCounters:
                verb = "put";
                payload = `${amount} ${effect.value || '+1/+1'} counter${amount === 1 ? "" : "s"} on ${target}`;
                break;
            case EffectType.GainLife:
                verb = "gain";
                payload = `${amount} life`;
                break;
            case EffectType.LoseLife:
                verb = "lose";
                payload = `${amount} life`;
                subject = target;
                isSubjectYou = targetMapping === 'CONTROLLER';
                break;
            case EffectType.Destroy:
                verb = "destroy";
                payload = target;
                break;
            case EffectType.Exile:
                verb = "exile";
                payload = target;
                break;
            case EffectType.ReturnToHand:
                verb = "return";
                payload = `${target} to its owner's hand`;
                break;
            case EffectType.Sacrifice:
                verb = "sacrifice";
                payload = target;
                subject = target;
                isSubjectYou = targetMapping === 'CONTROLLER';
                break;
            case EffectType.DiscardCards:
                verb = "discard";
                payload = `${amount === 'that many' ? 'that many' : (amount || 1)} card${amount === 1 ? "" : "s"}`;
                subject = target;
                isSubjectYou = targetMapping === 'CONTROLLER';
                break;
            case EffectType.SearchLibrary:
                const restr = this.reconstructRestrictions(effect.restrictions || []);
                verb = "search";
                payload = `your library for ${amount === 1 ? "a" : amount} ${restr} card${amount === 1 ? "" : "s"}, reveal it, put it into your hand, then shuffle your library`;
                break;
            case EffectType.Scry:
                verb = "scry";
                payload = `${amount}`;
                break;
            case EffectType.Surveil:
                verb = "surveil";
                payload = `${amount}`;
                break;
            case EffectType.Mill:
                verb = "mill";
                payload = `${amount === 1 ? 'a' : amount} card${amount === 1 ? "" : "s"}`;
                subject = target;
                isSubjectYou = targetMapping === 'CONTROLLER';
                break;
            case EffectType.Shuffle:
                verb = "shuffle";
                payload = "your library";
                break;
            case EffectType.ApplyContinuousEffect:
                let mod = "";
                if (effect.powerModifier !== undefined) mod = `${effect.powerModifier > 0 ? '+' : ''}${effect.powerModifier}/${effect.toughnessModifier >= 0 && effect.powerModifier !== undefined ? (effect.toughnessModifier > 0 ? '+' : '') : ''}${effect.toughnessModifier}`;
                
                const toAdd = effect.abilitiesToAdd || [];
                const toRemove = effect.abilitiesToRemove || [];
                
                if (toRemove.includes('Defender')) {
                    verb = "can attack";
                    payload = "as though it didn't have defender";
                } else {
                    verb = abilityContext?.type === AbilityType.Static ? "gets" : "get";
                    const abilityText = toAdd.length > 0 ? `${mod ? ' and' : ''} gain${abilityContext?.type === AbilityType.Static ? 's' : ''} ${toAdd.join(", ")}` : "";
                    payload = `${mod}${abilityText}`;
                }

                const dur = (typeof effect.duration === 'string' ? effect.duration : effect.duration?.type) || "";
                const durationText = (dur === 'UNTIL_END_OF_TURN' && abilityContext?.type !== AbilityType.Static) ? " until end of turn" : "";
                payload += durationText;
                
                subject = target;
                isSubjectYou = targetMapping === 'CONTROLLER';
                break;
            case EffectType.CreateToken:
                const bp = effect.tokenBlueprint;
                verb = "create";
                payload = `a ${bp?.power}/${bp?.toughness} ${bp?.name || "creature"} token`;
                break;
            case EffectType.Choice:
                return `${effect.label || "choose one"} — ${effect.choices?.map((c: any) => 
                    `• ${c.label}${c.effects ? `: ${this.reconstructEffects(c.effects, ". ")}` : ""}`
                ).join(" ")}`;
            default:
                verb = "do";
                payload = `[Effect: ${effect.type}]`;
        }

        // Grammar & Optionality
        if (isSubjectYou) {
            return `${verb} ${payload}`.trim();
        } else {
            const s = (verb === "sacrifice" || verb === "discard" || verb === "lose" || verb === "deal" || verb === "get") ? "s" : "";
            return `${subject} ${verb}${s} ${payload}`.trim();
        }
    }

    private static applyYouMay(text: string): string {
        if (!text) return "";
        if (text.startsWith("you ")) return "you may " + text.substring(4);
        if (text.startsWith("draw ")) return "you may draw " + text.substring(5);
        if (text.startsWith("return ")) return "you may return " + text.substring(7);
        return "you may " + text;
    }

    private static reconstructMapping(mapping: string, currentRestrictions?: any[], abilityContext?: any): string {
        let restrictions = currentRestrictions || [];
        
        // Honest Inference: Look at the parent ability's target definition for TARGET_1
        if (mapping === 'TARGET_1' && abilityContext?.targetDefinition) {
            restrictions = abilityContext.targetDefinition.restrictions || [];
        }

        const filteredRestr = (restrictions || []).filter((r: string) => r !== 'YouControl' && r !== 'OpponentControl' && r !== 'Other') || [];
        const restrText = filteredRestr.length > 0 ? this.reconstructRestrictions(filteredRestr) : "";
        const controlSuffix = (restrictions || []).includes('YouControl') ? " you control" : ((restrictions || []).includes('OpponentControl') ? " an opponent controls" : "");
        const other = (restrictions || []).includes('Other') ? "other " : "";

        switch (mapping) {
            case 'SELF': return "this creature";
            case 'CONTROLLER': return "you";
            case 'TARGET_1': return `target ${other}${restrText || "permanent"}${controlSuffix}`;
            case 'EACH_OPPONENT': return "each opponent";
            case 'EACH_PLAYER': return "each player";
            case 'ALL_CREATURES_YOU_CONTROL': return "each creature you control";
            case 'ANY_TARGET': return "any target";
            default: return mapping || "target";
        }
    }

    private static reconstructTarget(def: any): string {
        if (!def) return "";
        const restr = this.reconstructRestrictions(def.restrictions || []);
        const typeStr = def.type === "Permanent" ? "" : def.type;
        return `${restr} ${typeStr || ""}`.trim().toLowerCase();
    }

    private static reconstructRestrictions(restr: any[]): string {
        if (!restr || restr.length === 0) return "";
        return restr.map(r => {
            if (typeof r === 'string') return this.translateRestriction(r);
            if (r.types) return r.types.join(", ");
            return "card";
        }).join(" or ");
    }

    private static translateRestriction(r: string): string {
        if (r.includes('>=')) {
            const [field, val] = r.split('>=');
            return `with ${field} ${val} or greater`;
        }
        if (r.includes('<=')) {
            const [field, val] = r.split('<=');
            return `with ${field} ${val} or less`;
        }
        if (r.toLowerCase() === 'youcontrol') return ""; // Handled by mapping
        return r;
    }

    private static reconstructCondition(condition: string): string {
        if (!condition) return "";

        if (condition.includes('&&')) {
            return condition.split('&&').map(c => this.reconstructCondition(c.trim())).join(" and ");
        }

        if (condition.includes(':')) {
            const [type, params] = condition.split(':');
            const restrictions = params.split(',').map(r => r.trim());

            switch (type) {
                case 'HAS_PERMANENT':
                    return `you control ${this.reconstructRestrictionList(restrictions)}`;
                case 'NOT_HAS_PERMANENT':
                    return `you control no ${this.reconstructRestrictionList(restrictions)}`;
                case 'PLAYER_HAS_LIFE_GE':
                    return `you have ${restrictions[0]} or more life`;
                case 'OPPONENT_HAS_LIFE_LE':
                    return `an opponent has ${restrictions[0]} or less life`;
            }
        }

        switch (condition) {
            case 'IS_YOUR_TURN': return "it's your turn";
            case 'HAS_CREATURE_POWER_4_PLUS': return "you control a creature with power 4 or greater";
            default: return `[Condition: ${condition}]`;
        }
    }

    private static reconstructRestrictionList(restrictions: string[]): string {
        if (!restrictions || restrictions.length === 0) return "a permanent";
        
        let subject = "";
        const parts: string[] = [];

        restrictions.forEach(r => {
            const lower = r.toLowerCase();
            if (['creature', 'artifact', 'land', 'enchantment', 'planeswalker'].includes(lower)) {
                subject = `a${['artifact', 'enchantment'].includes(lower) ? 'n' : ''} ${lower}`;
            } else if (r === 'youcontrol') {
                // Ignore, handled by verb
            } else {
                parts.push(this.translateRestriction(r));
            }
        });

        if (!subject) subject = "a permanent";
        return `${subject}${parts.length > 0 ? " " + parts.join(" and ") : ""}`;
    }
}
