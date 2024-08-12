import Evaluator from './evaluator';

export default class RuleEngine {
    MAX_DEPTH = 10;

    rule: any;
    relatedThreat:any;
    relatedElement:any;

    evaluator: Evaluator | undefined;

    constructor(rule: any, allElements: any, allThreats: any[]) {
        // Find the related threat
        this.rule = rule;

        // Find the related element
        this.relatedElement = allElements[rule.element.type]?.find((element: any) => element.metadata.id === rule.element.id);

        // Find matched elements in the canvas
        if (this.relatedElement) {
            this.relatedThreat = allThreats.find(threat => threat.id === rule.threat);
        }

        if (this.relatedThreat) {
            this.evaluator = new Evaluator();
        }
    }

    startEvaluation() {
        this.evaluateDesigns(this.rule.designs, 0);
    }

    private depthCheck(depth: number) {
        depth += 1;
        if (depth > this.MAX_DEPTH) {
            console.error(`The depth of expressions is too deep. Please simplify your rule and make the depth less than ${this.MAX_DEPTH}`);
            return;
        }
    }

    /**
     * if (design && design && ...) {...}
     * @param expressions
     * @param depth
     */
    private evaluateDesigns(expressions: any[], depth: number): boolean {
        this.depthCheck(depth);

        let flag = true;
        for (const expression of expressions) {
            if (expression.designs) flag &&= this.evaluateDesigns(expressions, depth);
            else if (expression.either) flag &&= this.evaluateEitherDesign(expressions, depth);
            else if (expression.design) flag &&= this.evaluateDesign(expression);
        }
        return flag;
    }

    /**
     * if (design || design || ...) {...}
     * @param expressions
     * @param depth
     */
    private evaluateEitherDesign(expressions: any[], depth: number): boolean {
        this.depthCheck(depth);

        let flag = true;
        for (const expression of expressions) {
            if (expression.designs) flag ||= this.evaluateDesigns(expressions, depth);
            else if (expression.either) flag ||= this.evaluateEitherDesign(expressions, depth);
            else if (expression.design) flag ||= this.evaluateDesign(expression);
        }
        return flag;
    }

    /**
     * if (design) {...}
     * @param design
     */
    private evaluateDesign(design: { design: string } ): boolean {
        const expression = design.design;

        if (this.evaluator) this.evaluator.analyze(this.relatedElement, expression);
        return true
    }
}