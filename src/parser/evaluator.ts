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
import {UUID} from "node:crypto";

type RuleContext = Record<string, any>;
type Operator = '==' | '!=' | '<' | '<=' | '>' | '>=' | '=';

class EvaluationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "EvaluationError";
    }
}

export default class Evaluator {
    #math: MathJsInstance;
    #tempVariables: Map<string, Map<string, UUID>>;
    #blockStack: string[];

    constructor() {
        this.#math = create(all, {});
        this.#tempVariables = new Map();
        this.#blockStack = [];
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

    #evaluateExpression(expression: string, ruleContextObject: RuleContext): any {
        const context: Record<string, any> = { $: ruleContextObject };
        for (const [key, value] of this.#tempVariables) {
            context[key] = value;
        }
        return this.#math.evaluate(expression, context);
    }

    #resolvePath(obj: any, path: string): any {
        return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
    }

    #isValidExpression(value: string, blockId: UUID): boolean {
        // Check if it's a property path expression starting with $.
        if (value.startsWith('$.')) {
            const parts = value.split('.');
            return parts.length > 1 && parts.slice(1).every(part => /^[a-zA-Z0-9_]+$/.test(part));
        }
        // Check if it's a temporary variable with optional property path
        if (this.#isTempVariableExpr(value, blockId)) {
            return true;
        }
        // Check if it's a literal
        return this.#isLiteral(value);
    }

    #isLiteral(value: string): boolean {
        return (
            (value.startsWith("'") && value.endsWith("'")) || // String literal
            !isNaN(Number(value)) || // Number literal
            value === 'true' || value === 'false' // Boolean literal
        );
    }

    #handleArrayOperation(array: any[], operation: (item: any) => boolean): boolean {
        return array.some(operation);
    }

    #resolveValue(value: string, ruleContextObject: RuleContext, blockId: UUID): any {
        if (this.#isTempVariableExpr(value, blockId)) {
            const [varName, ...pathParts] = value.split('.');
            const tempValue = this.#getTempVariable(varName, blockId);
            if (tempValue === undefined) {
                throw new EvaluationError('Temporary variable not initialized: ' + varName);
            }
            if (pathParts.length > 0) {
                return this.#resolvePath(tempValue, pathParts.join('.'));
            }
            return tempValue;
        } else if (value.startsWith('$.')) {
            return this.#evaluateExpression(value, ruleContextObject);
        } else if (value.startsWith("'") && value.endsWith("'")) {
            return value.slice(1, -1);
        } else if (!isNaN(Number(value))) {
            return Number(value);
        } else if (value === 'true' || value === 'false') {
            return value === 'true';
        } else {
            throw new EvaluationError('Invalid expression: ' + value + '. Must start with $, be a temporary variable, or a literal value.');
        }
    }

    public analyze(rule: string, ruleContextObject: RuleContext, blockId: UUID): boolean {
        try {
            const parsedRule = this.#parseRule(rule);
            if (!parsedRule) return false;

            let [left, operator, right] = parsedRule;

            let leftValue = this.#resolveValue(left, ruleContextObject, blockId);
            let rightValue = this.#resolveValue(right, ruleContextObject, blockId);

            // Handle array operations
            if (Array.isArray(leftValue)) {
                return this.#handleArrayOperation(leftValue, (item) =>
                    this.#evaluateExpression(this.#createSafeExpression(JSON.stringify(item), operator, JSON.stringify(rightValue)), ruleContextObject)
                );
            } else if (Array.isArray(rightValue)) {
                return this.#handleArrayOperation(rightValue, (item) =>
                    this.#evaluateExpression(this.#createSafeExpression(JSON.stringify(leftValue), operator, JSON.stringify(item)), ruleContextObject)
                );
            } else {
                const safeExpression = this.#createSafeExpression(JSON.stringify(leftValue), operator, JSON.stringify(rightValue));
                return this.#evaluateExpression(safeExpression, ruleContextObject);
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

    public validateRule(rule: string, blockId: UUID): boolean {
        try {
            const parsedRule = this.#parseRule(rule);
            if (!parsedRule) return false;

            const [left, operator, right] = parsedRule;

            if (operator === '=') {
                const leftIsTemp = this.#isTempVariableExpr(left, blockId);
                const rightIsTemp = this.#isTempVariableExpr(right, blockId);

                if (leftIsTemp === rightIsTemp) return false;
                if (!leftIsTemp && !this.#isValidExpression(right, blockId)) return false;
                if (!rightIsTemp && !this.#isValidExpression(left, blockId)) return false;
            } else {
                if (!this.#isValidExpression(left, blockId)) return false;
                if (!this.#isValidExpression(right, blockId)) return false;
            }

            return true;
        } catch {
            return false;
        }
    }

    #isTempVariableExpr(value: string, blockId: UUID): boolean {
        if (/^\$[A-Z]+$/.test(value)) {  // $TAG = $.tags
            return true;
        } else if (/^\$[A-Z]+\./.test(value)) {  // $SOURCE.metadata.element == 'entity'
            const parts = value.split('.');
            const varName = parts[0];
            return this.#getTempVariable(varName, blockId) &&
                parts.length > 1 &&
                parts.slice(1).every(part => /^[a-zA-Z0-9_]+$/.test(part));
        } else {
            return false;
        }
    }

    public registerTempVariable(rule: string, ruleContextObject: RuleContext, blockId: UUID): void {
        try {
            const parsedRule = this.#parseRule(rule);
            if (!parsedRule) return;

            let [left, operator, right] = parsedRule;

            if (operator === '=') {
                const leftIsTemp = this.#isTempVariableExpr(left, blockId);
                const rightIsTemp = this.#isTempVariableExpr(right, blockId);

                let value;
                if (leftIsTemp && !rightIsTemp) {
                    value = this.#resolveValue(right, ruleContextObject, blockId);
                    this.#setTempVariable(left.split('.')[0], value, blockId);
                } else if (!leftIsTemp && rightIsTemp) {
                    value = this.#resolveValue(left, ruleContextObject, blockId);
                    this.#setTempVariable(right.split('.')[0], value, blockId);
                } else {
                    throw new EvaluationError('Invalid assignment: one side must be a temporary variable');
                }
            } else {
                throw new EvaluationError('Invalid operation for variable registration: ' + operator);
            }
        } catch (error) {
            if (error instanceof EvaluationError) {
                console.error('Evaluation error:', error.message);
            } else {
                console.error('Unexpected error:', error);
            }
        }
    }

    #unregisterTempVariables(blockId: string): void {
        this.#tempVariables.delete(blockId);
    }

    public enterBlock(blockId: string): void {
        this.#blockStack.push(blockId);
    }

    public exitBlock(): void {
        if (this.#blockStack.length > 0) {
            const blockId = this.#blockStack.pop()!;
            this.#unregisterTempVariables(blockId);
        }
    }

    #setTempVariable(name: string, value: any, blockId: string): void {
        let blockVariables = this.#tempVariables.get(blockId);
        if (!blockVariables) {
            blockVariables = new Map();
            this.#tempVariables.set(blockId, blockVariables);
        }
        blockVariables.set(name, value);
    }

    #getTempVariable(name: string, blockId: string): any {
        const blockIndex = this.#blockStack.indexOf(blockId);
        if (blockIndex === -1) {
            throw new EvaluationError(`Block ${blockId} not found in the block stack`);
        }

        // Search from the current block up through parent blocks
        for (let i = blockIndex; i >= 0; i--) {
            const currentBlockId = this.#blockStack[i];
            const blockVariables = this.#tempVariables.get(currentBlockId);
            if (blockVariables && blockVariables.has(name)) {
                return blockVariables.get(name);
            }
        }

        return undefined;
    }

    public clearTempVariables(): void {
        this.#tempVariables.clear();
        this.#blockStack = [];
    }
}