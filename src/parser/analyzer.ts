/**
 * This Analyzer class is to parse designs property in a rule yaml file.
 *
 * There are three kinds of keywords in a `designs` block: designs, either, design.
 * - `designs` needs to be true only if all the expressions in this property object should be true.
 * - `either` needs to be true if any one of the expressions in this property object is true.
 * - `design` is a single expression, `designs` and `either` are all built by several `design`s
 * - `variable` is to overwrite the element object but has to be a child or grandchild element. If this element variable object
 *    is an array, the rule engine will search if there is any item in the array meets the requirements
 *
 * For Example:
 *
 * designs:
 *   - designs:
 *      - design: a <= 8
 *      - design: a > 5
 *   - either:
 *      - design: b == 'sam'
 *      - design: b == 'john'
 *   - designs:
 *      - variable: c.friend = $FRIEND
 *      - design: $FRIEND == 'user'
 *      - either:
 *          - design: $FRIEND.company == 'google'
 *          - design: $FRIEND.company == 'microsoft'
 *   - either:
 *      - variable: $A = 'student'
 *      - variable: $TAG = d.tags
 *      - design: $TAG.type == $A
 *      - design: $TAG.gender == 'male'
 *
 *
 * The above designs is like
 * `(obj.a <= 8 && obj.a > 5)
 * && (obj.b === 'sam' || obj.b === 'john')
 * && (c.friend == 'user' && (c.friend.company === 'google' || c.friend.company === 'microsoft') )
 * && (d.tags.any(tag => (tag.type === 'student') && (tag.gender === 'female')))`
 *
 */

import Evaluator from './evaluator';
import { Result } from '../DFD/result'
import {expression} from "mathjs";
import crypto from "crypto";
import {UUID} from "node:crypto";

export default class Analyzer {
    #MAX_DEPTH = 10;

    #rule: any;
    #relatedThreat: any;
    #relatedElements: any;

    #evaluator: Evaluator | undefined;

    constructor(rule: any, allElements: any, allThreats: any[]) {
        // Find the related threat
        this.#rule = rule;

        // Find the related element
        this.#relatedElements = allElements.filter((element: any) => element.metadata.element === this.#rule.element);

        // Find matched elements in the canvas
        if (this.#relatedElements) {
            this.#relatedThreat = allThreats.find(threat => threat.id === rule.threat);
        }

        if (this.#relatedThreat) {
            this.#evaluator = new Evaluator();
        }
    }

    startEvaluation(results: Result[]) {
        this.#relatedElements.forEach((ruleContext: any) => {
            const result = {
                element: ruleContext.metadata.type,
                shape: ruleContext.metadata.shape,
                rule: this.#rule.id,
                threat: this.#relatedThreat.id,
            }
            const blockId: UUID = crypto.randomUUID();
            this.#evaluator?.enterBlock(blockId);
            if (this.#rule.designs && this.#evaluateDesigns(this.#rule.designs, ruleContext, 0) ||
                this.#rule.either && this.#evaluateEitherDesign(this.#rule.either, ruleContext, 0) ||
                this.#rule.design && this.#evaluateDesign(this.#rule.design, ruleContext, blockId)) {
                results.push(result)
            }
            this.#evaluator?.exitBlock();
        })
        this.#evaluator?.clearTempVariables();
    }

    #depthCheck(depth: number): boolean {
        if (depth > this.#MAX_DEPTH) {
            console.error(`The depth of expressions is too deep. Please simplify your rule and make the depth less than ${this.#MAX_DEPTH}`);
            return false;
        }
        return true;
    }

    /**
     * if (design && design && ...) {...}
     * @param expressions
     * @param ruleContextObject
     * @param depth
     */
    #evaluateDesigns(expressions: any[], ruleContextObject: any, depth: number): boolean {
        if (this.#depthCheck(depth += 1)) {
            const blockId: UUID = crypto.randomUUID();
            this.#evaluator?.enterBlock(blockId);
            this.#registerVariables(expressions, ruleContextObject, blockId);

            let flag = true;
            for (const expression of expressions) {
                if (expression.designs) flag &&= this.#evaluateDesigns(expression.designs, ruleContextObject, depth);
                else if (expression.either) flag &&= this.#evaluateEitherDesign(expression.either, ruleContextObject, depth);
                else if (expression.design) flag &&= this.#evaluateDesign(expression.design, ruleContextObject, blockId);
            }
            this.#evaluator?.exitBlock();
            return flag;
        }
        return false
    }

    /**
     * if (design || design || ...) {...}
     * @param expressions
     * @param ruleContextObject
     * @param depth
     */
    #evaluateEitherDesign(expressions: any[], ruleContextObject: any, depth: number): boolean {
        if (this.#depthCheck(depth += 1)) {
            const blockId: UUID = crypto.randomUUID();
            this.#evaluator?.enterBlock(blockId);
            this.#registerVariables(expressions, ruleContextObject, blockId);

            let flag = false;
            for (const expression of expressions) {
                if (expression.designs) flag ||= this.#evaluateDesigns(expression.designs, ruleContextObject, depth);
                else if (expression.either) flag ||= this.#evaluateEitherDesign(expression.either, ruleContextObject, depth);
                else if (expression.design) flag ||= this.#evaluateDesign(expression.design, ruleContextObject, blockId);
            }
            this.#evaluator?.exitBlock();
            return flag;
        }
        return false;
    }

    /**
     * if (design) {...}
     * @param design
     * @param ruleContextObject
     * @param parentBlockId
     */
    #evaluateDesign(design: string, ruleContextObject: any, parentBlockId: UUID): boolean {
        if (!this.#evaluator?.validateRule(design, parentBlockId)) {
            console.error('Invalid rule format: ' + design);
            return false;
        }
        return this.#evaluator?.analyze(design, ruleContextObject, parentBlockId);
    }

    #registerVariables(expressions: any[], ruleContextObject: any, blockId: UUID): void {
        const variableExprs = expressions.filter(expression => expression.variable).map(expression => expression.variable);
        variableExprs.forEach((variableExpr: any) => {
            this.#evaluator?.registerTempVariable(variableExpr, ruleContextObject, blockId);
        });
    }
}