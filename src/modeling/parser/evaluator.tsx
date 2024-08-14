import { create, all, MathJsInstance } from "mathjs";

type KnownObj = Record<string, any>;
type Operator = '=' | '!=' | '<' | '<=' | '>' | '>=';

export class EvaluationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "EvaluationError";
    }
}

export default class Evaluator {
    private math: MathJsInstance;

    constructor() {
        this.math = create(all, {});
        this.initializeMath();
    }

    private initializeMath(): void {
        this.math.import({
            createUnit: () => { throw new EvaluationError('Function createUnit is disabled'); },
            simplify: () => { throw new EvaluationError('Function simplify is disabled'); },
            derivative: () => { throw new EvaluationError('Function derivative is disabled'); }
        }, { override: true });

        this.math.import({
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

    private parseRule(rule: string): [string, Operator, string] | null {
        const match = rule.match(/^(.+?)\s*(=|!=|<=|>=|<|>)\s*(.+)$/);
        if (!match) {
            throw new EvaluationError('Invalid rule format');
        }
        return [match[1], match[2] as Operator, match[3]];
    }

    private createSafeExpression(left: string, operator: Operator, right: string): string {
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
            const parsedRule = this.parseRule(rule);
            if (!parsedRule) return false;

            const [left, operator, right] = parsedRule;
            const safeExpression = this.createSafeExpression(left, operator, right);
            const result = this.math.evaluate(safeExpression, knownObj);
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
            return this.parseRule(rule) !== null;
        } catch {
            return false;
        }
    }

    public getAccessedProperties(rule: string): string[] | null {
        try {
            const parsedRule = this.parseRule(rule);
            if (!parsedRule) return null;
            const [left] = parsedRule;
            return left.split('.');
        } catch {
            return null;
        }
    }
}