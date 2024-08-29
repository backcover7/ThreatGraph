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
 * `ssl.isSSL = false` is to check whether the isSSL property of ssl property object of the dataflow element
 * is false. If it is false, then the dataflow is not encrypted.
 *
 * ` attached.active.attached.zone.trust != 3` is to check whether the node which actively initiate the dataflow
 * is in a zone whose truse level is not 3 (totally trusted).
 */

import { create, all, MathJsInstance } from "mathjs";

type KnownObj = Record<string, any>;
type Operator = '=' | '!=' | '<' | '<=' | '>' | '>=';

class EvaluationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "EvaluationError";
    }
}

export default class Evaluator {
    #math: MathJsInstance;

    constructor() {
        this.#math = create(all, {});
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
        const match = rule.match(/^(.+?)\s*(=|!=|<=|>=|<|>)\s*(.+)\s*$/);
        if (!match) {
            throw new EvaluationError('Invalid rule format');
        }
        if (match[1].includes('__proto__') || match[1].includes('prototype') ||
            match[3].includes('__proto__') || match[3].includes('prototype')) {
            throw new EvaluationError('Invalid rule format');
        }
        return [match[1], match[2] as Operator, match[3]];
    }

    #createSafeExpression(left: string, operator: Operator, right: string): string {
        switch (operator) {
            case '=': return `equal(${left}, ${right})`;
            case '!=': return `unequal(${left}, ${right})`;
            case '<': return `smaller(${left}, ${right})`;
            case '<=': return `smallerEq(${left}, ${right})`;
            case '>': return `larger(${left}, ${right})`;
            case '>=': return `largerEq(${left}, ${right})`;
            default: throw new EvaluationError('Unknown operator');
        }
    }

    public analyze(rule: string, knownObj: KnownObj): boolean {
        try {
            const parsedRule = this.#parseRule(rule);
            if (!parsedRule) return false;

            const [left, operator, right] = parsedRule;
            const safeExpression = this.#createSafeExpression(left, operator, right);
            const result = this.#math.evaluate(safeExpression, knownObj);
            return Boolean(result);
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
            return this.#parseRule(rule) !== null;
        } catch {
            return false;
        }
    }

    public getAccessedProperties(rule: string): string[] | null {
        try {
            const parsedRule = this.#parseRule(rule);
            if (!parsedRule) return null;
            const [left] = parsedRule;
            return left.split('.');
        } catch {
            return null;
        }
    }
}