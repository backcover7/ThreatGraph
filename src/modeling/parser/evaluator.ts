import * as mathjs from 'mathjs';

export default class Evaluator {
    private math: mathjs.MathJsInstance;

    constructor() {
        // restricted mathjs context
        this.math = mathjs.create(mathjs.all, {});

        // security configuration
        this.math.import({
            equal: mathjs.equal,
            unequal: mathjs.unequal,
            smaller: mathjs.smaller,
            larger: mathjs.larger,
            smallerEq: mathjs.smallerEq,
            largerEq: mathjs.largerEq,
            'import':     function () { throw new Error('Function import is disabled') },
            'createUnit': function () { throw new Error('Function createUnit is disabled') },
            'evaluate':   function () { throw new Error('Function evaluate is disabled') },
            'parse':      function () { throw new Error('Function parse is disabled') },
            'simplify':   function () { throw new Error('Function simplify is disabled') },
            'derivative': function () { throw new Error('Function derivative is disabled') }
        }, { override: true });
    }

    analyze(node: any, expression: string): boolean {
        const transformedExpr = String(expression)
            .replace(/([^<>!])(=)([^=])/g, '$1 equal $3')
            .replace(/<=/g, 'smallerEq')
            .replace(/>=/g, 'largerEq')
            .replace(/!=/g, 'unequal')
            .replace(/</g, 'smaller')
            .replace(/>/g, 'larger');

        const context = new Proxy({}, {
            get: (_, prop) => {
                if (typeof prop === 'string') {
                    return this.safeGet(node, prop);
                }
                return undefined;
            }
        });

        return this.evaluate(transformedExpr, context);
    }

    /**
     * This is a really sensitive function which might cause unknown security issue.
     * It is under sandbox restriction but do not RELY on the sandbox which might have unknown issue.
     * Carefully **sanitize** and **validate** untrusted data before call this function.
     *
     * @param expression
     * @param context
     */
    private evaluate(expression: string, context: Record<string, any>): boolean {
        try {
            const parsedExpr = this.math.parse(expression);
            const code = parsedExpr.compile() as mathjs.EvalFunction;
            return code.evaluate(context) as boolean;
        } catch (error) {
            throw new Error(`Evaluate design failed`);
        }
    }

    private safeGet(obj: any, path: string): any {
        return path.split('.').reduce((acc, part) => {
            if (acc && typeof acc === 'object' && part in acc) {
                return acc[part];
            }
            return undefined;
        }, obj);
    }
}