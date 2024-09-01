/**
 * This Evaluator class is used to parse one single design pattern and evaluate whether the result of the expression
 * of this design pattern. This class might introduce some security issues. There should be enough PoC tests in the design pattern to make
 * sure no threat was introduced here.
 *
 * The design pattern should look like `$1 Operator $2`
 *
 * The type of $1 and $2 could be string or number or boolean or property of elements.
 * For example, the analyzed element is a dataflow arrow element as follows:
 *
 * "model": {
 *   "metadata": {
 *     "element": "dataflow",
 *     "id": "847e90d9-bb58-41fb-8aac-e5a1ab26dcbd",
 *     "name": "http",
 *     "type": "http"
 *   },
 *   "ssl": {
 *     "isSSL": false,
 *     "mTLS": false
 *   },
 *   "data": {
 *     "sensitive": 3,
 *     "content": "secret"
 *   }
 * }
 *
 * `ssl.isSSL == false` is to check whether the isSSL property of ssl property object of the dataflow element
 * is false. If it is false, then the dataflow is not encrypted.
 *
 * ` attached.active.attached.zone.trust != 3` is to check whether the node which actively initiate the dataflow
 * is in a zone whose trust level is not 3 (totally trusted).
 */

import { create, all, MathJsInstance } from 'mathjs';

type KnownObj = Record<string, any>;
type Operator = '==' | '!=' | '<' | '<=' | '>' | '>=' | '=';

class EvaluationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "EvaluationError";
    }
}

export default class Evaluator {
    #math: MathJsInstance;
    #tempVariables: Map<string, any>;

    constructor() {
        this.#math = create(all, {});
        this.#tempVariables = new Map();
        this.#initializeMath();
    }

    #initializeMath(): void {
        this.#math.import({
            createUnit: () => { throw new EvaluationError('Function createUnit is disabled'); },
            simplify: () => { throw new EvaluationError('Function simplify is disabled'); },
            derivative: () => { throw new EvaluationError('Function derivative is disabled'); }
        }, { override: true });

        this.#math.import({
            equal: (a: any, b: any): boolean => a === b,
            unequal: (a: any, b: any): boolean => a !== b,
            smaller: (a: any, b: any): boolean => {
                if (typeof a === 'string' && typeof b === 'string') {
                    return a < b;
                }
                return Number(a) < Number(b);
            },
            larger: (a: any, b: any): boolean => {
                if (typeof a === 'string' && typeof b === 'string') {
                    return a > b;
                }
                return Number(a) > Number(b);
            },
            smallerEq: (a: any, b: any): boolean => {
                if (typeof a === 'string' && typeof b === 'string') {
                    return a <= b;
                }
                return Number(a) <= Number(b);
            },
            largerEq: (a: any, b: any): boolean => {
                if (typeof a === 'string' && typeof b === 'string') {
                    return a >= b;
                }
                return Number(a) >= Number(b);
            }
        }, { override: true });
    }

    #parseRule(rule: string): [string, Operator, string] | null {
        const match = rule.match(/^(.+?)\s*(==|!=|<=|>=|<|>|=)\s*(.+)\s*$/);
        if (!match) {
            throw new EvaluationError('Did not find a operator in the rule: ' + rule);
        }
        return [match[1].trim(), match[2] as Operator, match[3].trim()];
    }

    #createSafeExpression(left: string, operator: Operator, right: string): string {
        switch (operator) {
            case '==': return `equal(${left}, ${right})`;
            case '!=': return `unequal(${left}, ${right})`;
            case '<': return `smaller(${left}, ${right})`;
            case '<=': return `smallerEq(${left}, ${right})`;
            case '>': return `larger(${left}, ${right})`;
            case '>=': return `largerEq(${left}, ${right})`;
            case '=': return `${left} = ${right}`;
            default: throw new EvaluationError('Unknown operator');
        }
    }

    #isTempVariable(value: string): boolean {
        return /^\$[A-Z]+$/.test(value);
    }

    #evaluateExpression(expression: string, knownObj: KnownObj): any {
        const context = { ...knownObj };
        for (const [key, value] of this.#tempVariables) {
            context[key] = value;
        }
        return this.#math.evaluate(expression, context);
    }

    #handleArrayOperation(array: any[], operation: (item: any) => boolean): boolean {
        return array.some(operation);
    }

    public registerTempVariable(rule: string, knownObj: KnownObj): void {
        // Handle temporary variable assignment
        try {
            const parsedRule = this.#parseRule(rule);
            if (!parsedRule) return;

            let [left, operator, right] = parsedRule;

            if (operator === '=') {
                const leftIsTemp = this.#isTempVariable(left);
                const rightIsTemp = this.#isTempVariable(right);

                let value;
                if (leftIsTemp && !rightIsTemp) {
                    value = this.#evaluateExpression(right, knownObj);
                    this.#tempVariables.set(left, value);
                } else if (!leftIsTemp && rightIsTemp) {
                    value = this.#evaluateExpression(left, knownObj);
                    this.#tempVariables.set(right, value);
                } else {
                    throw new EvaluationError('Invalid assignment: one side must be a temporary variable');
                }
            }
        } catch (error) {
            if (error instanceof EvaluationError) {
                console.error('Evaluation error:', error.message);
            } else {
                console.error('Unexpected error:', error);
            }
        }
    }

    public analyze(rule: string, knownObj: KnownObj): boolean {
        try {
            const parsedRule = this.#parseRule(rule);
            if (!parsedRule) return false;

            let [left, operator, right] = parsedRule;

            // Handle comparison with temporary variables
            let leftValue: any;
            let rightValue: any;

            if (this.#isTempVariable(left)) {
                leftValue = this.#tempVariables.get(left);
                if (leftValue === undefined) {
                    throw new EvaluationError('Temporary variable not initialized');
                }
            } else {
                leftValue = this.#evaluateExpression(left, knownObj);
            }

            if (this.#isTempVariable(right)) {
                rightValue = this.#tempVariables.get(right);
                if (rightValue === undefined) {
                    throw new EvaluationError('Temporary variable not initialized');
                }
            } else {
                rightValue = this.#evaluateExpression(right, knownObj);
            }

            // Handle array operations
            if (Array.isArray(leftValue)) {
                return this.#handleArrayOperation(leftValue, (item) =>
                    this.#evaluateExpression(this.#createSafeExpression(JSON.stringify(item), operator, JSON.stringify(rightValue)), knownObj)
                );
            } else if (Array.isArray(rightValue)) {
                return this.#handleArrayOperation(rightValue, (item) =>
                    this.#evaluateExpression(this.#createSafeExpression(JSON.stringify(leftValue), operator, JSON.stringify(item)), knownObj)
                );
            } else {
                const safeExpression = this.#createSafeExpression(JSON.stringify(leftValue), operator, JSON.stringify(rightValue));
                return this.#evaluateExpression(safeExpression, knownObj);
            }
        } catch (error) {
            if (error instanceof EvaluationError) {
                console.error('Evaluation error:', error.message);
            } else {
                console.error('Unexpected error:', error);
            }
            return false;
        }
    }

    public validateRule(rule: string): boolean {
        try {
            const parsedRule = this.#parseRule(rule);
            if (!parsedRule) return false;

            const [left, operator, right] = parsedRule;

            if (operator === '=') {
                const leftIsTemp = this.#isTempVariable(left);
                const rightIsTemp = this.#isTempVariable(right);

                // It is not allowed that both sides are temp variable
                if (leftIsTemp === rightIsTemp) {
                    return false;
                }
            }

            return true;
        } catch {
            return false;
        }
    }


    public clearTempVariables(): void {
        this.#tempVariables.clear();
    }
}