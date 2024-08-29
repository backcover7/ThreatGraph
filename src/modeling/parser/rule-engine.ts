/**
 * This RuleEngine class is to parse designs property in a rule yaml file.
 *
 * There are three kinds of keywords in a `designs` block: designs, either, design.
 * - `designs` needs to be true only if all the expressions in this property object should be true.
 * - `either` needs to be true if any one of the expressions in this property object is true.
 * - `design` is a single expression, `designs` and `either` are all built by several `design`s
 *
 * For Example:
 *
 * designs:
 *   - designs:
 *      - design: a <= 8
 *      - design: a > 5
 *   - either:
 *      - design: b = 'sam'
 *      - design: b = 'john'
 *
 * The above designs is like `(obj.a <= 8 && obj.a > 5) && (obj.b === 'sam' || obj.b === 'john')`
 *
 */

import Evaluator from './evaluator';
import { Result } from '../DFD/result'

export default class RuleEngine {
    #MAX_DEPTH = 10;

    #rule: any;
    #relatedThreat: any;
    #relatedElements: any;

    #evaluator: Evaluator | undefined;

    constructor(rule: any, allElements: any, allThreats: any[]) {
        // Find the related threat
        this.#rule = rule;

        // Find the related element
        this.#relatedElements = allElements.filter((element: any) => element.metadata.element === rule.element.type || element.metadata.id === rule.element.id);

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
                        element: relatedElement.metadata.id,
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
            let flag = true;
            for (const expression of expressions) {
                if (expression.designs) flag &&= this.#evaluateDesigns(expression.designs, element, depth);
                else if (expression.either) flag &&= this.#evaluateEitherDesign(expression.either, element, depth);
                else if (expression.design) flag &&= this.#evaluateDesign(expression.design, element);
            }
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
            let flag = false;
            for (const expression of expressions) {
                if (expression.designs) {
                    flag ||= this.#evaluateDesigns(expression.designs, element, depth);
                }
                else if (expression.either) {
                    flag ||= this.#evaluateEitherDesign(expression.either, element, depth);
                }
                else if (expression.design) {
                    flag ||= this.#evaluateDesign(expression.design, element);
                }
            }
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
            throw new Error('Invalid rule format');
        }
        return this.#evaluator.analyze(design, element);
    }
}