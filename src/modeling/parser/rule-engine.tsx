import Evaluator from './evaluator';
import * as model from '../model';

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

    startEvaluation(results: model.Result[]) {
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