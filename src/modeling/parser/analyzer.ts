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
 *      - variable: c.friend = $FRIEND$
 *      - design: $FRIEND$ == 'user'
 *      - either:
 *          - design: $FRIEND$.company == 'google'
 *          - design: $FRIEND$.company == 'microsoft'
 *   - either:
 *      - variable: $TAG$ = d.tags
 *      - design: $TAG$.type == 'student'
 *      - design: $TAG$.gender == 'male'
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
        this.#relatedElements.forEach((relatedElement: any) => {
            if (this.#evaluateDesigns(this.#rule.designs, relatedElement, 0)) {
                results.push(
                    {
                        element: relatedElement.metadata.type,
                        shape: relatedElement.metadata.shape,
                        rule: this.#rule.id,
                        threat: this.#relatedThreat.id,
                    }
                );
            }
        })
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
     * @param element
     * @param depth
     */
    #evaluateDesigns(expressions: any[], element: any, depth: number): boolean {
        if (this.#depthCheck(depth += 1)) {
            const variableExpr = expressions.find(expression => expression.variable);
            if (variableExpr) this.#evaluateDesign(variableExpr.variable, element);  // register temp variable

            let flag = true;
            for (const expression of expressions) {
                if (expression.designs) flag &&= this.#evaluateDesigns(expression.designs, element, depth);
                else if (expression.either) flag &&= this.#evaluateEitherDesign(expression.either, element, depth);
                else if (expression.design) flag &&= this.#evaluateDesign(expression.design, element);
            }
            this.#evaluator?.clearTempVariables();
            return flag;
        }
        return false
    }

    /**
     * if (design || design || ...) {...}
     * @param expressions
     * @param element
     * @param depth
     */
    #evaluateEitherDesign(expressions: any[], element: any, depth: number): boolean {
        if (this.#depthCheck(depth += 1)) {
            const variableExpr = expressions.find(expression => expression.variable);
            if (variableExpr) this.#evaluateDesign(variableExpr.variable, element);  // register temp variable
            let flag = false;
            for (const expression of expressions) {
                if (expression.designs) flag ||= this.#evaluateDesigns(expression.designs, element, depth);
                else if (expression.either) flag ||= this.#evaluateEitherDesign(expression.either, element, depth);
                else if (expression.design) flag ||= this.#evaluateDesign(expression.design, element);
            }
            this.#evaluator?.clearTempVariables();
            return flag;
        }
        return false;
    }

    /**
     * if (design) {...}
     * @param design
     * @param element
     */
    #evaluateDesign(design: string, element: any): boolean {
        if (!this.#evaluator?.validateRule(design)) {
            throw new Error('Invalid rule format: ' + design);
        }
        return this.#evaluator.analyze(design, element);
    }
}