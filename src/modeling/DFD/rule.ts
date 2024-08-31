import { UUID, generateUUID } from './base';
import { Element, ElementType } from './element';
import { Threat } from './threat';

type DesignItem = {
    designs?: DesignItem[];
    design?: string;
    either?: DesignItem[];
    variable?: string;
}

// Rule Type
export type Rule = {
    id: UUID;
    threat: Threat;
    element: ElementType | Element;
    designs?: DesignItem[];
    either?: DesignItem[];
    design?: string;
}

export const ruleSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['id', 'threat', 'element' ],
    properties: {
        id: { type: 'string', format: 'uuid' },
        threat: { type: 'string', format: 'uuid' },
        element: { type: 'string', enum: [ 'zone', 'entity', 'datastore', 'process', 'dataflow' ] },
        designs: { type: 'array', items: { type: 'object' } },
        either: { type: 'array', items: { type: 'object' } },
        design: { type: 'string' },
    }
};

// Build Rule
type BuildRuleOptions = {
    designs?: DesignItem[];
    either?: DesignItem[];
    design?: string;
    id?: UUID;
};

function buildRule(
    threat: Threat,
    element: Element | ElementType,
    options: BuildRuleOptions = {}
): Rule {
    const { id = generateUUID() } = options;

    const exclusiveProps: (keyof BuildRuleOptions)[] = ['designs', 'either', 'design'];
    const providedProps = exclusiveProps.filter(prop => options[prop] !== undefined);

    if (providedProps.length > 1) {
        throw new Error(`Only one of designs, either, or design can be provided. Received: ${providedProps.join(', ')}`);
    }

    const rule: Rule = {
        id,
        threat,
        element
    };

    if (options.designs !== undefined) rule.designs = options.designs;
    else if (options.either !== undefined) rule.either = options.either;
    else if (options.design !== undefined) rule.design = options.design;

    return rule;
}

export function ruleBuilder(item: Partial<Rule>): Rule {
    if (!item.threat || !item.element) {
        throw new Error('Threat and element are required');
    }

    return buildRule(
        item.threat,
        item.element,
        {
            designs: item.designs,
            either: item.either,
            design: item.design,
            id: item.id
        }
    );
}